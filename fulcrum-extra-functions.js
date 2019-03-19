// Functions to find the distance between two GPS coordonates

function distanceInCmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusCm = 637816000;
  var dLat = RADIANS(lat2-lat1);
  var dLon = RADIANS(lon2-lon1);
  lat1 = RADIANS(lat1);
  lat2 = RADIANS(lat2);
  var a = SIN(dLat/2) * SIN(dLat/2) +
          SIN(dLon/2) * SIN(dLon/2) * COS(lat1) * COS(lat2); 
  var c = 2 * Math.atan2(SQRT(a), SQRT(1-a)); 
  return earthRadiusCm * c;
}

function nearestPointToA(a,b,c){
  var ab = distanceInCmBetweenEarthCoordinates(a.lat,a.lon,b.lat,b.lon);
  var ac = distanceInCmBetweenEarthCoordinates(a.lat,a.lon,c.lat,c.lon);
  if (ac<ab){
    return c;
  } else if (ab<ac){
    return b;
  } else {
    return a;
  }
}

function existGPS(a){
  if (EXISTS(a.lat) && EXISTS(a.lon)){
    return true;
  }
  return false;
}

function testGPSNotNull(a,b,c){
  if (existGPS(a) && existGPS(b) && existGPS(c)){
    return nearestPointToA(a,b,c);
  }
}

function valueOrNull(a){
  if (EXISTS(a)){
    return a;
  }
  return null;  
}

function createGPS(lati,long,alti,accu){
  var gps = {};
  gps.lat = valueOrNull(lati);
  gps.lon = valueOrNull(long);
  gps.alt = valueOrNull(alti);
  gps.acc = valueOrNull(accu);
  return gps;
}

//Function get accuracy value no matters from where

function accuracyNoMatters(){
  if (EXISTS(CONFIG().recordHorizontalAccuracy)){
    return CONFIG().recordHorizontalAccuracy;
  }
  if (EXISTS(CONFIG().recordUpdatedAccuracy)){
    return CONFIG().recordUpdatedAccuracy;
  }
  if (EXISTS(CONFIG().recordCreatedAccuracy)){
    return CONFIG().recordCreatedAccuracy;
  }
  if (EXISTS(CONFIG().featureCreatedAccuracy)){
    return CONFIG().featureCreatedAccuracy;
  }
  if (EXISTS(CONFIG().featureUpdatedAccuracy)) {
    return CONFIG().featureUpdatedAccuracy;
  }
  return "No accuracy available";
}


function updateLocationInfo() {
  // get the current device location
  var location = CURRENTLOCATION();

  // if there is no location, display a special message
  if (!location) {
    SETLABEL('gps_info', 'No Location Available');
    return;
  }

  // format the display of the location data
  var message = [
    'Latitude: ' + location.latitude,
    'Longitude: ' + location.longitude,
    'Accuracy: ' + location.accuracy,
    'Altitude: ' + location.altitude,
    'Course: ' + location.course,
    'Speed: ' + location.speed,
    'Time: ' + new Date(location.timestamp * 1000).toLocaleString()
  ].join('\n');

  // set the label property of the label on the form
  SETLABEL('gps_info', message);
}


ON('change', '', function (event) {
  // Do something interesting when the cover_type field changes.
});

// Display _horizontal_accuracy in horizontal_accuracy
ON('change-geometry', function (event) {
  SETVALUE('accuracy',accuracyNoMatters());
  SETVALUE('test_hello','hello');
  
  
  
  SETVALUE('x','45.000000');
  SETVALUE('test_change_location', 'yes');
});

