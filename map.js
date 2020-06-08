mapboxgl.accessToken = 'pk.eyJ1IjoiaWhpbGwiLCJhIjoiY2plZzUwMTRzMW45NjJxb2R2Z2thOWF1YiJ9.szIAeMS4c9YTgNsJeG36gg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/ihill/cka3y91rj0v1g1inrzaetrs9e',
  center: [-71.14231, 42.35887],
  zoom: 12,
});
const colors = ["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"];
const zeroColor = '#cccccc';
window.layerType = '';

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
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
map.scrollZoom.disable();
map.on('load', () => {
  console.log(map.getStyle())
  resetMap();
  map.on('click', function(e) {
    const selectedFeature = draw.getSelected();
    if (selectedFeature.features.length > 0 || draw.getMode() === 'draw_line_string' || draw.getMode() === 'draw_polygon') {
      let coordinates;
      if (selectedFeature.features[0]) {
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
        const questionOne = selectedFeature.features[0].properties.user__question == 1 ? 'selected' : '';
        const questionTwo = selectedFeature.features[0].properties.user__question == 2 ? 'selected' : '';
        const questionThree = selectedFeature.features[0].properties.user__question == 3 ? 'selected' : '';
        const questionFour = selectedFeature.features[0].properties.user__question == 4 ? 'selected' : '';
        const currentTitle = selectedFeature.features[0].properties.user__title ? selectedFeature.features[0].properties.user__title : '';
        const currentNotes = selectedFeature.features[0].properties.user__notes ? selectedFeature.features[0].properties.user__notes : '';
        const popup = new mapboxgl.Popup()
          .setHTML(`
            <select id="question" name="question" class="popup__question">
              <option value="1" ${questionOne}>1. What are the important origins and destinations people will need to connect via West Station?</option>
              <option value="2" ${questionTwo}>2. What existing transit routes need improvements, and where?</option>
              <option value="3" ${questionThree}>3. What active transportation routes are needed?</option>
              <option value="4" ${questionFour}>4. What additional land development scenarios, zoning, parking, or other policies should we model and evaluate?</option>
            </select> 
            <input type="text" id="title" placeholder="Title" class="popup__title" value=${currentTitle}>
            <textarea id="notes" rows="5" placeholder="Notes" class="popup__notes">${currentNotes}</textarea>
            <button id="submit">Save</button>`
          )
          .setMaxWidth('300px')
          .setLngLat(coordinates)
          .addTo(map)

        popup.getElement().querySelector('#submit').addEventListener('click', () => {
          setFeatureData(selectedFeature.features[0].id, popup);
        });
      }
    } else {
      const clickedData = map.queryRenderedFeatures(
        [e.point.x, e.point.y],
        { layers: ['mbta-stops', 'West Station', 'massbuilds', 'environmental-justice', 'taz', 'trips-to-focus', 'trips-from-focus', 'transit-isochrone', 'bike-isochrone'] },
      );
  
      if (clickedData[0] && (clickedData[0].layer.id === 'mbta-stops' || clickedData[0].layer.id === 'West Station')) {
        if (clickedData[0].properties.layer === 'Commuter-rail_stops') {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <p>${clickedData[0].properties.LINE_BRNCH}</p>
              <p>${clickedData[0].properties.STATION}</p>
            `)
            .setMaxWidth('300px')
            .addTo(map);

        } else if (clickedData[0].properties.layer === 'MBTA_nodes') {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <p>${clickedData[0].properties.LINE} ${clickedData[0].properties.ROUTE}</p>
              <p>${clickedData[0].properties.STATION}</p>
            `)
            .setMaxWidth('300px')
            .addTo(map);
        } else if (clickedData[0].properties.layer === 'Bus_stops') {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <p>${clickedData[0].properties.STOP_NAME}</p>
            `)
            .setMaxWidth('300px')
            .addTo(map);
        } else {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <p>${clickedData[0].properties.term_name}</p>
            `)
            .setMaxWidth('300px')
            .addTo(map);
        }
      } else if (clickedData[0] && clickedData[0].layer.id === 'massbuilds') {
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <p>${clickedData[0].properties.NAME}</p>
            <p>Status: ${clickedData[0].properties.STATUS}</p>
            <p>Est. completion year: ${clickedData[0].properties.YEAR_COMPL}</p>
          `)
          .setMaxWidth('300px')
          .addTo(map);
      } else if (clickedData[0] && clickedData[0].layer.id === 'environmental-justice') {
        let criteriaList = '';
        if (clickedData[0].properties.ENGLISH) {
          criteriaList = `<li>English isolation: 25%+ of households have no one over the age of 14 who speaks English only or very well</li>`
        }
        if (clickedData[0].properties.INCOME) {
          criteriaList += `<li>Annual median household income is ≤65% of statewide median</li>`
        }
        if (clickedData[0].properties.MINORITY) {
          criteriaList += `<li>25%+ of residents identify as a race other than white</li>`
        }
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <ul class='popup__list'>
              ${criteriaList}
            </ul>
          `)
          .setMaxWidth('300px')
          .addTo(map);
      } else if (clickedData[0] && clickedData[0].layer.id === 'taz') {
        new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <p>Total population: ${d3.format(',')(clickedData[0].properties['tabular_Total Population'])}</p>
          <p>Total households: ${d3.format(',')(clickedData[0].properties['tabular_Total Households'])}</p>
          <p>Total employment: ${d3.format(',')(clickedData[0].properties['tabular_Total Employment'])}</p>
        `)
        .setMaxWidth('300px')
        .addTo(map);
      } else if (clickedData[0] && clickedData[0].layer.id === 'trips-to-focus') {
        let totalTrips = clickedData[0].properties['to_trips_transit']
        + clickedData[0].properties['to_trips_auto_pax']
        + clickedData[0].properties['to_trips_driver']
        + (isNaN(clickedData[0].properties['to_trips_bike']) ? 0 : clickedData[0].properties['to_trips_bike'])
        + (isNaN(clickedData[0].properties['to_trips_walk']) ? 0 : clickedData[0].properties['to_trips_walk'])

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <p>Approx. <strong>${d3.format(',.2f')(totalTrips)}</strong> trips to focus area per weekday morning (6am-9am)</p>
        `)
        .setMaxWidth('300px')
        .addTo(map);
      } else if (clickedData[0] && clickedData[0].layer.id === 'trips-from-focus') {
        let totalTrips = clickedData[0].properties['from_trips_transit']
          + clickedData[0].properties['from_trips_auto_pax']
          + clickedData[0].properties['from_trips_driver']
          + (isNaN(clickedData[0].properties['from_trips_bike']) ? 0 : clickedData[0].properties['from_trips_bike'])
          + (isNaN(clickedData[0].properties['from_trips_walk']) ? 0 : clickedData[0].properties['from_trips_walk'])

        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <p>Approx. <strong>${d3.format(',.2f')(totalTrips)}</strong> trips from focus area per weekday morning (6am-9am)</p>
          `)
          .setMaxWidth('300px')
          .addTo(map);
      } else if (clickedData[0] && clickedData[0].layer.id === 'transit-isochrone') {
        console.log(clickedData[0])
        new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <p>Time from West Station: ${clickedData[0].properties['transit_time_from_246'] == 99999 ? 'n/a' : d3.format(',.2f')(clickedData[0].properties['transit_time_from_246']) + " minutes"}</p>
          <p>Time to West Station: ${clickedData[0].properties['transit_time_to_246'] == 99999 ? 'n/a' : d3.format(',.2f')(clickedData[0].properties['transit_time_to_246']) + " minutes"}</p>
        `)
        .setMaxWidth('300px')
        .addTo(map);
      } else if (clickedData[0] && clickedData[0].layer.id === 'bike-isochrone') {
        console.log(clickedData[0])
        new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <p>Time from West Station: ${clickedData[0].properties['travel_time_from_bike'] == 99999 ? 'n/a' : d3.format(',.2f')(clickedData[0].properties['travel_time_from_bike']) + " minutes"}</p>
          <p>Time to West Station: ${clickedData[0].properties['travel_time_to_bike'] == 99999 ? 'n/a' : d3.format(',.2f')(clickedData[0].properties['travel_time_to_bike']) + " minutes"}</p>
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
  const entry0 = choroplethLegend.querySelector("#legend-0");
  const entry1 = choroplethLegend.querySelector("#legend-1");
  const entry2 = choroplethLegend.querySelector("#legend-2");
  const entry3 = choroplethLegend.querySelector("#legend-3");
  const entry4 = choroplethLegend.querySelector("#legend-4");
  const entry5 = choroplethLegend.querySelector("#legend-5");
  switch(e.target.id) {
    case 'reset':
      choroplethLegend.style.display = "none";
      massbuildsLegend.style.display = "none";
      resetMap();
      break;
    case 'focus-area':
      toggleFeatureLayer('focus-area');
      toggleFeatureLayer('focus-area-buffer');
      break;

    case 'mbta-lines':
      toggleFeatureLayer('mbta-routes');
      break;

    case 'mbta-stops':
      toggleFeatureLayer('mbta-stops')
      break;
    
    case 'massbuilds':
      if (massbuildsLegend.style.display === "inline") {
        massbuildsLegend.style.display = "none";
      } else {
        massbuildsLegend.style.display = "inline";
      }
      toggleFeatureLayer('massbuilds');
      break;
    
    case 'openspace':
      toggleFeatureLayer('openspace')
      break;

    case 'envjustice':
      toggleFeatureLayer('environmental-justice');
      break;
    
    // Demographics
    case 'population':
      choroplethLegend.style.display = "inline";
      entry0.textContent = "0";
      entry1.textContent = "1 - 999";
      entry2.textContent = "1,000 - 1,999";
      entry3.textContent = "2,000 - 2,999";
      entry4.textContent = "3,000 - 3,999";
      entry5.textContent = "4,000+";
      toggleChoroplethLayer('taz');
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
      entry0.textContent = "0";
      entry1.textContent = "1 - 499";
      entry2.textContent = "500 - 999";
      entry3.textContent = "1,000 - 1,499";
      entry4.textContent = "1,500 - 1,999";
      entry5.textContent = "2,000+";
      toggleChoroplethLayer('taz');
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
      entry0.textContent = "0";
      entry1.textContent = "1 - 159";
      entry2.textContent = "160 - 319";
      entry3.textContent = "320 - 549";
      entry4.textContent = "550 - 999";
      entry5.textContent = "1,000+";
      toggleChoroplethLayer('taz');
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
    
    // Trips to focus area
    case 'to_trips_total':
      choroplethLegend.style.display = "inline";
      entry0.textContent = "0";
      entry1.textContent = "0 - 10";
      entry2.textContent = "10 - 25";
      entry3.textContent = "25-50";
      entry4.textContent = "50 - 100";
      entry5.textContent = "100+";
      toggleChoroplethLayer('trips-to-focus');
      map.setPaintProperty('trips-to-focus', 'fill-opacity', 1);
      map.setPaintProperty('trips-to-focus', 'fill-color', ["case",
        ['has', 'to_trips_bike'],
        ["step",
          ["+", ['get', 'to_trips_transit'], ['get', 'to_trips_auto_pax'], ['get', 'to_trips_driver'], ['get', 'to_trips_bike'], ['get', 'to_trips_walk']],
          zeroColor, 0,
          colors[0], 10,
          colors[1], 25,
          colors[2], 50,
          colors[3], 100,
          colors[4]
        ],
        ["step",
            ["+", ['get', 'to_trips_transit'], ['get', 'to_trips_auto_pax'], ['get', 'to_trips_driver']],
            zeroColor, 0,
            colors[0], 10,
            colors[1], 25,
            colors[2], 50,
            colors[3], 100,
            colors[4]
          ],
        ]
      )
      break;

      // Trips from focus area
    case 'from_trips_total':
      choroplethLegend.style.display = "inline";
      entry0.textContent = "0";
      entry1.textContent = "0 - 10";
      entry2.textContent = "10 - 25";
      entry3.textContent = "25-50";
      entry4.textContent = "50 - 100";
      entry5.textContent = "100+";
      toggleChoroplethLayer('trips-from-focus');
      map.setPaintProperty('trips-from-focus', 'fill-opacity', 1);
      map.setPaintProperty('trips-from-focus', 'fill-color', ["case",
        ['has', 'from_trips_bike'],
        ["step",
          ["+", ['get', 'from_trips_transit'], ['get', 'from_trips_auto_pax'], ['get', 'from_trips_driver'], ['get', 'from_trips_bike'], ['get', 'from_trips_walk']],
          zeroColor, 0,
          colors[0], 10,
          colors[1], 25,
          colors[2], 50,
          colors[3], 100,
          colors[4]
        ],
        ["step",
            ["+", ['get', 'from_trips_transit'], ['get', 'from_trips_auto_pax'], ['get', 'from_trips_driver']],
            zeroColor, 0,
            colors[0], 10,
            colors[1], 25,
            colors[2], 50,
            colors[3], 100,
            colors[4]
          ],
        ]
      )
      break;
      
      // Isochrones
    case 'transit_from_west_station':
      choroplethLegend.style.display = "inline";
      entry0.textContent = "NA";
      entry1.textContent = "≤ 15 minutes";
      entry2.textContent = "15 - 30 minutes";
      entry3.textContent = "30 - 45 minutes";
      entry4.textContent = "45 - 60 minutes";
      entry5.textContent = "60+ minutes";
      toggleChoroplethLayer('transit-isochrone');
      map.setPaintProperty('transit-isochrone', 'fill-color', ["step",
        ['get', 'transit_time_from_246'],
        colors[0], 16,
        colors[1], 31,
        colors[2], 46,
        colors[3], 61,
        colors[4], 99998,
        zeroColor
      ]);
      break;

    case 'transit_to_west_station':
      choroplethLegend.style.display = "inline";
      entry0.textContent = "NA";
      entry1.textContent = "≤ 15 minutes";
      entry2.textContent = "15 - 30 minutes";
      entry3.textContent = "30 - 45 minutes";
      entry4.textContent = "45 - 60 minutes";
      entry5.textContent = "60+ minutes";
      toggleChoroplethLayer('transit-isochrone');
      map.setPaintProperty('transit-isochrone', 'fill-color', ["step",
        ['get', 'transit_time_to_246'],
        colors[0], 16,
        colors[1], 31,
        colors[2], 46,
        colors[3], 61,
        colors[4], 99998,
        zeroColor
      ]);
      break;

    case 'bike_from_west_station':
      choroplethLegend.style.display = "inline";
      entry0.textContent = "NA";
      entry1.textContent = "≤ 15 minutes";
      entry2.textContent = "15 - 30 minutes";
      entry3.textContent = "30 - 45 minutes";
      entry4.textContent = "45 - 60 minutes";
      entry5.textContent = "60+ minutes";
      toggleChoroplethLayer('bike-isochrone');
      map.setPaintProperty('bike-isochrone', 'fill-color', ["step",
        ['get', 'travel_time_from_bike'],
        colors[0], 16,
        colors[1], 31,
        colors[2], 46,
        colors[3], 61,
        colors[4], 99998,
        zeroColor
      ]);
      break;

    case 'bike_to_west_station':
      choroplethLegend.style.display = "inline";
      entry0.textContent = "NA";
      entry1.textContent = "≤ 15 minutes";
      entry2.textContent = "15 - 30 minutes";
      entry3.textContent = "30 - 45 minutes";
      entry4.textContent = "45 - 60 minutes";
      entry5.textContent = "60+ minutes";
      toggleChoroplethLayer('bike-isochrone');
      map.setPaintProperty('bike-isochrone', 'fill-color', ["step",
        ['get', 'travel_time_to_bike'],
        colors[0], 16,
        colors[1], 31,
        colors[2], 46,
        colors[3], 61,
        colors[4], 99998,
        zeroColor
      ]);
      break;
  }
});

