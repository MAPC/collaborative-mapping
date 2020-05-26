mapboxgl.accessToken = 'pk.eyJ1IjoiaWhpbGwiLCJhIjoiY2plZzUwMTRzMW45NjJxb2R2Z2thOWF1YiJ9.szIAeMS4c9YTgNsJeG36gg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ihill/cka3y91rj0v1g1inrzaetrs9e/draft',
  center: [-71.14231, 42.35887],
  zoom: 12,
});
const colors = ["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"];
const zeroColor = '#cccccc';

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
    point: true,
    line_string: true,
  },
  userProperties: true,
});

map.addControl(draw, 'top-left');
map.on('load', () => {
  map.setLayoutProperty('taz', 'visibility', 'none');
  map.setLayoutProperty('massbuilds', 'visibility', 'none');
  map.setLayoutProperty('mbta-stops', 'visibility', 'none');
  map.setLayoutProperty('mbta-routes', 'visibility', 'none');
  map.on('click', function(e) {
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
    } else {
      const clickedData = map.queryRenderedFeatures(
        [e.point.x, e.point.y],
        { layers: ['taz', 'mbta-stops', 'mbta-routes', 'massbuilds'] },
      );
      if (clickedData.some(item => item.properties.layer != null)) {
        const mbtaData = clickedData.find(item => item.properties.layer != undefined).properties;
          if (mbtaData.layer === 'Commuter-rail_stops') {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <p>${mbtaData.LINE_BRNCH}</p>
                <p>${mbtaData.STATION}</p>
              `)
              .setMaxWidth('300px')
              .addTo(map);

          } else if (mbtaData.layer === 'MBTA_nodes') {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <p>${mbtaData.LINE} ${mbtaData.ROUTE}</p>
                <p>${mbtaData.STATION}}</p>
              `)
              .setMaxWidth('300px')
              .addTo(map);
          } else if (mbtaData.layer === 'Bus_stops') {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <p>${mbtaData.STOP_NAME}</p>
              `)
              .setMaxWidth('300px')
              .addTo(map);
          } else {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <p>${mbtaData.term_name}</p>
              `)
              .setMaxWidth('300px')
              .addTo(map);
          }
      } else if (clickedData.some(item => item.properties.STATUS != null)) {
        const massbuildsData = clickedData.find(item => item.properties.STATUS != null).properties;
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <p>${massbuildsData.NAME}</p>
            <p>Status: ${massbuildsData.STATUS}</p>
            <p>Est. completion year: ${massbuildsData.YEAR_COMPL}</p>
          `)
          .setMaxWidth('300px')
          .addTo(map);
      } else {
        const tazData = clickedData.find(item => item.properties['tabular_Total Population'] != null).properties;
        new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <p>Total population: ${d3.format(',')(tazData['tabular_Total Population'])}</p>
          <p>Total households: ${d3.format(',')(tazData['tabular_Total Households'])}</p>
          <p>Total employment: ${d3.format(',')(tazData['tabular_Total Employment'])}</p>
          <p>Households with 1+ cars: ${tazData['tabular_% of Households with 1+ autos']}%</p>
          <p>Households with 1+ workers: ${tazData['tabular_% of Households with 1+ workers']}%</p>
          <p>Retail employment: ${tazData['tabular_% Retail employment']}%</p>
          <p>Service employment: ${tazData['tabular_% Service employment']}%</p>
          <p>Basic employment: ${tazData['tabular_% Basic employment']}%</p>
          <p>Trips to focus area: ${tazData['Trips_to_focus_trips_all'].toFixed(2)}</p>
        `)
        .setMaxWidth('300px')
        .addTo(map);
      }
    }
  });
})