function callback(event) {
  if (event.name === 'change-geometry') {
    SETVALUE('accuracy',accuracyNoMatters());
    SETVALUE('test_hello','hello');
  }
  
  if (event.name === 'load-record') {
    // go ahead and update it now...
    updateLocationInfo();

    // ... and every 3 seconds
    SETINTERVAL(updateLocationInfo, 3000);

  }
  
  // Assign identifier name and today's date when scientific name is changed
  // and clear previous values
  if (event.name === 'change' && event.field === 'scientific_name'){
    var username = USERFULLNAME()
    var today = Date()
    if (!ISBLANK($scientific_name)) {
      SETVALUE('identified_by', username);
      SETVALUE('date_identified', today);
      SETVALUE('identification_protocol', null);
      SETVALUE('identification_references', null);
      SETVALUE('identification_qualifier', null);
      SETVALUE('identification_remarks', null);
    }
    else {
      SETVALUE('identified_by', null);
      SETVALUE('date_identified', null);
      SETVALUE('identification_protocol', null);
      SETVALUE('identification_references', null);
      SETVALUE('identification_qualifier', null);
      SETVALUE('identification_remarks', null);
    }
  }
  
  // Assign measurer name as default user
  if (event.name === 'new-repeatable' &&  event.field === 'size_measurements') {
    var username = USERFULLNAME();
    SETVALUE('measured_by', username);
  });

  // Assign plant ID using timestamp with 8 characters
  // Assign observed name as default user
  if (event.name === 'new-record') {
    var timenow = ONCE(FLOOR((Date.now() - 1519142458000) / 1000)); 
    SETVALUE('plant_id', timenow);
    var username = USERFULLNAME(); 
    SETVALUE('first_observed_by', username);
  });

  // Projet validation
  if (event.name === 'validate-record') {
    /*
    var updateLocationInfo = function() {
      // get the current device location
      var location = CURRENTLOCATION();

      // if there is no location, display a special message
      if (!location) {
        SETLABEL('gps_info', 'No Location Available');
        return;
      }

      // format the display of the location data
      var message = [
        'Latitude: ' + location.latitude,
        'Longitude: ' + location.longitude,
        'Accuracy: ' + location.accuracy,
        'Altitude: ' + location.altitude,
        'Course: ' + location.course,
        'Speed: ' + location.speed,
        'Time: ' + new Date(location.timestamp * 1000).toLocaleString()
      ].join('\n');

      // set the label property of the label on the form
      ALERT(message);
    };

    // go ahead and update it now...
    updateLocationInfo();
    */
    /*
    ALERT(">"+INSPECT(CONFIG().featureCreatedAccuracy));
    ALERT(">"+INSPECT(CONFIG().featureCreatedAltitude));
    ALERT(">"+INSPECT(CONFIG().featureCreatedLatitude));
    ALERT(">"+INSPECT(CONFIG().featureCreatedLongitude));
    ALERT(">"+INSPECT(CONFIG().featureGeometry.coordinates)); // 0=longitude;1=latitude;3=?? (guess is point number)
    ALERT(">"+INSPECT(CONFIG().featureGeometry.type)); // Point, ??
    ALERT(">"+INSPECT(CONFIG().featureUpdatedAccuracy));
    ALERT(">"+INSPECT(CONFIG().featureUpdatedAltitude));
    ALERT(">"+INSPECT(CONFIG().featureUpdatedLatitude));
    ALERT(">"+INSPECT(CONFIG().featureUpdatedLongitude));

    ALERT(">"+INSPECT(CONFIG().recordAltitude));
    ALERT(">"+INSPECT(CONFIG().recordGeometry));
    ALERT(">"+INSPECT(CONFIG().recordGeometry.type)); // Point, ??
    ALERT(">"+INSPECT(CONFIG().recordGeometry.coordinates)); // 0=longitude;1=latitude;3=?? (guess is point number)
    ALERT(">"+INSPECT(CONFIG().recordHorizontalAccuracy));
    ALERT(">"+INSPECT(CONFIG().recordVerticalAccuracy));

    ALERT(">"+INSPECT(CONFIG().recordUpdatedAccuracy));
    ALERT(">"+INSPECT(CONFIG().recordUpdatedAltitude));
    ALERT(">"+INSPECT(CONFIG().recordUpdatedLatitude));
    ALERT(">"+INSPECT(CONFIG().recordUpdatedLongitude));

    ALERT(">"+INSPECT(CONFIG().recordCreatedAccuracy));
    ALERT(">"+INSPECT(CONFIG().recordCreatedAltitude));
    ALERT(">"+INSPECT(CONFIG().recordCreatedLatitude));
    ALERT(">"+INSPECT(CONFIG().recordCreatedLongitude));


    */
    //ALERT(">"+INSPECT(CONFIG()));

    if (!PROJECTNAME()) {
      INVALID('Select a project before saving.');
    }
  });


}