saveGeojson();

function toggleFeatureLayer(layerId) {
  const visibility = map.getLayoutProperty(layerId, 'visibility');
  if (visibility === 'visible' || visibility === undefined) {
    map.setLayoutProperty(layerId, 'visibility', 'none');
  } else {
    map.setLayoutProperty(layerId, 'visibility', 'visible');
  }
}

function resetMap() {
  map.setLayoutProperty('massbuilds', 'visibility', 'none');
  map.setLayoutProperty('mbta-stops', 'visibility', 'none');
  map.setLayoutProperty('mbta-routes', 'visibility', 'none');
  map.setLayoutProperty('focus-area', 'visibility', 'none');
  map.setLayoutProperty('focus-area-buffer', 'visibility', 'none');
  map.setLayoutProperty('openspace', 'visibility', 'none');
  map.setLayoutProperty('taz', 'visibility', 'none');
  map.setLayoutProperty('trips-to-focus', 'visibility', 'none');
  map.setLayoutProperty('trips-from-focus', 'visibility', 'none');
  map.setLayoutProperty('transit-isochrone', 'visibility', 'none');
  map.setLayoutProperty('bike-isochrone', 'visibility', 'none');
  map.setLayoutProperty('environmental-justice', 'visibility', 'none');
}

function toggleChoroplethLayer(selectedLayer) {
  const layers = ['taz', 'trips-to-focus', 'trips-from-focus', 'transit-isochrone', 'bike-isochrone'];
  layers.forEach((layer) => {
    if (layer === selectedLayer) {
      map.setLayoutProperty(layer, 'visibility', 'visible');
    } else {
      map.setLayoutProperty(layer, 'visibility', 'none');
    }
  })
}

function saveGeojson() {
  const save = document.querySelector('.control__download')
  const timestamp = new Date();
  const fileName = `data__${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getFullYear()}.geojson`
  save.onclick = function(e) {
    e.preventDefault()
    var data = draw.getAll();
    if (data.features.length > 0) {
      const convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      document.getElementById('export').setAttribute('href', 'data:' + convertedData);
      document.getElementById('export').setAttribute('download', fileName);
      document.getElementById('export').click();
    } else {
        alert("No data drawn");
    }
  }
}

function setFeatureData(featureId, popupObj) {
  const options = document.querySelector("#question").options
  let selectedQuestion;
  for (let i = 0; i < options.length; i++) {
    if (options[i].selected) {
      selectedQuestion = options[i].value
    }
  }
  draw.setFeatureProperty(featureId, 'user__question', selectedQuestion);
  draw.setFeatureProperty(featureId, 'user__title', document.querySelector('#title').value);
  draw.setFeatureProperty(featureId, 'user__notes', document.querySelector('#notes').value);
  popupObj.remove();
}