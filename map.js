mapboxgl.accessToken = 'pk.eyJ1IjoiaWhpbGwiLCJhIjoiY2plZzUwMTRzMW45NjJxb2R2Z2thOWF1YiJ9.szIAeMS4c9YTgNsJeG36gg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ihill/cka3y91rj0v1g1inrzaetrs9e/draft',
  center: [-71.14231, 42.35887],
  zoom: 12,
});

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
    point: true,
    line_string: true,
  },
  userProperties: true,
  styles: [
    // Highlighted point
    {
      'id': 'highlight-active-points',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['==', 'active', 'true']],
      'paint': {
        'circle-radius': 7,
        'circle-color': '#000000'
      }
    },
    // Default point
    {
      'id': 'points-are-blue',
      'type': 'circle',
      'filter': ['all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['==', 'active', 'false']],
      'paint': {
        'circle-radius': 5,
        'circle-color': '#000088'
      }
    },
    // ACTIVE (being drawn)
    // line stroke
    {
        "id": "gl-draw-line",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
        "layout": {
          "line-cap": "round",
          "line-join": "round"
        },
        "paint": {
          "line-color": "#D20C0C",
          "line-dasharray": [0.2, 2],
          "line-width": 2
        }
    },
    // polygon fill
    {
      "id": "gl-draw-polygon-fill",
      "type": "fill",
      "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      "paint": {
        "fill-color": "#D20C0C",
        "fill-outline-color": "#D20C0C",
        "fill-opacity": 0.1
      }
    },
    // polygon outline stroke
    // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
    {
      "id": "gl-draw-polygon-stroke-active",
      "type": "line",
      "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#D20C0C",
        "line-dasharray": [0.2, 2],
        "line-width": 2
      }
    },
    // vertex point halos
    {
      "id": "gl-draw-polygon-and-line-vertex-halo-active",
      "type": "circle",
      "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
      "paint": {
        "circle-radius": 5,
        "circle-color": "#FFF"
      }
    },
    // vertex points
    {
      "id": "gl-draw-polygon-and-line-vertex-active",
      "type": "circle",
      "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
      "paint": {
        "circle-radius": 3,
        "circle-color": "#D20C0C",
      }
    },

    // INACTIVE (static, already drawn)
    // line stroke
    {
        "id": "gl-draw-line-static",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
        "layout": {
          "line-cap": "round",
          "line-join": "round"
        },
        "paint": {
          "line-color": "#000",
          "line-width": 3
        }
    },
    // polygon fill
    {
      "id": "gl-draw-polygon-fill-static",
      "type": "fill",
      "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
      "paint": {
        "fill-color": "#000",
        "fill-outline-color": "#000",
        "fill-opacity": 0.1
      }
    },
    // polygon outline
    {
      "id": "gl-draw-polygon-stroke-static",
      "type": "line",
      "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#000",
        "line-width": 3
      }
    }
  ]
});

const colors = ['#F15B52', '#F37871', '#F8B4B0', '#FBD2CF', '#F0EFE7'];
const choropleth = ['match', ['get', 'ID']];