ON('load-record', callback);
ON('change-geometry', callback);
ON('change', 'scientific_name', callback);
ON('new-repeatable', 'size_measurements', callback);
ON('new-record', callback);
ON('validate-record', callback);


// Functions to find the distance between two GPS coordonates

function distanceInCmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusCm = 637816000;
  var dLat = RADIANS(lat2-lat1);
  var dLon = RADIANS(lon2-lon1);
  lat1 = RADIANS(lat1);
  lat2 = RADIANS(lat2);
  var a = SIN(dLat/2) * SIN(dLat/2) +
          SIN(dLon/2) * SIN(dLon/2) * COS(lat1) * COS(lat2); 
  var c = 2 * Math.atan2(SQRT(a), SQRT(1-a)); 
  return earthRadiusCm * c;
}

function nearestPointToA(a,b,c){
  var ab = distanceInCmBetweenEarthCoordinates(a.lat,a.lon,b.lat,b.lon);
  var ac = distanceInCmBetweenEarthCoordinates(a.lat,a.lon,c.lat,c.lon);
  if (ac<ab){
    return c;
  } else if (ab<ac){
    return b;
  } else {
    return a;
  }
}

function existGPS(a){
  if (EXISTS(a.lat) && EXISTS(a.lon)){
    return true;
  }
  return false;
}

function testGPSNotNull(a,b,c){
  if (existGPS(a) && existGPS(b) && existGPS(c)){
    return nearestPointToA(a,b,c);
  }
}

function valueOrNull(a){
  if (EXISTS(a)){
    return a;
  }
  return null;  
}

function createGPS(lati,long,alti,accu){
  var gps = {};
  gps.lat = valueOrNull(lati);
  gps.lon = valueOrNull(long);
  gps.alt = valueOrNull(alti);
  gps.acc = valueOrNull(accu);
  return gps;
}

//Function get accuracy value no matters from where

function accuracyNoMatters(){
  if (EXISTS(CONFIG().recordHorizontalAccuracy)){
    return CONFIG().recordHorizontalAccuracy;
  }
  if (EXISTS(CONFIG().recordUpdatedAccuracy)){
    return CONFIG().recordUpdatedAccuracy;
  }
  if (EXISTS(CONFIG().recordCreatedAccuracy)){
    return CONFIG().recordCreatedAccuracy;
  }
  if (EXISTS(CONFIG().featureCreatedAccuracy)){
    return CONFIG().featureCreatedAccuracy;
  }
  if (EXISTS(CONFIG().featureUpdatedAccuracy)) {
    return CONFIG().featureUpdatedAccuracy;
  }
  return "No accuracy available";
}


function updateLocationInfo() {
  // get the current device location
  var location = CURRENTLOCATION();

  // if there is no location, display a special message
  if (!location) {
    SETLABEL('gps_info', 'No Location Available');
    return;
  }

  // format the display of the location data
  var message = [
    'Latitude: ' + location.latitude,
    'Longitude: ' + location.longitude,
    'Accuracy: ' + location.accuracy,
    'Altitude: ' + location.altitude,
    'Course: ' + location.course,
    'Speed: ' + location.speed,
    'Time: ' + new Date(location.timestamp * 1000).toLocaleString()
  ].join('\n');

  // set the label property of the label on the form
  SETLABEL('gps_info', message);
}


/*
ON('change', '', function (event) {
  // Do something interesting when the cover_type field changes.
});
*/
/*
// Display _horizontal_accuracy in horizontal_accuracy
ON('change-geometry', function (event) {
  SETVALUE('accuracy',accuracyNoMatters());
  SETVALUE('test_hello','hello');
  
  
  
  SETVALUE('x','45.000000');
  SETVALUE('test_change_location', 'yes');
});
*/

