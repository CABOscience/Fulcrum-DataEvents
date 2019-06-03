/* SAVE VERSIONS */

/*****************************************************************

            FUNCTIONS DATA EVENTS PLOTS

*******************************************************************/

/*
 * DEBUG
 */
function viewConfig(){
  SHOWERRORS(true);
  ALERT(">"+INSPECT(CONFIG()));
}

/*
 * INTERVAL
 */
function stopInterval(interval,tmp){
  SETTIMEOUT(function() {
    CLEARINTERVAL(interval);
  }, tmp);
}

/*
 * CONFIGURATION
 */

// Enable or disable manual location
function setConfig4Draft(b){
  if (b==true||b==false){
    var config = {
      drafts_enabled: b
    };
    SETFORMATTRIBUTES(config);
  }
}

function setConfig4Location(b){
  if (b==true||b==false){
    var config = {
      manual_location_enabled: b
    };
    SETFORMATTRIBUTES(config);
  }
}

function setConfig4LocationDraft(b){
  setConfig4Draft(b);
  setConfig4Location(b);
}

/*
 * GPS
 */

//Function get horizontal accuracy value no matters from where
function horizontalAccuracyNoMatters(){
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
  return '';
}

//Function get vertical accuracy value no matters from where
function verticalAccuracyNoMatters(){
  var r = CONFIG().recordVerticalAccuracy;
  if (EXISTS(r)){
    //ALERT('Vertical Accuracy from iPhone');
    //DEBUG
    //viewConfig();
    return cleanDigit(r,2);
  } else {
    //DEBUG
    //viewConfig();
    //ALERT('No vertical Accuracy');
  }

  return '';
}

// Clean String Digit to a number after the dot
// Remove 0 after on rigth
function cleanDigit(val,num){
  if (EXISTS(val)){
    var tmp = FIXED(NUM(val),num, true);
    var tmp2 = str2Num(tmp);
    return tmp2;
  }
  return '';
}

// From String to number
function str2Num(val){
  if (ISNAN(val)){
    var tmp = ""+val;
    var nume = NUM(SUBSTITUTE(tmp,',','.'));
    if (ISNUMBER(nume)){
      return nume;
    }
    return val;
  }
  return val;
}


// Clean CURRENTLOCATION()
// If CURRENTLOCATION() not available return empty values and .empty = true
function getGPSLocation(){
  var location = CURRENTLOCATION();
  if (location) {
    var cleanLocation = {};
    
    var alti = location.altitude;
    alti     = cleanDigit(alti,2);
    cleanLocation.altitude=alti;
    
    var lati = location.latitude;
    lati     = cleanDigit(lati,7);
    cleanLocation.latitude=lati;
    
    var long = location.longitude;
    long     = cleanDigit(long,7);
    cleanLocation.longitude=long;
    
    var accu = location.accuracy;
    accu = cleanDigit(accu,2);
    cleanLocation.accuracy=accu;
    
    cleanLocation.course=location.course;
    cleanLocation.speed=location.speed;
    cleanLocation.timestamp=location.timestamp;
    cleanLocation.empty=false;
    
    return cleanLocation;
  } else {
    var emptyLocation = {
      altitude:'',
      latitude:'',
      longitude:'',
      accuracy:'',
      course:'',
      speed:'',
      timestamp:'',
      empty:true
    };
    return emptyLocation;
  }
}

// GET information from current location
function getGPSLatitude() {return getGPSLocation().latitude;}
function getGPSLongitude(){return getGPSLocation().longitude;}
function getGPSHAccuracy(){return getGPSLocation().accuracy;}
function getGPSAltitude() {return getGPSLocation().altitude;}

// Search first in config then in current location
function getLongitude(){
  if (EXISTS(LONGITUDE())){
    return cleanDigit(LONGITUDE(),7);
  } else if (EXISTS(CONFIG().recordGeometry.coordinates[0])){
    return cleanDigit(CONFIG().recordGeometry.coordinates[0],7);
  }
  return getGPSLongitude();
}

function getLatitude(){
  if (EXISTS(LATITUDE())){
    return cleanDigit(LATITUDE(),7);
  } else if (EXISTS(CONFIG().recordGeometry.coordinates[1])){
    return cleanDigit(CONFIG().recordGeometry.coordinates[1],7);
  }
  return getGPSLatitude();
}

function getAltitude(){
  if (EXISTS(ALTITUDE())){
    return cleanDigit(ALTITUDE(),2);
  }
  return getGPSAltitude();
}

