// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto, Mustache  */

/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

var map = L.map('map', {
  doubleClickZoom: false 
}).setView([40.7128, -74.0060], 10);

// Add base layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: 'default_public',
  username: 'manonvergerio'
});

// Initialze source data
var source = new carto.source.SQL('SELECT * FROM nyc_evictions_hpd_pluto_combo');

// Create style for the data
var style = new carto.style.CartoCSS(`
  #layer {
  marker-width: 1;
  marker-fill: #000000;
  marker-fill-opacity: 0.9;
  marker-allow-overlap: true;
  marker-line-width: 0;
  marker-line-color: #FFFFFF;
  marker-line-opacity: 1;
  [zoom>=8]{
    marker-width: 0;
  }
  [zoom>=9]{
    marker-width: 1.5;
  }
 [zoom>=11][count>=1]{
    marker-width:2;
  }
  [zoom>=11][count>=5]{
    marker-width:4;
  }
  [zoom>=11][count>=15]{
    marker-width:8;
  }
  [zoom>=12][count>=1]{
    marker-width:3;
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
var layer = new carto.layer.Layer(source, style);

// Add the data to the map as a layer
client.addLayer(layer);
client.getLeafletLayer().addTo(map);

/*
 * Listen for changes on the search input
 */

// Step 1: Find the search input by class. If you are using a different class, change this.
var element = document.querySelector('.address-search');

// Step 2: Add an event listener to the input. We will run some code whenever the text changes.
element.addEventListener('keyup', function (e) {
  // The value of the input is in e.target.value when it changes
  var searchText = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (searchText === '') {
    // If the search text is empty, then we show all of the features, unfiltered
    source.setQuery("SELECT * FROM nyc_evictions_hpd_pluto_combo");
  }
  else {
    // Else use the search text in an SQL query that will filter to names with that text in it
    source.setQuery("SELECT * FROM nyc_evictions_hpd_pluto_combo WHERE address ILIKE '%" + searchText + "%'");
  }
  
  // Sometimes it helps to log messages, here we log the search text. You can see this if you open developer tools and look at the console.
  console.log('Input changed to "' + searchText + '"');
});



//displaying responses from the Pledge//

// Make SQL to get the summary data you want
var countSql = 'SELECT * FROM antieviction_pledge_responses';

var footerGroupTemplate = document.querySelector('.footer-group-template').innerHTML;

// Request the data from Carto using fetch.
// You will need to change 'brelsfoeagain' below to your username, otherwise this should work.
fetch('https://manonvergerio.carto.com/api/v2/sql/?q=' + countSql)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    // All of the data returned is in the response variable
    console.log(data);
    var content =  Mustache.render(footerGroupTemplate, data);

    // Get the sidebar container element
    var footerContainer = document.querySelector('.footer-feature-content');

    // Add the text including the sum to the sidebar
    footerContainer.innerHTML = content;
  });