function callback(event) {
  if (event.name === 'change-geometry') {
    SETVALUE('accuracy',accuracyNoMatters());
    SETVALUE('test_hello','hello');
  }
  
  if (event.name === 'load-record') {
    // go ahead and update it now...
    updateLocationInfo();

    // ... and every 3 seconds
    SETINTERVAL(updateLocationInfo, 3000);

  }
  
  // Assign identifier name and today's date when scientific name is changed
  // and clear previous values
  if (event.name === 'change' && event.field === 'scientific_name'){
    var username = USERFULLNAME()
    var today = Date()
    if (!ISBLANK($scientific_name)) {
      SETVALUE('identified_by', username);
      SETVALUE('date_identified', today);
      SETVALUE('identification_protocol', null);
      SETVALUE('identification_references', null);
      SETVALUE('identification_qualifier', null);
      SETVALUE('identification_remarks', null);
    }
    else {
      SETVALUE('identified_by', null);
      SETVALUE('date_identified', null);
      SETVALUE('identification_protocol', null);
      SETVALUE('identification_references', null);
      SETVALUE('identification_qualifier', null);
      SETVALUE('identification_remarks', null);
    }
  }
  
  // Assign measurer name as default user
  if (event.name === 'new-repeatable' &&  event.field === 'size_measurements') {
    var username = USERFULLNAME();
    SETVALUE('measured_by', username);
  });

  // Assign plant ID using timestamp with 8 characters
  // Assign observed name as default user
  if (event.name === 'new-record') {
    var timenow = ONCE(FLOOR((Date.now() - 1519142458000) / 1000)); 
    SETVALUE('plant_id', timenow);
    var username = USERFULLNAME(); 
    SETVALUE('first_observed_by', username);
  });

  // Projet validation
  if (event.name === 'validate-record') {
    /*
    var updateLocationInfo = function() {
      // get the current device location
      var location = CURRENTLOCATION();

      // if there is no location, display a special message
      if (!location) {
        SETLABEL('gps_info', 'No Location Available');
        return;
      }

      // format the display of the location data
      var message = [
        'Latitude: ' + location.latitude,
        'Longitude: ' + location.longitude,
        'Accuracy: ' + location.accuracy,
        'Altitude: ' + location.altitude,
        'Course: ' + location.course,
        'Speed: ' + location.speed,
        'Time: ' + new Date(location.timestamp * 1000).toLocaleString()
      ].join('\n');

      // set the label property of the label on the form
      ALERT(message);
    };

    // go ahead and update it now...
    updateLocationInfo();
    */
    /*
    ALERT(">"+INSPECT(CONFIG().featureCreatedAccuracy));
    ALERT(">"+INSPECT(CONFIG().featureCreatedAltitude));
    ALERT(">"+INSPECT(CONFIG().featureCreatedLatitude));
    ALERT(">"+INSPECT(CONFIG().featureCreatedLongitude));
    ALERT(">"+INSPECT(CONFIG().featureGeometry.coordinates)); // 0=longitude;1=latitude;3=?? (guess is point number)
    ALERT(">"+INSPECT(CONFIG().featureGeometry.type)); // Point, ??
    ALERT(">"+INSPECT(CONFIG().featureUpdatedAccuracy));
    ALERT(">"+INSPECT(CONFIG().featureUpdatedAltitude));
    ALERT(">"+INSPECT(CONFIG().featureUpdatedLatitude));
    ALERT(">"+INSPECT(CONFIG().featureUpdatedLongitude));

    ALERT(">"+INSPECT(CONFIG().recordAltitude));
    ALERT(">"+INSPECT(CONFIG().recordGeometry));
    ALERT(">"+INSPECT(CONFIG().recordGeometry.type)); // Point, ??
    ALERT(">"+INSPECT(CONFIG().recordGeometry.coordinates)); // 0=longitude;1=latitude;3=?? (guess is point number)
    ALERT(">"+INSPECT(CONFIG().recordHorizontalAccuracy));
    ALERT(">"+INSPECT(CONFIG().recordVerticalAccuracy));

    ALERT(">"+INSPECT(CONFIG().recordUpdatedAccuracy));
    ALERT(">"+INSPECT(CONFIG().recordUpdatedAltitude));
    ALERT(">"+INSPECT(CONFIG().recordUpdatedLatitude));
    ALERT(">"+INSPECT(CONFIG().recordUpdatedLongitude));

    ALERT(">"+INSPECT(CONFIG().recordCreatedAccuracy));
    ALERT(">"+INSPECT(CONFIG().recordCreatedAltitude));
    ALERT(">"+INSPECT(CONFIG().recordCreatedLatitude));
    ALERT(">"+INSPECT(CONFIG().recordCreatedLongitude));


    */
    //ALERT(">"+INSPECT(CONFIG()));


  //var dataNames = PLUCK(FIELD('test').elements, 'key');
  //ALERT(">"+INSPECT($test_values.parentNode));
  //ALERT(">"+INSPECT(this.getRecord("03afc144-0c25-49d0-b9eb-691c7ab77f03")));
  //ALERT(">"+INSPECT(this.featureCreatedAt));

  //var conf = INSPECT(CONFIGURE());
  //ALERT("<"+conf);
  //var confJSON = JSON.stringify(conf);
  //ALERT("<"+confJSON['record_count_local']);
  //ALERT(">"+INSPECT(conf.elements));
  //ALERT(">>"+INSPECT(conf.script));
  //ALERT(">>>"+INSPECT(conf.record_count_local));

  //var selections = PLUCK($test_values,'record_id') || [];


    //ALERT(">"+VALUE($test_values)+"<");
    //ALERT(">"+INSPECT(FIELD('test').elements)+"<");
    //ALERT(">"+INSPECT(dataNames)+"<");
    //ALERT(">"+INSPECT(selections)+"<");
    //ALERT(">"+INSPECT(DATANAMES())+"<");
    //ALERT(">"+INSPECT($test_values)+"<");
    //ALERT(">"+ARRAY($test_values)+"<");
    //ALERT(">"+$test_name+"<");


function getSizeOfBoundaries() {
  if ($boundaries != null){
    return LEN(ARRAY(REPEATABLEVALUES($boundaries, 'boundary')));
  } else {
    return 0;
  }
}



function allRequieredFieldsHere(){
  var list = ["site_id_check","latitude"];
  
  for (var t in list) {
    if (VALUE(t) == ""){
      return false;
    }
  }
  return true;
}


    if (!PROJECTNAME()) {
      INVALID('Select a project before saving.');
    }
  }


}