// Get the GPS information on live
// https://developer.fulcrumapp.com/data-events/examples/display-gps-info/
function updateLocationInfo() {
  var location = getGPSLocation();
  // if there is no location, display a special message
  if (location.empty) {
    SETLABEL('gps_info', 'Current GPS Information.\nYour GPS is not accessible. No Location Available');
    SETLABEL('corner_gps_info', 'Current GPS Information.\nYour GPS is not accessible. No Location Available');
    return;
  }
  //SETHIDDEN('update_location_with_gps', false);

  // format the display of the location data
  var message = [
    'Current GPS Information',
    'Latitude: ' + location.latitude,
    'Longitude: ' + location.longitude,
    'Horizontal Accuracy: ' + location.accuracy,
    'Altitude: ' + location.altitude
  ].join('\n');

  // set the label property of the label on the form
  SETLABEL('gps_info', message);
  SETLABEL('corner_gps_info', message);
}

// Make GPS not available
function gpsNotAccessible(){
  SETHIDDEN('update_location_with_gps', true);
  SETHIDDEN('current_gps_information', true);
  SETHIDDEN('gps_info', true);
  SETHIDDEN('update_corner_location_with_gps', true);
  SETHIDDEN('corner_gps_info', true);
  setConfig4LocationDraft(false);
}

// Make GPS available
function gpsAccessible(){
  SETREADONLY('update_location_with_gps', true);
  SETHIDDEN('update_location_with_gps', false);
  SETHIDDEN('current_gps_information', true);
  SETHIDDEN('gps_info', false);
  SETLABEL('gps_info', 'Current GPS Information.\nYou can change GPS information.');
  SETREADONLY('update_corner_location_with_gps', true);
  SETHIDDEN('update_corner_location_with_gps', false);
  SETHIDDEN('corner_gps_info', false);
  SETLABEL('corner_gps_info', 'Current GPS Information.\nYou can change GPS information.');
  // go ahead and update it now...
  updateLocationInfo();
  // ... and every 3 seconds
  SETINTERVAL(updateLocationInfo, 3000);
  setConfig4LocationDraft(true);
}


/*
 * STATUS and ACCESS TO DATA
 */
var fieldUserInterRolesGV = ['Graduate Student']; // include more roles if needed
function isIntermediateUser(){
  return ISROLE(fieldUserInterRolesGV);
}


var projectNameGV    = "";
var fieldUserRolesGV = ['Standard User']; // include more roles if needed
var usernameGV       = USERFULLNAME();
var readOnlyStatusesGV = ['deleted', 'verified', 'submitted', 'approved', 'published'];

function isRejected(){
  return (STATUS()=='rejected' || EXISTS($rejected_by));
}

function isVerified(){
  return STATUS()=='verified';
}

function isStandardUser(){
  return ISROLE(fieldUserRolesGV);
}

function isReadOnly(){
  return CONTAINS(readOnlyStatusesGV, STATUS());
}

function isEditableByUsers(){
  return ISROLE(fieldUserRolesGV) && !isReadOnly();
}

function isLocked4Users(){
  return ISROLE(fieldUserRolesGV) && isReadOnly();
}

function getNumOfCorners() {
  if ($corners != null){
    return LEN(ARRAY(REPEATABLEVALUES($corners, 'corner_number')));
  } else {
    return 0;
  }
}

function setNumOfCorners() {
  SETVALUE('number_of_corners',getNumOfCorners());
}

function notSameCornersNumber(){
  if (VALUE('number_of_corners')==getNumOfCorners()){
    return false;
  } else {
    return true;
  }
}

/*
 * Update from corners
 */
function getAverageTab(tab){
  var n = 0;
  var b = 0;
  tab.forEach(function(element) {
    if (EXISTS(element)){
      b += element;
      n += 1;
    }
  });
  if (n>0){
    return b/n;
  } else {
    return '';
  }
}

function getLatOfCorners() {
  if ($corners != null){
    return getAverageTab(ARRAY(REPEATABLEVALUES($corners, 'corner_latitude_degrees')));
  } else {
    return 0;
  }
}

function getLonOfCorners() {
  if ($corners != null){
    return getAverageTab(ARRAY(REPEATABLEVALUES($corners, 'corner_longitude_degrees')));
  } else {
    return 0;
  }
}

function getHoriAccOfCorners() {
  if ($corners != null){
    return getAverageTab(ARRAY(REPEATABLEVALUES($corners, 'corner_horizontal_accuracy_m')));
  } else {
    return 0;
  }
}

