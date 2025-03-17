// Import and filter country boundaries for Ghana
var dataset1 = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');
var roi = dataset1.filter(ee.Filter.eq('country_na', 'Nigeria'));

// Load MODIS Land Surface Temperature (LST) data
var modis = ee.ImageCollection("MODIS/061/MOD11A2")
  .select("LST_Day_1km")
  .map(function(image) {
    return image.clip(roi).multiply(0.02).subtract(273.15).copyProperties(image, ["system:time_start"]);
  });

// Create visualization parameters
var visParams = {
    min: 0, max: 50,
    palette: ["blue", "cyan", "green", "yellow", "red"]
};

// Enlarged UI Panel with subtitles and better layout
var panel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    width: '500px',  // Increased width
    padding: '10px',
    backgroundColor: '#f7f7f7',
    fontSize: '16px'
  }
});

// Section 1: Title
panel.add(ui.Label({
  value: 'MODIS Land Surface Temperature Viewer (LST)',
  style: { fontSize: '22px', fontWeight: 'bold', margin: '10px 0' }
}));

// Section 2: Year & Month Selection
panel.add(ui.Label({
  value: '1️⃣ Select Year & Month:',
  style: { fontSize: '16px', fontWeight: 'bold', margin: '5px 0' }
}));

var yearSelector = ui.Select({ placeholder: 'Loading...', disabled: true });
var monthSelector = ui.Select({ placeholder: 'Loading...', disabled: true });
panel.add(yearSelector);
panel.add(monthSelector);

// Section 3: Submit Button
panel.add(ui.Label({
  value: '2️⃣ Load Land Surface Temperature:',
  style: { fontSize: '16px', fontWeight: 'bold', margin: '5px 0' }
}));
// Add caution message about dataset availability
panel.add(ui.Label({
  value: '⚠ NB: Dataset availability starts from 2000/02/18. ' + 
         'Any date selection prior to this will not provide data.',
  style: { 
    fontSize: '14px', 
    color: 'red',  // Makes the warning stand out
    margin: '5px 0',
    fontWeight: 'bold'
  }
}));
var submitButton = ui.Button({
  label: '📊 Load LST data',
  style: { margin: '5px 0', padding: '5px' }
});
panel.add(submitButton);

// Section 4: Time Series Chart Panel
panel.add(ui.Label({
  value: '3️⃣ Click on the map for Time Series:',
  style: { fontSize: '16px', fontWeight: 'bold', margin: '5px 0' }
}));

var chartPanel = ui.Panel({
  style: {
    width: '400px',
    padding: '10px',
    backgroundColor: '#ffffff'
  }
});

// Add message on how to download time series data
panel.add(ui.Label({ 
  value: 'After selecting the year, month and loading the LST data,',
  style: { 
    fontSize: '14px', 
    color: 'blue',
    margin: '5px 0',
    fontWeight: 'bold'
  }
}));

panel.add(ui.Label({ 
  value: 'an CHIRPS LST layer (for the desired date) is shown in the map.',
  style: { 
    fontSize: '14px', 
    color: 'blue',
    margin: '5px 0',
    fontWeight: 'bold'
  }
}));

panel.add(ui.Label({ 
  value: 'To properly visualise a specific location in the study area, click on the LAYERS tab in the map section and uncheck the different layer(s).',
  style: { 
    fontSize: '14px', 
    color: 'blue',
    margin: '5px 0',
    fontWeight: 'bold'
  }
}));

panel.add(ui.Label({ 
  value: 'This provides a clear map image of the study area. Click on the specific location within the map to provide the LST time series from 2000 to 2024.',
  style: { 
    fontSize: '14px', 
    color: 'blue',
    margin: '5px 0',
    fontWeight: 'bold'
  }
}));

panel.add(ui.Label({ 
  value: 'Click on the arrow at the top right-hand corner of the time-series to open in a new window. Data can be downloaded as CSV, SVG, or PNG.',
  style: { 
    fontSize: '14px', 
    color: 'blue',
    margin: '5px 0',
    fontWeight: 'bold'
  }
}));


// Section 5: Reset Button
panel.add(ui.Label({
  value: '4️⃣ Reset Selection:',
  style: { fontSize: '16px', fontWeight: 'bold', margin: '5px 0' }
}));


// Add message on how to start of the process 
panel.add(ui.Label({
  value: 'Please it is necessary to click on the RESET Button' + 
         ' to refresh page for a new LST date selection.',
  style: { 
    fontSize: '14px', 
    color: 'blue',  // Makes the message stand out
    margin: '5px 0',
    fontWeight: 'bold'
  }
}));