ON('load-record', callback);
ON('change-geometry', callback);
ON('change', 'scientific_name', callback);
ON('new-repeatable', 'size_measurements', callback);
ON('new-record', callback);
ON('validate-record', callback);


/*
* getNumOfSizeMeasurementsFor('measured_by');
*   ALERT(REPEATABLEVALUES($size_measurements, 'measurement_type').map(CHOICEVALUES));
    ALERT(REPEATABLEVALUES($size_measurements, 'measurement_type'));

    var t = {};
    var i = 0;
    var o = REPEATABLEVALUES($size_measurements, 'measurement_type');
    //ALERT(INSPECT(o));
    
    o.forEach(function(element) {
      if(!EXISTS(element) || element=='' || !element){
        t[i]="";
      } else {
        t[i]=element.choice_values;
      }
      i+=1;
      //ALERT(INSPECT(element.choice_values));
    });
    //ALERT(INSPECT(t));
    //ALERT(Object.keys(t).length);
    //ALERT(i);
    for (var y=0; y<i;y++){
      if (CONTAINS(t[y],'DBH')){
        ALERT(y+' contains DBH');
      }
    }

    var t = {};
    var i = 0;
    var o = REPEATABLEVALUES($size_measurements, 'measurement_type');
    ALERT(INSPECT(o));
    o.forEach(function(element) {
      if(!EXISTS(element) || element=='' || !element){
        t[i]="";
      } else if(EXISTS(element.choice_values)){
        t[i]=element.choice_values;
      } else {
        t[i]=element;
      }
      i+=1;
      //ALERT(INSPECT(element.choice_values));
    });
    ALERT(INSPECT(t));
    //ALERT(Object.keys(t).length);
    //ALERT(i);
    /*
    for (var y=0; y<i;y++){
      if (CONTAINS(t[y],'DBH')){
        ALERT(y+' contains DBH');
      }
    }
*/