function getAltOfCorners() {
  if ($corners != null){
    return getAverageTab(ARRAY(REPEATABLEVALUES($corners, 'corner_altitude_m')));
  } else {
    return 0;
  }
}

function getVertAccOfCorners() {
  if ($corners != null){
    return getAverageTab(ARRAY(REPEATABLEVALUES($corners, 'corner_vertical_accuracy_m')));
  } else {
    return 0;
  }
}

function setLocationInfoFromCorners(){
  if (getNumOfCorners()>3){
    var newLat = getLatOfCorners();
    var newLon = getLonOfCorners();
    var newHoriAcc = getHoriAccOfCorners();
    var newAlt = getAltOfCorners();
    var newVertAcc = getVertAccOfCorners();
    SETVALUE('latitude',newLat);
    SETVALUE('longitude',newLon);
    SETVALUE('horizontal_accuracy',newHoriAcc);
    SETVALUE('altitude',newAlt);
    SETVALUE('vertical_accuracy',newVertAcc);
    SETHIDDEN('update_location_with_gps', true);
    SETHIDDEN('current_gps_information', true);
    SETHIDDEN('gps_info', true);
    setNumOfCorners();
  } else {
    SETHIDDEN('update_location_with_gps', false);
    SETHIDDEN('current_gps_information', false);
    SETHIDDEN('gps_info', false);
  }
}

function updateLocationInfoFromCorners() {
  setLocationInfoFromCorners();
  stopInterval(SETINTERVAL(setLocationInfoFromCorners, 1000),2100);
}


/*
 * Update Corner ID
 */
function setCornerId(){
  var plotID = VALUE('plot_id');
  var cornerFieldId = CHOICEVALUE($corner_field_id);
  if (EXISTS(plotID) && EXISTS(cornerFieldId)){
    SETVALUE('corner_id',plotID+'-'+cornerFieldId);
  }
}

function updateCornerId() {
  setCornerId();
  stopInterval(SETINTERVAL(setCornerId, 500),1000);
}

/*
 * Change values visibility
 */
function changeValues(){
  DATANAMES().forEach(function(dataName) {
    SETREADONLY(dataName, null);
  });
  loadDataQualityControl();
  setConfig4LocationDraft(true);
  gpsAccessible();
}

function readOnlyValues(){
  DATANAMES().forEach(function(dataName) {
    SETREADONLY(dataName, true);
  });
  loadDataQualityControl();
  setConfig4LocationDraft(false);
  gpsNotAccessible();
}

/*
 * Tests on plot shape
 */
function plotIsASquare(){
  SETTIMEOUT(testPlotIsASquare, 3000);
}

function testPlotIsASquare(){
  var pw = VALUE('plot_width_m');
  var pl = VALUE('plot_length_m');
  var pwb = !ISBLANK($plot_width_m);
  var plb = !ISBLANK($plot_length_m);
  if (pwb && plb && pw==pl){
    SETVALUE('plot_shape','square');
    SETVALUE('plot_length_m','');
    ALERT('Plot shape has been set to square because its width was equal to its length.');
    return true;
  }
  return false;
}  

function plotCheckRectangular(){
  SETTIMEOUT(testPlotCheckRectangular, 3000);
}

function testPlotCheckRectangular(){
  var pw = VALUE('plot_width_m');
  var pl = VALUE('plot_length_m');
  var pwb = !ISBLANK($plot_width_m);
  var plb = !ISBLANK($plot_length_m);
  if (pwb && plb && pw>pl){
    SETVALUE('plot_width_m',pl);
    SETVALUE('plot_length_m',pw);
    ALERT('A length is bigger than a width for a rectangle.');
    return true;
  }
  return false;
}

/*
 * Data Quality Control View
 */