document.querySelector('.layers').addEventListener('click', (e) => {
  const choroplethLegend = document.querySelector(".legend__choropleth");
  const massbuildsLegend = document.querySelector(".legend__massbuilds");
  const entry1 = choroplethLegend.querySelector("#legend-1");
  const entry2 = choroplethLegend.querySelector("#legend-2");
  const entry3 = choroplethLegend.querySelector("#legend-3");
  const entry4 = choroplethLegend.querySelector("#legend-4");
  const entry5 = choroplethLegend.querySelector("#legend-5");
  switch(e.target.id) {
    case 'reset':
      choroplethLegend.style.display = "none";
      massbuildsLegend.style.display = "none";
      map.setLayoutProperty('mbta-stops', 'visibility', 'none');
      map.setLayoutProperty('mbta-routes', 'visibility', 'none');
      map.setLayoutProperty('massbuilds', 'visibility', 'none');
      map.setLayoutProperty('taz', 'visibility', 'none');
      break;
    
    case 'mbta-lines':
      toggleLayer('mbta-routes');
      break;

    case 'mbta-stops':
      toggleLayer('mbta-stops')
      break;
    
    case 'massbuilds':
      massbuildsLegend.style.display = "inline";
      toggleLayer('massbuilds');
      break;

    case 'population':
      choroplethLegend.style.display = "inline";
      entry1.textContent = "1 - 999";
      entry2.textContent = "1,000 - 1,999";
      entry3.textContent = "2,000 - 2,999";
      entry4.textContent = "3,000 - 3,999";
      entry5.textContent = "4,000+";
      map.setLayoutProperty('taz', 'visibility', 'visible');
      map.setPaintProperty('taz', 'fill-color', 
        ["step",
          ['get', 'tabular_Total Population'],
          zeroColor, 1, // less than 1
          colors[0], 1000, // between 1 and 999
          colors[1], 2000, // between 1000 and 1999
          colors[2], 3000, // between 2000 and 2999
          colors[3], 4000,// between 3000 and 3999
          colors[4] // over 4000
        ]
      );
      break;

    case 'households':
      choroplethLegend.style.display = "inline";
      entry1.textContent = "1 - 499";
      entry2.textContent = "500 - 999";
      entry3.textContent = "1,000 - 1,499";
      entry4.textContent = "1,500 - 1,999";
      entry5.textContent = "2,000+";
      map.setLayoutProperty('taz', 'visibility', 'visible');
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_Total Households'],
        zeroColor, 1,
        colors[0], 500,
        colors[1], 1000,
        colors[2], 1500,
        colors[3], 2000,
        colors[4]
      ]
      );
      break;

    case 'employment':
      choroplethLegend.style.display = "inline";
      entry1.textContent = "1 - 159";
      entry2.textContent = "160 - 319";
      entry3.textContent = "320 - 549";
      entry4.textContent = "550 - 999";
      entry5.textContent = "1,000+";
      map.setLayoutProperty('taz', 'visibility', 'visible');
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_Total Employment'],
        zeroColor, 1,
        colors[0], 160,
        colors[1], 320,
        colors[2], 550,
        colors[3], 1000,
        colors[4]
      ]
      );
      break;
    
    case 'autos':
      choroplethLegend.style.display = "inline";
      entry1.textContent = `≤ 59%`;
      entry2.textContent = "60% - 69%";
      entry3.textContent = "70% - 79%";
      entry4.textContent = "80% - 89%";
      entry5.textContent = "90% - 100%";
      map.setLayoutProperty('taz', 'visibility', 'visible');
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% of Households with 1+ autos'],
        zeroColor, 1,
        colors[0], 60,
        colors[1], 70,
        colors[2], 80,
        colors[3], 90,
        colors[4]
      ]
      );
      break;

    case 'workers':
      choroplethLegend.style.display = "inline";
      entry1.textContent = "≤ 34%";
      entry2.textContent = "35% - 54%";
      entry3.textContent = "55% - 69%";
      entry4.textContent = "70% - 84%";
      entry5.textContent = "85% - 100%";
      map.setLayoutProperty('taz', 'visibility', 'visible');
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% of Households with 1+ workers'],
        zeroColor, 1,
        colors[0], 35,
        colors[1], 55,
        colors[2], 70,
        colors[3], 85,
        colors[4]
      ]
      );
      break;

    case 'retail':
      choroplethLegend.style.display = "inline";
      entry1.textContent = "1 - 5%";
      entry2.textContent = "6% - 9%";
      entry3.textContent = "10% - 14%";
      entry4.textContent = "15% - 24%";
      entry5.textContent = "≥ 25%";
      map.setLayoutProperty('taz', 'visibility', 'visible');
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% Retail employment'],
        zeroColor, 1,
        colors[0], 6,
        colors[1], 10,
        colors[2], 15,
        colors[3], 25,
        colors[4]
      ]);
      break;

    case 'service':
      choroplethLegend.style.display = "inline";
      entry1.textContent = "≤ 44%";
      entry2.textContent = "45% - 59%";
      entry3.textContent = "60% - 69%";
      entry4.textContent = "70% - 79%";
      entry5.textContent = "80% - 100%";
      map.setLayoutProperty('taz', 'visibility', 'visible');
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% Service employment'],
        zeroColor, 1,
        colors[0], 45,
        colors[1], 60,
        colors[2], 70,
        colors[3], 80,
        colors[4]
      ]);
      break;

    case 'basic':
      choroplethLegend.style.display = "inline";
      entry1.textContent = "1% - 9%";
      entry2.textContent = "10% - 19%";
      entry3.textContent = "20% - 29%";
      entry4.textContent = "30% - 39%";
      entry5.textContent = "≥ 40%";
      map.setLayoutProperty('taz', 'visibility', 'visible');
      map.setPaintProperty('taz', 'fill-color', ["step",
        ['get', 'tabular_% Basic employment'],
        zeroColor, 1,
        colors[0], 10,
        colors[1], 20,
        colors[2], 30,
        colors[3], 40,
        colors[4]
      ]);
      break;
    
    case 'trips_all':
      choroplethLegend.style.display = "inline";
      entry1.textContent = "0 - 1";
      entry2.textContent = "1 - 2";
      entry3.textContent = "2 - 4";
      entry4.textContent = "4 - 16";
      entry5.textContent = "16 - 224";
      map.setLayoutProperty('taz', 'visibility', 'visible');
      map.setPaintProperty('taz', 'fill-color',
      ["case",
        ['has', 'Trips_to_focus_trips_all'],
          ["step",
          ["to-number", ['get', 'Trips_to_focus_trips_all'], 999],
          colors[0], 1,
          colors[1], 2,
          colors[2], 4,
          colors[3], 16,
          colors[4], 224,
          zeroColor
        ],
        zeroColor
      ])
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
  const save = document.querySelector('.control__download')
  save.onclick = function(e) {
    e.preventDefault()
    var data = draw.getAll();
    if (data.features.length > 0) {
      const convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      document.getElementById('export').setAttribute('href', 'data:' + convertedData);
      document.getElementById('export').setAttribute('download','data.geojson');
      document.getElementById('export').click();
    } else {
        alert("No data drawn");
    }
  }
}

function setTitle(featureId, popupObj) {
  draw.setFeatureProperty(featureId, 'user__title', document.querySelector('#title').value);
  draw.setFeatureProperty(featureId, 'user__notes', document.querySelector('#notes').value);
  popupObj.remove();
}