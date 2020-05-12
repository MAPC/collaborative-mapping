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

map.addControl(draw);
map.on('load', () => {
  map.on('draw.create', function (e) {
    draw.setFeatureProperty(e.features[0].id, 'user_text', 'test')
  });
  console.log(map.getStyle())
  const save = document.querySelector('#save')
  console.log(save)
  save.onclick = function(e) {
    e.preventDefault()
    var data = draw.getAll();
    console.log(data)
  }
})