function loadDataQualityControl(){
  var readOnlyDataQuality = ['data_quality_control','deleted','deleted_by','date_deleted','verification','verified_by','date_verified','submission','submitted_by','date_submitted','approbation','approved_by','date_approved','rejection','rejected_by','date_rejected','publication','published_by','date_published'];
  
  readOnlyDataQuality.forEach(function(element) {
    SETREADONLY(element, true);
    SETHIDDEN(element,true);
  });
  
  var status = STATUS();
  if (status=='deleted'){
    SETHIDDEN('data_quality_control',false);
    SETHIDDEN('deleted',false);
    SETHIDDEN('deleted_by',false);
    SETHIDDEN('date_deleted',false);
  } else {
    if (status!='pending'){
      SETHIDDEN('data_quality_control',false);
      SETHIDDEN('verification',false);
      SETHIDDEN('verified_by',false);
      SETHIDDEN('date_verified',false);
      if (isRejected()) {
        SETHIDDEN('rejection',false);
        SETHIDDEN('rejected_by',false);
        SETHIDDEN('date_rejected',false);
      }
      if (status!='verified'){
        SETHIDDEN('submission',false);
        SETHIDDEN('submitted_by',false);
        SETHIDDEN('date_submitted',false);
      }
      if (status=='published' || status=='approved'){
        SETHIDDEN('approbation',false);
        SETHIDDEN('approved_by',false);
        SETHIDDEN('date_approved',false);
      }
      if (status=='published'){
        SETHIDDEN('publication',false);
        SETHIDDEN('published_by',false);
        SETHIDDEN('date_published',false);
      }
    }
  }
}

/*
 * DRAFT TEST
 */
function isAbsent(b,element){
  if (!EXISTS(element) || VALUE(element)=='' || !VALUE(element)){
    return true;
  }
  return b;
}

function tabAbsence(b,tab){
  tab.forEach(function(element) {
    b = isAbsent(b,element);
  });
  return b;
}  

function isDraft(){
  var b = false;
  if (!PROJECTNAME()) {
    b = true;
  }
  var val = ['first_established_by','date_first_established','plot_shape'];
  b = tabAbsence(b,val);
  var ps = CHOICEVALUE($plot_shape);
  if (ps=='square'||ps=='rectangular'){
    if ( ISBLANK($plot_length_m) || ISBLANK($plot_width_m) || ISBLANK($azimuth_width_degrees) ){
      b = true;
    }
  } else if (ps=='circular'){
    if ( ISBLANK($plot_diameter_m)){
      b = true;
    }
  }
  return b;
}



