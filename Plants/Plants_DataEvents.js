/* SAVE VERSIONS */

/*****************************************************************

            FUNCTIONS DATA EVENTS PLANTS

*******************************************************************/

/*
To set default site depending on:
a - latest site id position and actual position
b - date saved and current date
if !a && !b:
  then clean site-id
*/


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
function stopInterval(interval,time){
  SETTIMEOUT(function() {
    CLEARINTERVAL(interval);
  }, time);
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
 * REPEATABLE
 */

function repeatableVariableInDict(repeatableVariable,dataname){
  var t = {};
  var i = 0;
  var o = REPEATABLEVALUES(repeatableVariable,dataname);
  o.forEach(function(element) {
    if(!EXISTS(element) || element=='' || !element){
      t[i]="";
    } else if(EXISTS(element.choice_values)){
      t[i]=element.choice_values;
    } else {
      t[i]=element;
    }
    i+=1;
  });
  return t;
}

function getSizeOfDict(dict){
  return Object.keys(t).length;
}

function getNumOfSizeFor(repeatableVariable,dataname) {
  if ($size_measurements != null){
    return LEN(ARRAY(REPEATABLEVALUES(repeatableVariable,dataname)));
  } else {
    return 0;
  }
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
    SETLABEL('gps_info', 'Your GPS is not accessible. No Location Available');
    return;
  }

  // format the display of the location data
  var message = [
    'Latitude: ' + location.latitude,
    'Longitude: ' + location.longitude,
    'Horizontal Accuracy: ' + location.accuracy,
    'Altitude: ' + location.altitude
  ].join('\n');

  // set the label property of the label on the form
  SETLABEL('gps_info', message);
  SETLABEL('bound_gps_info', message);
}

// Make GPS not available
function gpsNotAccessible(){
  SETHIDDEN('update_location_with_gps', true);
  SETHIDDEN('current_gps_information', true);
  SETHIDDEN('gps_info', true);
  setConfig4LocationDraft(false);
}

// Make GPS available
function gpsAccessible(){
  SETREADONLY('update_location_with_gps', true);
  SETHIDDEN('update_location_with_gps', false);
  SETHIDDEN('current_gps_information', false);
  SETHIDDEN('gps_info', false);
  SETLABEL('gps_info', 'You can change GPS information');
  // go ahead and update it now...
  updateLocationInfo();
  // ... and every 3 seconds
  SETINTERVAL(updateLocationInfo, 3000);
  setConfig4LocationDraft(true);
}


/*
 * STATUS and ACCESS TO DATA
 */
var storageGV        = STORAGE();
var projectNameGV    = "";
var fieldUserRolesGV = ['Standard User','Graduate Student']; // include more roles if needed
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

function getNumOfSizeMeasurements() {
  return getNumOfSizeFor($size_measurements,'size_measurements_id');
}

function setNumOfSizeMeasurements() {
  SETVALUE('number_of_size_measurements',getNumOfSizeMeasurements());
}

function notSameSizeMeasurementsNumber(){
  if (VALUE('number_of_size_measurements')==getNumOfSizeMeasurements()){
    return false;
  } else {
    return true;
  }
}

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

