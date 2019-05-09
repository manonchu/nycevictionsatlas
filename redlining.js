// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto */

// prints "hi" in the browser's dev tools console
console.log('hi');

// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto */

var map = L.map('map', {
  center: [40.695217, -73.977127],
  zoom: 11
});

// Add base layer
L.tileLayer('https://api.mapbox.com/styles/v1/vergm509/cjucunjmm130s1fpdck1pq19t/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidmVyZ201MDkiLCJhIjoiY2pudnlhenVyMWtudjNycHI1ZnFtdzRrbSJ9.ZAQtqItDVvx8BV7T7k2qYg', {
  maxZoom: 18
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: 'default_public',
  username: 'manonvergerio'
});

/*
 * Whenever you create a layer, you'll need three things:
 *  1. A source.
 *  2. A style.
 *  3. A layer.
 *
 * Here we create each of the above twice with different settings to add two layers to our map.
 */

/*
 * Begin layer one
 */

// Initialze source data
var evictionsSource = new carto.source.SQL('SELECT * FROM nyc_evictions_hpd_pluto_combo');

// Create style for the data
var evictionsStyle = new carto.style.CartoCSS(`
 #layer {
  marker-width: 1;
  marker-fill: #000000;
  marker-fill-opacity: 0.9;
  marker-allow-overlap: true;
  marker-line-width: 0;
  marker-line-color: #FFFFFF;
  marker-line-opacity: 1;
  [zoom>=10]{
    marker-width: 0;
  }
  [zoom>=11]{
    marker-width: 1.5;
  }
  [zoom>=12][count>=1]{
    marker-width:2;
  }
  [zoom>=12][count>=5]{
    marker-width:6;
  }
  [zoom>=12][count>=15]{
    marker-width:12;
  }
  [zoom>=13][count>=1]{
    marker-width:3;
  }
  [zoom>=13][count>=5]{
    marker-width:9;
  }
  [zoom>=13][count>=15]{
    marker-width:18;
  }
  [zoom>=14][count>=1]{
    marker-width:5;
  }
  [zoom>=14][count>=5]{
    marker-width:15;
  }
  [zoom>=14][count>=15]{
    marker-width:30;
  }
  [zoom>=15][count>=1]{
    marker-width:10;
  }
  [zoom>=15][count>=5]{
    marker-width:30;
  }
  [zoom>=15][count>=15]{
    marker-width:60;
  }
   [zoom>=16][count>=1]{
    marker-width:20;
  }
  [zoom>=16][count>=5]{
    marker-width:60;
  }
  [zoom>=16][count>=15]{
    marker-width:120;
  }
}
`);

// Add style to the data
var evictionsLayer = new carto.layer.Layer(evictionsSource, evictionsStyle);

// Note: any column you want to show up in the popup needs to be in the list of
// featureClickColumns below
var evictionsLayer = new carto.layer.Layer(evictionsSource, evictionsStyle, {
  featureClickColumns: ['address', 'count', 'headoffice']
});

evictionsLayer.on('featureClicked', function (event) {
  // Create the HTML that will go in the popup. event.data has all the data for 
  // the clicked feature.
  //
  // I will add the content line-by-line here to make it a little easier to read.
  var content = '<h3>' + event.data['headoffice'] + '</h3>';
  content += '<h4>'+'<div> evicted ' + event.data['count'] + ' household(s) '  +'</h4>'+'<h4-black>' + 'from '+ event.data['address'] + ' in 2018. </div>'+'</h4-black>';

  // If you're not sure what data is available, log it out:
  console.log(event.data);
  
  var popup = L.popup();
  popup.setContent(content);
  
  // Place the popup and open it
  popup.setLatLng(event.latLng);
  popup.openOn(map);
});

/*
 * Begin layer two
 */

// Initialze source data
var holcSource = new carto.source.Dataset('holc_all');

// Create style for the data
var holcStyle = new carto.style.CartoCSS(`
  #layer {
  polygon-fill: ramp([holc_grade], (#f7e96d, #d9726b, #55979c, #438b31, #7C7C7C), ("C", "D", "B", "A"), "=");
  }  
  #layer::outline {
  line-width: 1;
  line-color: #FFFFFF;
  line-opacity: 0.5;
}
`);

// Add style to the data
var holcLayer = new carto.layer.Layer(holcSource, holcStyle);


// Add the data to the map as two layers. Order matters here--first one goes on the bottom
client.addLayers([holcLayer, evictionsLayer]);
client.getLeafletLayer().addTo(map);

// Keep track of whether the boroughs layer is currently visible
var evictionsVisible = true;

// When the boroughs button is clicked, show or hide the layer
var evictionsButton = document.querySelector('.toggle-evictions');
evictionsButton.addEventListener('click', function () {
  if (evictionsVisible) {
    // Boroughs are visible, so remove that layer
    client.removeLayer(evictionsLayer);
    
    // Then update the variable tracking whether the layer is shown
    evictionsVisible = false;
  }
  else {
    // Do the reverse if boroughs are not visible
    client.addLayer(evictionsLayer);
    evictionsVisible = true;
  }
});