/*****************************************************************
                        FUNCTION CALL
******************************************************************/
function callback(event) {

  /*****************************
            LOAD RECORD
  ******************************/
  if (event.name === 'load-record') {
    // Grab the project name
    projectNameGV = PROJECTNAME();
    if (ISROLE(fieldUserRolesGV)) {
      SETSTATUSFILTER(['pending']);
    } else if (isIntermediateUser()){
      SETSTATUSFILTER(['pending', 'verified', 'submitted', 'deleted']);
      if (isRejected()){
        SETSTATUSFILTER(['rejected', 'verified', 'submitted', 'deleted']);
      }
    }

    changeValues();
    updateLocationInfoFromCorners();
  }
  
  /*****************************
            NEW RECORD
  ******************************/
  // Assign plant ID using timestamp with 8 characters
  // Assign observed name as default user
  if (event.name === 'new-record') {
    var timenow = ONCE(FLOOR((Date.now() - 1519142458000) / 1000));
    SETVALUE('plot_id', timenow);
    var username = USERFULLNAME();
    SETVALUE('first_established_by', username);
    loadDataQualityControl();
  }

  /*****************************
            EDIT RECORD
  ******************************/
  if (event.name === 'edit-record') {
    /*
    - For field users, only show 'submitted' status when 'verified'
      if the current role is one of the designated field user roles...
    - make record and read-only if verified, submitted, approved or published
    - lock status and project to all standard users when verified except person who verified
    - lock status to all standard users when submitted
    */
    if (isReadOnly()){ // 
      // make read-only
      readOnlyValues();
      setConfig4LocationDraft(false);
      if (isStandardUser()){
        // add the submitted status
        SETSTATUSFILTER(['pending', 'verified', 'submitted', 'deleted']);
        if (isRejected()){
          SETSTATUSFILTER(['rejected', 'verified', 'submitted', 'deleted']);
        }
        // lock the record status
        SETREADONLY('@status', true);
        //... except for verified by the standard user who verified the record
        if ((usernameGV == $verified_by) && (STATUS() == 'verified')) {
          SETREADONLY('@status', false);
        }
      }
    } else {
      if (!isDraft() && isStandardUser()){
        SETSTATUSFILTER(['pending', 'verified', 'deleted']);
        if (isRejected()){
          SETSTATUSFILTER(['rejected', 'verified', 'deleted']);
        }
      }
      SETREADONLY('@status', false);
      /* GPS Information */
      if (VALUE('horizontal_accuracy') === ''){
        SETVALUE('horizontal_accuracy',horizontalAccuracyNoMatters());
      }
      if (VALUE('vertical_accuracy') === ''){
        SETVALUE('vertical_accuracy',verticalAccuracyNoMatters());
      }
    }
    loadDataQualityControl();
  }

  /*****************************
            VALIDATE RECORD
  ******************************/
  if (event.name === 'validate-record') {
    if (!PROJECTNAME()) {
      INVALID('Select a project before saving.');
    }
    if (notSameCornersNumber() && isReadOnly()){
      INVALID('You cannot change the number of plot corners under the current status.');
    }
    testPlotIsASquare();
    testPlotCheckRectangular();
  }

  /*****************************
            SAVE RECORD
  ******************************/
  if (event.name === 'save-record') {
    if (isReadOnly()) {
      SETPROJECT(projectNameGV);
    }
  }
  
  /*****************************
            CHANGE STATUS
  ******************************/
  if (event.name === 'change-status') {
    var today = new Date();
    var status = STATUS();

    if (status == 'pending'|| status == 'rejected') {
      changeValues();
    }

    if (status == 'pending') {
      if (isStandardUser()){
        SETSTATUSFILTER(['pending']);
      }
    } else if (status == 'rejected') {
      if (isStandardUser()){
        SETSTATUSFILTER(['rejected']);
      } else {
        var numR = 1;
        if (EXISTS($number_of_rejections)){
          numR = $number_of_rejections+1;
        }
        SETVALUE('number_of_rejections',numR);
        SETVALUE('rejected_by', usernameGV);
        SETVALUE('date_rejected', today);
      }
    } else if (status == 'verified') {
      readOnlyValues();
      setNumOfCorners();
      SETVALUE('verified_by', usernameGV);
      SETVALUE('date_verified', today);
      projectNameGV = PROJECTNAME();
      ALERT('This will make the record read-only for all other standard users.');
    } else if (status == 'deleted') {
      readOnlyValues();
      setNumOfCorners();
      SETVALUE('deleted_by', usernameGV);
      SETVALUE('date_deleted', today);
      ALERT('This will make the record read-only for all other standard users. Deleted records can no longer be edited by standard users.');
    } else if (status == 'submitted') {
      SETVALUE('submitted_by', usernameGV);
      SETVALUE('date_submitted', today);
      ALERT('This will submit the record to the data manager for approval. Submitted records can no longer be edited by standard users.');
    } else if (status == 'approved') {
      SETVALUE('approved_by', usernameGV);
      SETVALUE('date_approved', today);
    } else if (status == 'published') {
      SETVALUE('published_by', usernameGV);
      SETVALUE('date_published', today);
    }
    loadDataQualityControl();
  }

  /*****************************
            CHANGE PROJECT
  ******************************/
  // save user name and date for data control steps
  if (event.name === 'change-project') {
    if (projectNameGV != "" && isReadOnly()) {
      ALERT('The project can not be changed for this status');
      SETPROJECT(projectNameGV);
    }
  }

  /*****************************
            CHANGE GEOMETRY
  ******************************/
  if (event.name === 'change-geometry') {
    // On main record object
    if (!EXISTS(event.field)) {
      var status = STATUS();
      if (status=== 'pending' || status=== 'rejected') {
        SETVALUE('horizontal_accuracy','');
        SETVALUE('vertical_accuracy','');
        SETREADONLY('altitude', false);
        SETREADONLY('horizontal_accuracy', false);
        SETREADONLY('vertical_accuracy', false);
        SETVALUE('altitude', '');
        SETVALUE('latitude', getLatitude());
        SETVALUE('longitude', getLongitude());
      } else {
        SETLOCATION(VALUE('latitude'),VALUE('longitude'));
      }
    }
    // On main record object
    if (event.field=='corners') {
      var status = STATUS();
      if (status=== 'pending' || status=== 'rejected') {
        SETVALUE('corner_horizontal_accuracy_m','');
        SETVALUE('corner_vertical_accuracy_m','');
        SETREADONLY('corner_altitude_m', false);
        SETREADONLY('corner_horizontal_accuracy_m', false);
        SETREADONLY('corner_vertical_accuracy_m', false);
        SETVALUE('corner_altitude_m', '');
        SETVALUE('corner_latitude_degrees', getLatitude());
        SETVALUE('corner_longitude_degrees', getLongitude());
      } else {
        SETLOCATION(VALUE('corner_latitude_degrees'),VALUE('corner_longitude_degrees'));
      }
    }
  }

  /*****************************
            CHANGE
  ******************************/
  if (event.name === 'change'){
    
    /******  site  *****/
    // When site record is added, hide other fields
    if (event.field === 'site'){
      if (ISBLANK($site)) {
        //ALERT("Ask co-workers if the site record has been created on another device but not yet synced."+"\n\n"+"If so, write its Site ID below, save your record as draft."+"\n"+"Then link the site record once it becomes available."+"\n***********\n"+"If not, save your record as draft and create the site record in the 'Sites' app.");
        //ALERT("Ask co-workers if a site has been created on another device but not yet synced."+"\n\n"+"If not, create a new site.");
      }
    }
    if (event.field === 'plot_length_m' || event.field === 'plot_width_m'){
      var ps = CHOICEVALUE($plot_shape);
      if (ps=='rectangular'){
        plotCheckRectangular();
        plotIsASquare();
      }
    }
    if (event.field === 'plot_width_m'){
      var ps = CHOICEVALUE($plot_shape);
      if (ps=='square'){
        SETVALUE('plot_length_m','');
      }
    }
    if (event.field === 'plot_shape'){
      var ps = CHOICEVALUE($plot_shape);
      if (ps=='square'||ps=='rectangular'){
        SETVALUE('plot_diameter_m','');
      }
      if (ps=='square'){
        SETVALUE('plot_length_m','');
      }
      if (ps=='circular'){
        SETVALUE('plot_length_m','');
        SETVALUE('plot_width_m','');
        SETVALUE('azimuth_width_degrees','');
      }
    }
    
    /*
     * 
     */
    if (event.field === 'corner_field_id'){
      updateCornerId();
    }
  }

  /*****************************
            CLICK
  ******************************/
  if (event.name === 'click'){

    // UPDATE GPS POSITION
    if (event.field === 'update_location_with_gps'){
      var status = STATUS();
      if (status=== 'pending' || status=== 'rejected') {
        var lat = getGPSLatitude();
        var lon = getGPSLongitude();
        var alt = getGPSAltitude();
        SETVALUE('latitude', lat);
        SETVALUE('longitude', lon);
        SETLOCATION(lat,lon);
        //SETREADONLY('altitude', true);
        SETVALUE('altitude', alt);
        SETVALUE('horizontal_accuracy',getGPSHAccuracy());
        SETVALUE('vertical_accuracy',verticalAccuracyNoMatters());
      } else {
        SETLOCATION(VALUE('latitude'),VALUE('longitude'));
      }
    }
    
    // UPDATE CORNER GPS POSITION
    if (event.field === 'update_corner_location_with_gps'){
      var status = STATUS();
      if (status=== 'pending' || status=== 'rejected') {
        var lat = getGPSLatitude();
        var lon = getGPSLongitude();
        var alt = getGPSAltitude();
        SETVALUE('corner_latitude_degrees', lat);
        SETVALUE('corner_longitude_degrees', lon);
        SETLOCATION(lat,lon);
        //SETREADONLY('altitude', true);
        SETVALUE('corner_altitude_m', alt);
        SETVALUE('corner_horizontal_accuracy_m',getGPSHAccuracy());
        SETVALUE('corner_vertical_accuracy_m',verticalAccuracyNoMatters());
      } else {
        SETLOCATION(VALUE('latitude'),VALUE('longitude'));
      }
    }
  }

  /*****************************
            REPEATABLE
  ******************************/
  if (event.name === 'new-repeatable'){
    // Assign a default incremental value
    if (event.field === 'corners') {
      var serial = REPEATABLENUMBER();
      SETVALUE('corner_number', serial);
    }
  }

  if (event.name === 'validate-repeatable'){
    if (event.field === 'corners') {
      if (isReadOnly()){
        INVALID('You cannot add plot corners under the current status.');
      }
    }
  }
  if (event.name === 'save-repeatable'){
    if (event.field === 'corners') {
      updateLocationInfoFromCorners();
    }
  }
}

/********** FUNCTIONS **********/
ON('load-record', callback);
ON('new-record', callback);
ON('edit-record', callback);
ON('validate-record', callback);
ON('save-record', callback);
ON('change-status', callback);
ON('change-project', callback);
ON('change-geometry', callback);
ON('change-geometry', 'corners', callback);
ON('change', 'site', callback);
ON('change', 'plot_shape', callback);
ON('change', 'plot_length_m', callback);
ON('change', 'plot_width_m', callback);
ON('change', 'corner_field_id', callback);
ON('click', 'update_location_with_gps', callback);
ON('click', 'update_corner_location_with_gps', callback);
ON('new-repeatable', 'corners', callback);
ON('validate-repeatable', 'corners', callback);
ON('save-repeatable', 'corners', callback);