map.addControl(draw, 'top-left');
map.on('load', () => {
  map.on('click', function() {
    const selectedFeature = draw.getSelected();
    if (selectedFeature.features.length > 0) {
      let coordinates;
      switch(selectedFeature.features[0].geometry.type) {
        case 'Point':
          coordinates = selectedFeature.features[0].geometry.coordinates;
          break;
        case 'LineString':
          coordinates = selectedFeature.features[0].geometry.coordinates[selectedFeature.features[0].geometry.coordinates.length - 1]
          break;
        case 'Polygon':
          coordinates = selectedFeature.features[0].geometry.coordinates[0][selectedFeature.features[0].geometry.coordinates.length - 1];
          break;
      }
      const popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <input type="text" id="title" placeholder="Title" class="popup__title">
          <textarea id="notes" rows="5" placeholder="Notes" class="popup__notes"></textarea>
          <button id="submit">Set</button>`
        )
        .setMaxWidth('300px')
        .addTo(map);
      
      const currentTitle = selectedFeature.features[0].properties.user__title;
      const currentNotes = selectedFeature.features[0].properties.user__notes;
      if (currentTitle) {
        document.getElementById("title").defaultValue = currentTitle
      }

      if (currentNotes) {
        document.getElementById("notes").defaultValue = currentNotes
      }

      popup.getElement().querySelector('#submit').addEventListener('click', () => {
        setTitle(selectedFeature.features[0].id, popup);
      })
    }
  });
})

document.querySelector('.layers').addEventListener('click', (e) => {
  const legend = document.querySelector(".legend");
  const entry1 = legend.querySelector("#legend-1");
  const entry2 = legend.querySelector("#legend-2");
  const entry3 = legend.querySelector("#legend-3");
  const entry4 = legend.querySelector("#legend-4");
  const entry5 = legend.querySelector("#legend-5");
  switch(e.target.id) {
    case 'reset':
      legend.style.display = "none";
      map.setPaintProperty('taz', 'fill-opacity', 0);
      break;
    
    case 'mbta':
      toggleLayer('mbta-routes');
      toggleLayer('mbta-stops');
      break;
    
    case 'massbuilds':
      break;

    case 'population':
      legend.style.display = "inline";
      entry1.textContent = "1 - 999";
      entry2.textContent = "1000 - 1999";
      entry3.textContent = "2000 - 2999";
      entry4.textContent = "3000 - 3999";
      entry5.textContent = "4000+";
      map.setPaintProperty('taz', 'fill-opacity', 1);
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_Total Population'],
        '#E8BCD9', 1, // less than 1
        '#F7FCFD', 1000, // between 1 and 1000
        '#CCECE6', 2000, // between 1000 and 2000
        '#66C2A4', 3000, // between 2000 and 3000
        '#238B45', 4000,// between 3000 and 4000
        // '#00441B', 5000, // between 4000 and 5000
        '#00441B' // over 5000
      ]);
      break;

    case 'households':
      legend.style.display = "inline";
      entry1.textContent = "1 - 500";
      entry2.textContent = "501 - 1000";
      entry3.textContent = "1001 - 1500";
      entry4.textContent = "1501 - 2000";
      entry5.textContent = "2500+";
      map.setPaintProperty('taz', 'fill-opacity', 1);
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_Total Households'],
        '#E8BCD9', 1,
        '#F7FCFD', 500,
        '#CCECE6', 1000,
        '#66C2A4', 1500,
        '#238B45', 2000,
        '#00441B', 2500,
        '#00441B'
      ]
      );
      break;

    case 'employment':
      legend.style.display = "inline";
      entry1.textContent = "1 - 160";
      entry2.textContent = "161 - 320";
      entry3.textContent = "321 - 550";
      entry4.textContent = "551 - 1000";
      entry5.textContent = "1001+";
      map.setPaintProperty('taz', 'fill-opacity', 1);
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_Total Employment'],
        '#E8BCD9', 1,
        '#F7FCFD', 160,
        '#CCECE6', 320,
        '#66C2A4', 550,
        '#238B45', 1000,
        '#00441B'
      ]
      );
      break;
    
    case 'autos':
      legend.style.display = "inline";
      map.setPaintProperty('taz', 'fill-opacity', 1);
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% of Households with 1+ autos'],
        '#E8BCD9', 1,
        '#F7FCFD', 60,
        '#CCECE6', 70,
        '#66C2A4', 80,
        '#238B45', 90,
        '#00441B'
      ]
      );
      break;

    case 'workers':
      legend.style.display = "inline";
      map.setPaintProperty('taz', 'fill-opacity', 1);
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% of Households with 1+ workers'],
        '#E8BCD9', 1,
        '#F7FCFD', 40,
        '#CCECE6', 55,
        '#66C2A4', 70,
        '#238B45', 85,
        '#00441B'
      ]
      );
      break;

    case 'retail':
      legend.style.display = "inline";
      map.setPaintProperty('taz', 'fill-opacity', 1);
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% Retail employment'],
        '#E8BCD9', 1,
        '#F7FCFD', 5,
        '#CCECE6', 9,
        '#66C2A4', 14,
        '#238B45', 24,
        '#00441B'
      ]);
      break;

    case 'service':
      legend.style.display = "inline";
      map.setPaintProperty('taz', 'fill-opacity', 1);
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% Service employment'],
        '#E8BCD9', 1,
        '#F7FCFD', 45,
        '#CCECE6', 58,
        '#66C2A4', 68,
        '#238B45', 78,
        '#00441B'
      ]);
      break;

    case 'basic':
      legend.style.display = "inline";
      map.setPaintProperty('taz', 'fill-opacity', 1);
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% Basic employment'],
        '#E8BCD9', 1,
        '#F7FCFD', 9,
        '#CCECE6', 17,
        '#66C2A4', 29,
        '#238B45', 35,
        '#00441B'
      ]);
      break;
  }
});

saveGeojson();

function toggleLayer(layerId) {
  const visibility = map.getLayoutProperty(layerId, 'visibility');
  if (visibility === 'visible' || visibility === undefined) {
    map.setLayoutProperty(layerId, 'visibility', 'none');
  } else {
    map.setLayoutProperty(layerId, 'visibility', 'visible');
  }
}

function saveGeojson() {
  const save = document.querySelector('#save')
  save.onclick = function(e) {
    e.preventDefault()
    console.log(map.getStyle().layers)
    var data = draw.getAll();
    if (data.features.length > 0) {
      const convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      document.getElementById('export').setAttribute('href', 'data:' + convertedData);
      document.getElementById('export').setAttribute('download','data.geojson');
      document.getElementById('export').click();
    } else {
        alert("Wouldn't you like to draw some data?");
    }
  }
}

function setTitle(featureId, popupObj) {
  console.log(document.querySelector('#notes').value)
  draw.setFeatureProperty(featureId, 'user__title', document.querySelector('#title').value);
  draw.setFeatureProperty(featureId, 'user__notes', document.querySelector('#notes').value);
  popupObj.remove();
}