function resetIdenInfo() {
  SETVALUE('scientific_name', null);
  SETVALUE('identified_by', null);
  SETVALUE('date_identified', null);
  SETVALUE('identification_protocol', null);
  SETVALUE('identification_references', null);
  SETVALUE('identification_qualifier', null);
  SETVALUE('identification_remarks', null);
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
 DRAFT test
Record link:    site (vascan_taxon bryoquel_taxon generic_taxon)[related to taxon_checklist options] (identification_references)[if identification_protocol==field,guide...]
Date:           date_identified
Text:           (tag_id)[linked to plant tagged]
multi choice:   (tag_type)[linked to plant tagged] identified_by 
repeatable:     (size_measurements)[if vascan] FAIT
number:         
checklist:      taxon_checklist 
choicelist:     identification_protocol
* in repeatable: measured_by date_measured measurement_type 
*    
DBH             dbh_cm
Height          height_m
Crown diameter  crown_diameter_m
LAI             leaf_area_index
* 
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
  var val = ['site','taxon_checklist','identification_protocol','date_identified','identified_by'];
  b = tabAbsence(b,val);
  if (!isAbsent(false,'plant_tagged')){
    if (VALUE('plant_tagged')=='yes'){
      var val = ['tag_id','tag_type'];
      b = tabAbsence(b,val);
    }
  }
  if (!isAbsent(false,'identification_protocol')){
    if (CONTAINS(VALUE('identification_protocol').choice_values,'published source')){
      var val = ['identification_references'];
      b = tabAbsence(b,val);
    }
  }
  if (EXISTS($taxon_checklist)){
    var tc = VALUE('taxon_checklist');
    if (tc=='Bryoquel'){
      b = isAbsent(b,'bryoquel_taxon');
    } else {
      if (tc =='VASCAN'){
        b = isAbsent(b,'vascan_taxon');
      } else if (tc=='Generic'){
        b = isAbsent(b,'generic_taxon');
      } else if (tc=='FloraBase'){
        b = isAbsent(b,'florabase_taxon');
      }
      var size = getNumOfSizeMeasurements();
      if (size>0){
        var mb = repeatableVariableInDict($size_measurements,'measured_by');
        var mt = repeatableVariableInDict($size_measurements,'measurement_type');
        var dm = repeatableVariableInDict($size_measurements,'date_measured');
        var dc = repeatableVariableInDict($size_measurements,'dbh_cm');
        var hm = repeatableVariableInDict($size_measurements,'height_m');
        var cd = repeatableVariableInDict($size_measurements,'crown_diameter_m');
        var la = repeatableVariableInDict($size_measurements,'leaf_area_index');
        for (var i=0 ; i<size ; i++){
          if (CONTAINS(mt[i],'DBH') && (dc[i]<1||dc[i]>1000)){
            b = true;
          } else if (CONTAINS(mt[i],'Height') && (hm[i]<0.001||hm[i]>130)){
            b = true;
          } else if (CONTAINS(mt[i],'Crown diameter') && (cd[i]<0.001||cd[i]>50)){
            b = true;
          } else if (CONTAINS(mt[i],'LAI') && (la[i]<0.001||la[i]>10)){
            b = true;
          } else if (mb[i]==""||dm[i]==""){
            b = true;
          }
        }
      }
    }
  }
  return b;
}

/*
 * DATE
 */
//SOURCE: https://stackoverflow.com/a/23593099
function formatMMDDYY(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day   = '' + d.getDate(),
      year  =  LAST(''+d.getFullYear(), 2).join('');
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return ''+month+day+year;
}

function setDateSaved(){
  storageGV.setItem('date_saved',formatMMDDYY(new Date()));
}

function getDateSaved(){
  return storageGV.getItem('date_saved');
}

function getCurrentDay(){
  return formatMMDDYY(new Date());
}

function fromStringToDict(st){
  var temp = st;
  var dict = {};
  var i    = 0;
  while(CONTAINS(temp,'<>')){
    var p = FIND("<>", temp)-1;
    var s  = "";
    if (p>1) s  = LEFT(temp, p-1);
    dict[""+i]=s;
    i+=1;
    temp=RIGHT(temp, LEN(temp)-(p+2));
    if (temp=='<>') temp = '';
  }
  return dict;
}

function getCornersLatitude(){
  return fromStringToDict($corners_latitude);
}

function getCornersLongitude(){
  return fromStringToDict($corners_longitude);
}

function getPositionSaved(){
  if ($corners_longitude && $corners_latitude) return true;
  return false;
}

function getVertex(){
  var lats = getCornersLatitude();
  var lonts = getCornersLongitude();
  var vert = [];
  for (var i = 0; i < LEN(lats); i++) {
    vert[i]=[lats[i],lonts[i]];
  }
  return vert;
}