//Reset Button functionality
var resetButton = ui.Button({
  label: '🔄 RESET',
  style: { margin: '5px 0', padding: '5px' },
  onClick: function() {
    Map.layers().reset(); // Clears previous layers, keeping the map itself intact
    chartPanel.clear(); // Clears the time-series chart

    // Reset dropdowns
    yearSelector.setValue(null);
    monthSelector.setValue(null);
    yearSelector.setPlaceholder('Select a year');
    monthSelector.setPlaceholder('Select a month');
    yearSelector.setDisabled(false);
    monthSelector.setDisabled(false);

// Re-center the map to the region of interest (ROI)
    Map.centerObject(roi, 6); // Center the map to the default region (Ghana)
    Map.addLayer(roi, {color: 'gray'}, 'Region of Interest'); // Add ROI layer back    
  }
});

// Creating hyperlink for MODIS Documentation 
var linkLabel1 = ui.Label({
  value: '🌍 Visit MODIS Documentation',
  style: { 
    color: 'blue', 
    textDecoration: 'underline', 
    margin: '5px 0', 
    fontSize: '14px'
  }
}).setUrl('https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD11A2');

// Creating a GRMI website hyperlink button (Creating the clickable label)
var linkLabel2 = ui.Label({
  value: '🌍 App created by GeoHazards Risk Mapping Init.,(GRMI)',
  style: { 
    color: 'blue', 
    textDecoration: 'underline', 
    margin: '5px 0', 
    fontSize: '14px'
  }
}).setUrl('https://www.georiskmap.org/');  // Sets the URL properly

panel.add(resetButton); // To add to the panel
panel.add(linkLabel1);
panel.add(linkLabel2);

// Populate dropdowns with years and months
var years = ee.List.sequence(2000, 2024);
var yearStrings = years.map(function(year) {//Years
  return ee.Number(year).format('%04d');
});


var months = ee.List.sequence(1, 12);
var monthStrings = months.map(function(month){
  return ee.Number(month).format('%02d');
});

yearStrings.evaluate(function(yearList) {
  yearSelector.items().reset(yearList);
  yearSelector.setPlaceholder('Select a year');
  yearSelector.setDisabled(false);
});

monthStrings.evaluate(function(monthList) {
  monthSelector.items().reset(monthList);
  monthSelector.setPlaceholder('Select a month');
  monthSelector.setDisabled(false);
});

// Function to load LST based on selection
var loadComposite = function() {
  var col = modis;
  var year = yearSelector.getValue();
  var month = monthSelector.getValue();
  var startDate = ee.Date.fromYMD(
    ee.Number.parse(year), ee.Number.parse(month), 1);
  var endDate = startDate.advance(1, 'month');
  var filtered = col.filter(ee.Filter.date(startDate, endDate));

  var image = ee.Image(filtered.first()).select('LST_Day_1km');
  Map.addLayer(image, visParams, 'LST: ' + year + '-' + month);
};
submitButton.onClick(loadComposite);

// Add main panel to UI
ui.root.insert(0, panel);
ui.root.insert(1, chartPanel);

// Click event to generate LST time-series chart
Map.onClick(function(coords) {
  var point = ee.Geometry.Point([coords.lon, coords.lat]);
  
  var chart = ui.Chart.image.series({
    imageCollection: modis,
    region: point,
    reducer: ee.Reducer.mean(),
    scale: 1000,
    xProperty: 'system:time_start'
  }).setOptions({
    title: 'LST Time Series',
    vAxis: { title: 'LST (°C)' },
    hAxis: { title: 'Year' }
  });
  
  chartPanel.clear();
  chartPanel.add(chart);
});

// Create a legend panel
var legend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px',
    backgroundColor: 'white'
  }
});

// Title for the legend
var legendTitle = ui.Label({
  value: 'Temperature(°C)',
  style: { fontWeight: 'bold', fontSize: '14px', margin: '0 0 4px 0' }
});

// Color categories for the legend
var colors = ["blue", "cyan", "green", "yellow", "red"];
var names = ["Below 10°C", "10°C - 20°C", "20°C - 30°C", "30°C - 40°C", "Above 40°C"];

// Function to create legend items
for (var i = 0; i < colors.length; i++) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: colors[i],
      padding: '10px',
      margin: '4px',
      width: '20px',
      height: '20px'
    }
  });

  var description = ui.Label({
    value: names[i],
    style: { margin: '4px 0 0 4px', fontSize: '12px' }
  });

  var legendItem = ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });

  legend.add(legendItem);
}

// Add title and legend to the panel
legend.add(legendTitle);
Map.add(legend);

// Default Map Settings
Map.centerObject(roi, 6);
Map.addLayer(roi, {color: 'gray'}, 'Region of Interest');
