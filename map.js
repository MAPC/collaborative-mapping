mapboxgl.accessToken = 'pk.eyJ1IjoiaWhpbGwiLCJhIjoiY2plZzUwMTRzMW45NjJxb2R2Z2thOWF1YiJ9.szIAeMS4c9YTgNsJeG36gg';
const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/ihill/cka3y91rj0v1g1inrzaetrs9e/draft', //hosted style id
  center: [-71.14231, 42.35887], // starting position
  zoom: 12, // starting zoom
});

const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
    point: true,
    line_string: true,
  },
  userProperties: true
});

map.addControl(draw, 'top-left');
map.on('load', () => {
  map.on('draw.create', function (e) {
    let coordinates;
    switch(draw.getMode()) {
      case 'draw_point':
        coordinates = e.features[0].geometry.coordinates;
        break;
      case 'draw_line_string':
        coordinates = e.features[0].geometry.coordinates[e.features[0].geometry.coordinates.length - 1];
        break;
      case 'draw_polygon':
        coordinates = e.features[0].geometry.coordinates[0][e.features[0].geometry.coordinates.length - 1];
        break;
    }
    
    const popup = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(coordinates)
      .setHTML(`
        <input type="text" id="myText" placeholder="Title here">
        <button id="submit">Set</button>`
      )
      .addTo(map);
    popup.getElement().querySelector('#submit').addEventListener('click', () => {
      setTitle(e.features[0].id, popup);
    })
  });

  const save = document.querySelector('#save')
  save.onclick = function(e) {
    e.preventDefault()
    var data = draw.getAll();
    console.log(data)
  }
})


function setTitle(featureId, popupObj) {
  draw.setFeatureProperty(featureId,'user__title',document.querySelector('#myText').value);
  popupObj.remove();
}