// https://github.com/substack/point-in-polygon
// ray-casting algorithm based on
// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
function pointInPoly(point, vs) {
  var x = NUM(point[0]), y = NUM(point[1]);
  var inside = false;
  for (var i = 0, j = LEN(vs) - 1; i < LEN(vs); j = i++) {
    var xi = NUM(vs[i][0]), yi = NUM(vs[i][1]);
    var xj = NUM(vs[j][0]), yj = NUM(vs[j][1]);
    var intersect = ((yi > y) != (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function getCurrentPosition(){
  return [getGPSLatitude(),getGPSLongitude()]
}

function isCurrentPositionAvailable(){
  var lat = getGPSLatitude();
  var lon = getGPSLongitude();
  if (lat!='' && lon!=''){
    return true;
  }
  return false;
}

function setSamePlace(){
  var cp = getCurrentPosition();
  if (isCurrentPositionAvailable()){
    var vert = getVertex();
    var b = pointInPoly(cp,vert);
    setSamePlaceValue(b);
  }
}

/*
 * Same day?
 */
function checkSameSavedAndCurrent() {
  if ($site){
    var cs = getDateSaved();
    var cd = getCurrentDay();
    if (cs) {
      if (cs != cd) {
        cleanSite();
      }
    } else {
      cleanSite();
    }
    var ps = getPositionSaved();
    var cp = isCurrentPositionAvailable();
    if (ps && cp) {
      setSamePlace();
      var a = getSamePlaceValue();
      if (a=='false'){
        cleanSite();
        removeSamePlaceValue();
      }
    }
  }
}

function cleanSite(){
  SETVALUE('site',null);
}

function inSameSavedAndCurrent() {
  checkSameSavedAndCurrent();
  stopInterval(SETINTERVAL(checkSameSavedAndCurrent, 500),1000);
}

function setSamePlaceValue(v){
  storageGV.setItem('SamePlaceValue',v);
}

function getSamePlaceValue(){
  return storageGV.getItem('SamePlaceValue');
}

function removeSamePlaceValue(){
  storageGV.removeItem('SamePlaceValue');
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
    }
    changeValues();
  }
  
  /*****************************
            NEW RECORD
  ******************************/
  // Assign plant ID using timestamp with 8 characters
  // Assign observed name as default user
  if (event.name === 'new-record') {
    var timenow = ONCE(FLOOR((Date.now() - 1519142458000) / 1000)); 
    SETVALUE('plant_id', timenow);
    SETVALUE('first_observed_by', USERFULLNAME());
    loadDataQualityControl();
    inSameSavedAndCurrent();
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
  }

  /*****************************
            VALIDATE RECORD
  ******************************/
  if (event.name === 'validate-record') {
    if (!PROJECTNAME()) {
      INVALID('Select a project before saving.');
    }
    if (notSameSizeMeasurementsNumber() && isReadOnly()){
      INVALID('You cannot change the number of Scientific Names or Trees. It is not possible in read only mode.');
    }
    setDateSaved();
    removeSamePlaceValue();
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
      setNumOfSizeMeasurements();
      SETVALUE('verified_by', usernameGV);
      SETVALUE('date_verified', today);
      projectNameGV = PROJECTNAME();
      ALERT('This will make the record read-only for all other standard users.');
    } else if (status == 'deleted') {
      readOnlyValues();
      setNumOfSizeMeasurements();
      SETVALUE('deleted_by', usernameGV);
      SETVALUE('date_deleted', today);
      ALERT('This will make the record read-only for all other standard users. Deleted records can no longer be edited by standard users.');
    } else if (status == 'submitted') {
      SETVALUE('submitted_by', usernameGV);
      SETVALUE('date_submitted', today);
      ALERT('This will submit the record to the data manager for approval. Submitted records can no longer be edited by standard users.');
    } else if (status == 'rejected') {
      SETVALUE('rejected_by', usernameGV);
      SETVALUE('date_rejected', today);
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
    if (!EXISTS(event.field)) {
      SETVALUE('horizontal_accuracy','');
      SETVALUE('vertical_accuracy','');
      SETVALUE('altitude', '');
      SETVALUE('latitude', getLatitude());
      SETVALUE('longitude', getLongitude());
      SETREADONLY('altitude', false);
      SETREADONLY('horizontal_accuracy', false);
      SETREADONLY('vertical_accuracy', false);
    }
  }

  /*****************************
            CHANGE
  ******************************/
  if (event.name === 'change'){

    // clear values for tag-related fields if plant is not tagged
    if (event.field === 'plant_tagged'){
      if ($plant_tagged == "no") {
        SETVALUE('tag_id', null);
        SETVALUE('tag_type', null);
        SETVALUE('tag_remarks', null);
      }
      // Be sure there is value setted
      if (!EXISTS($plant_tagged)) {
         SETVALUE('plant_tagged', "no");
      }
    }
    // Assign identifier name and today's date when scientific name is changed
    // and clear previous values
    if (event.field === 'scientific_name'){
      if (ISBLANK($scientific_name)) {
        resetIdenInfo();
      } else {
        SETVALUE('identified_by', USERFULLNAME());
        SETVALUE('date_identified', Date());
      }
    }
    if (event.field === 'taxon_checklist'){
      resetIdenInfo();
      
      if (CHOICEVALUE($taxon_checklist) == 'VASCAN') {
        SETVALUE('bryoquel_taxon', null);
        SETVALUE('florabase_taxon', null);
        SETVALUE('generic_taxon', null);
      } else if (CHOICEVALUE($taxon_checklist) == 'Bryoquel') {
        SETVALUE('vascan_taxon', null);
        SETVALUE('florabase_taxon', null);
        SETVALUE('generic_taxon', null);
        SETVALUE('vascan_filter_geography', null);
        SETVALUE('vascan_filter_growth_form', null);
      } else if (CHOICEVALUE($taxon_checklist) == 'Generic') {
        SETVALUE('vascan_taxon', null);
        SETVALUE('bryoquel_taxon', null);
        SETVALUE('florabase_taxon', null);
        SETVALUE('vascan_filter_geography', null);
        SETVALUE('vascan_filter_growth_form', null);
      } else if (CHOICEVALUE($taxon_checklist) == 'FloraBase') {
        SETVALUE('vascan_taxon', null);
        SETVALUE('bryoquel_taxon', null);
        SETVALUE('generic_taxon', null);
        SETVALUE('vascan_filter_geography', null);
        SETVALUE('vascan_filter_growth_form', null);
        }
    }
    
    if (event.field === 'vascan_taxon' || event.field === 'bryoquel_taxon' || event.field === 'generic_taxon') {
      if (ISBLANK($vascan_taxon) && ISBLANK($bryoquel_taxon) && ISBLANK($generic_taxon)) {
        resetIdenInfo();
      }
    }
    if (event.field === 'vascan_taxon') {
      if (!ISBLANK($vascan_taxon)) {
        SETVALUE('vascan_filter_geography', null);
        SETVALUE('vascan_filter_growth_form', null);
      }
    }
    if (event.field === 'site') {
      if (ISBLANK($site)) {
        SETVALUE('site_id', null);
      }
    }
  }
  
  /*****************************
            CLICK
  ******************************/
  if (event.name === 'click'){
    
    // UPDATE GPS POSITION
    if (event.field === 'update_location_with_gps'){
      var lat = getGPSLatitude();
      var lon = getGPSLongitude();
      var alt = getGPSAltitude();
      SETVALUE('latitude', lat);
      SETVALUE('longitude', lon);
      SETLOCATION(lat,lon);
      SETREADONLY('altitude', true);
      SETVALUE('altitude', alt);
      SETVALUE('horizontal_accuracy',getGPSHAccuracy());
      SETVALUE('vertical_accuracy',verticalAccuracyNoMatters());
    }
  }
  
  /*****************************
            REPEATABLE
  ******************************/
  if (event.name === 'new-repeatable'){
    
    // Assign measurer name as default user
    if (event.field === 'size_measurements') {
      SETVALUE('measured_by', USERFULLNAME());
      SETVALUE('size_measurements_id', REPEATABLENUMBER());
    }
  }

  if (event.name === 'validate-repeatable'){
    if (event.field === 'size_measurements') {
      if (isReadOnly()){
        INVALID('You can not add size measurements in read only mode');
      }
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
ON('change', 'site', callback);
ON('change', 'scientific_name', callback);
ON('change', 'taxon_checklist', callback);
ON('change', 'plant_tagged', callback);
ON('change', 'vascan_taxon', callback);
ON('change', 'bryoquel_taxon', callback);
ON('change', 'florabase_taxon', callback);
ON('change', 'generic_taxon', callback);
ON('click', 'update_location_with_gps', callback);
ON('new-repeatable', 'size_measurements', callback);
ON('validate-repeatable', 'size_measurements', callback);
