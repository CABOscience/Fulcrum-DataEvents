/*****************************************************************

            FUNCTIONS DATA EVENTS SITES

*******************************************************************/

/*
And alpha numeric in single line only
([^\r\n\s]+)[a-zA-Z0-9]+(?!\s\r|\n)
*/


/*

CORNERS LONGITUDE IS EMPTY

*/



/*
 * DEBUG
 */
function viewConfig(){
  SHOWERRORS(true);
  ALERT(">"+INSPECT(CONFIG()));
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
 * STATUS and ACCESS TO DATA
 */
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

function changeValues(){
  DATANAMES().forEach(function(dataName) {
    SETREADONLY(dataName, null);
  });
  loadDataQualityControl();
  setConfig4LocationDraft(true);
  //gpsAccessible(); // NO GPS NEEDED HERE
}

function readOnlyValues(){
  DATANAMES().forEach(function(dataName) {
    SETREADONLY(dataName, true);
  });
  loadDataQualityControl();
  setConfig4LocationDraft(false);
  //gpsNotAccessible(); // NO GPS NEEDED HERE
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
function isDraft(){
  var val = ['site_id','first_defined_by','date_defined'];
  var num = getNumOfCorners();
  var b = false;
  val.forEach(function(element) {
    if(!EXISTS(element) || VALUE(element)=='' || !VALUE(element)){
      b = true;
    }
  });
  if (!PROJECTNAME()) {
    b = true;
  }
  if (num<3 || num>10){
    b = true;
  }
  return b;
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
  return LEN(Object.keys(dict));
}

function getNumOfSizeFor(repeatableVariable,dataname) {
  if ($size_measurements != null){
    return LEN(ARRAY(REPEATABLEVALUES(repeatableVariable,dataname)));
  } else {
    return 0;
  }
}

// Search first in config then in current location
function getLongitude(){
  if (EXISTS(LONGITUDE())){
    return cleanDigit(LONGITUDE(),7);
  } else if (EXISTS(CONFIG().recordGeometry.coordinates[0])){
    return cleanDigit(CONFIG().recordGeometry.coordinates[0],7);
  }
  return '';
}

function getLatitude(){
  if (EXISTS(LATITUDE())){
    return cleanDigit(LATITUDE(),7);
  } else if (EXISTS(CONFIG().recordGeometry.coordinates[1])){
    return cleanDigit(CONFIG().recordGeometry.coordinates[1],7);
  }
  return '';
}


function saveSitePosition(){
  SETVALUE('site_latitude', getLatitude());
  SETVALUE('site_longitude', getLongitude());
}


function saveCornersPosition(){
  var n = getNumOfCorners();
  if (n>0){
    var cla = repeatableVariableInDict($corners, 'corner_latitude');
    var clo = repeatableVariableInDict($corners, 'corner_longitude');
    SETVALUE('corners_latitude',fromDictToString(cla));
    SETVALUE('corners_longitude',fromDictToString(clo));
  }
}

function fromDictToString(dict){
  var n = getNumOfCorners();
  var s = '';
  for (var i = 0;i<n;i++){
    if(!EXISTS(dict[i]) || dict[i]=='' || !dict[i]){
      if (s!="") s += "<>";
    } else {
      if (s!="") s += "<>"+dict[i];
      if (s=="") s += ""+dict[i];
    }
  }
  return s;
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
    if (isStandardUser()) {
      SETSTATUSFILTER(['pending']);
    }
  }
  
  /*****************************
            NEW RECORD
  ******************************/
  // Assign plant ID using timestamp with 8 characters
  // Assign observed name as default user
  if (event.name === 'new-record') {
    var username = USERFULLNAME();
    SETVALUE('first_defined_by', username);
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
    // viewConfig();
    if (isReadOnly()){ // 
      // make read-only
      readOnlyValues();
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
      changeValues();
      SETREADONLY('@status', false);
    }
  }

  /*****************************
            VALIDATE RECORD
  ******************************/
  if (event.name === 'validate-record') {
    if (!PROJECTNAME()) {
      INVALID('Select a project before saving.');
    }
    if (notSameCornersNumber() && isReadOnly() && STATUS()!='deleted'){
      INVALID('You cannot change the number of corners under the current status.');
    }
    saveCornersPosition();
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
      ALERT('The project cannot be changed under the current status.');
      SETPROJECT(projectNameGV);
    }
  }

  /*****************************
            CHANGE GEOMETRY
  ******************************/
  if (event.name === 'change-geometry') {
    if (!EXISTS(event.field)) {
      SETVALUE('site_latitude', getLatitude());
      SETVALUE('site_longitude', getLongitude());
    }
    
    // On REPEATABLE object
    if (event.field === 'corners') {
      SETVALUE('corner_latitude', getLatitude());
      SETVALUE('corner_longitude', getLongitude());
    }
  }

  /*****************************
            CHANGE
  ******************************/
  if (event.name === 'change'){
  }

  /*****************************
            CLICK
  ******************************/
  if (event.name === 'click'){
  }

  /*****************************
            REPEATABLE
  ******************************/
  if (event.name === 'load-repeatable'){
    if (event.field === 'corners') {
      if (isReadOnly()) {
        setConfig4LocationDraft(false);
      }
    }
  }

  if (event.name === 'new-repeatable'){
    // Assign a default incremental value
    if (event.field === 'corners') {
      var serial = REPEATABLENUMBER();
      SETVALUE('corner_number', serial);
    }
  }
  
  if (event.name === 'validate-repeatable'){
    if (event.field === 'corners') {
      if (isReadOnly()) {
        INVALID('You cannot add a corner under the current status.');
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
ON('change-geometry', 'corners', callback);
ON('load-repeatable', 'corners', callback);
ON('new-repeatable', 'corners', callback);
ON('validate-repeatable', 'corners', callback);
ON('save-repeatable', 'corners', callback);
