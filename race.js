// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto, Mustache  */

/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */


var map = L.map('map', {
  doubleClickZoom: false 
}).setView([40.7128, -74.0060], 11);

// Add base layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png', {
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
 * Begin layer two
 */

// Initialze source data
var raceSource = new carto.source.SQL('SELECT * FROM nyc_predominantpopulation');

// Create style for the data
var raceStyle = new carto.style.CartoCSS(`
 #layer {
  polygon-fill: ramp([predominan], (#7F3C8D, #11A579, #3969AC, #F2B701, #faf7f8, #80BA5A, #E68310, #008695, #A5AA99), ("PctWhite", "Pct_Hispanic", "PctBlack", "PctAsian", "#DIV/0!", "PctIndian", "PctMixedRace", "PctOther"), "=");
    [value>=0.5]{
    polygon-opacity:0.5;
    }
    [value>=0.6]{
    polygon-opacity:0.6;
    }
    [value>=0.7]{
    polygon-opacity:0.7;
    }
    [value>=0.8]{
    polygon-opacity:0.8;
    }
    [value>=0.9]{
    polygon-opacity:0.9;
    }
}

#layer::outline {
  line-width: 0.3;
  line-color: #FFFFFF;
  line-opacity: 0.5;
}
`);

/*
[value>0.5]{
polygon-opacity:0.75;
}

[value>0.75]{
polygon-opacity:1;
}

*/

// Add style to the data
var raceLayer = new carto.layer.Layer(raceSource, raceStyle);


// Add the data to the map as a layer
client.addLayer(raceLayer);
client.getLeafletLayer().addTo(map);


/*
 * Listen for changes on the layer picker
 */

// Step 1: Find the dropdown by class. If you are using a different class, change this.
var layerPicker = document.querySelector('.layer-picker');

// Step 2: Add an event listener to the dropdown. We will run some code whenever the dropdown changes.
layerPicker.addEventListener('change', function (e) {
  // The value of the dropdown is in e.target.value when it changes
  var predominan = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (predominan === 'all') {
    // If the value is "all" then we show all of the features, unfiltered
    raceSource.setQuery("SELECT * FROM nyc_predominantpopulation");
  }
  else {
    // Else the value must be set to a life stage. Use it in an SQL query that will filter to that life stage.
    raceSource.setQuery("SELECT * FROM nyc_predominantpopulation WHERE predominan = '" + predominan + "'");
  }
  
  // Sometimes it helps to log messages, here we log the lifestage. You can see this if you open developer tools and look at the console.
  console.log('Dropdown changed to "' + predominan + '"');
});

/*
 * Begin layer three

// Initialze source data
var percentageSource = new carto.source.SQL('SELECT * FROM nyc_predominantpopulation_bypercentage');

// Create style for the data
var percentageStyle = new carto.style.CartoCSS(`
 #layer {
  polygon-fill: ramp([valuereal], (#f0f0f0, #bdbdbd, #636363), quantiles);
  polygon-opacity: 0.48;
}
#layer::outline {
  line-width: 0;
  line-color: #FFFFFF;
  line-opacity: 0.5;
}
`);

// Add style to the data
var percentageLayer = new carto.layer.Layer(percentageSource, percentageStyle);

// Add the data to the map as a layer
client.addLayer(percentageLayer);
client.getLeafletLayer().addTo(map);

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

// Add the data to the map as a layer
client.addLayer(evictionsLayer);
client.getLeafletLayer().addTo(map);


/*
 * Listen for changes on the layer picker
 */

