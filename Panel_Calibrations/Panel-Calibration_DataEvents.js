/* SAVE VERSIONS */

/*****************************************************************

            FUNCTIONS DATA EVENTS PANEL CALIBRATIONS

*******************************************************************/

/*
WARNING DATANAME MODIFICATIONS
!!! DRAFT NOT FONCTIONNAL ANYMORE !!!

*/

/*
 * DEBUG
 */
function viewConfig(){
  SHOWERRORS(true);
  ALERT(">"+INSPECT(CONFIG()));
}

/*
 * Protocols
 */
// protocolsTab = Label visible for user and value (equivalent to dataname)
// http://help.fulcrumapp.com/web-app/how-do-i-import-choice-lists
// the dataname is used with dict to set the url
protocolsTab = getElementProtocols();

function getElementProtocols(){
  var els = CONFIG().elements;
  for (el in els) {
    var v = els[el].data_name;
    if (EXISTS(v) && CONTAINS(v,'protocols')){
      return els[el].choices;
    }
  }
}

function getProtocols(type){
  var tab = [];
  for (prot in protocolsTab) {
    var v = protocolsTab[prot].label;
    if (EXISTS(v) && CONTAINS(v,type)){
      tab.push(protocolsTab[prot]);
    }
  }
  return tab;
}

function getProtocolsLabel(type){
  for (prot in protocolsTab) {
    var v = protocolsTab[prot].label;
    if (EXISTS(v) && CONTAINS(v,type)){
      return protocolsTab[prot].label;
    }
  }
  return '';  
}

function getProtocolsValue(label){
  for (prot in protocolsTab) {
    var v = protocolsTab[prot].label;
    if (EXISTS(v) && CONTAINS(v,label)){
      return protocolsTab[prot].value;
    }
  }
  return '';  
}

function getProtocolsLabel(val){
  for (prot in protocolsTab) {
    var v = protocolsTab[prot].value;
    if (EXISTS(v) && CONTAINS(v,val)){
      return protocolsTab[prot].label;
    }
  }
  return '';  
}

function leafLargerThanPort(){
  protValueGV = getProtocolsValue('SVC Large Leaves');
  protLabelGV = 'SVC Large Leaves';
  SETCHOICES('protocol', getProtocols('Large'));
  SETVALUE('protocol', protValueGV);
  SETVALUE('protocol_url', protValueGV);
}

function leafSmallerThanPort(){
  protValueGV = getProtocolsValue('SVC Small Leaves');
  protLabelGV = 'SVC Small Leaves';
  SETCHOICES('protocol', getProtocols('Small'));
  SETVALUE('protocol', protValueGV);
  SETVALUE('protocol_url', protValueGV);
}

function setProtocol(){
  if ($leaf_larger_than_port == 'yes' || 
    ISBLANK($leaf_larger_than_port) ) {
    leafLargerThanPort();
  } else {
    leafSmallerThanPort();
  }
  if (ISBLANK($leaf_larger_than_port)) {
    SETVALUE('leaf_larger_than_port', "yes");
  }
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
 * STATUS and ACCESS TO DATA
 */
var fieldUserInterRolesGV = ['Graduate Student']; // include more roles if needed
function isIntermediateUser(){
  return ISROLE(fieldUserInterRolesGV);
}


var storageGV        = STORAGE();
var protLabelGV      = "";
var protValueGV      = "";
var projectNameGV    = "";
var fieldUserRolesGV = ['Standard User']; // include more roles if needed
var usernameGV       = USERFULLNAME();
var readOnlyStatusesGV = ['deleted', 'verified', 'submitted', 'approved', 'published'];
var today = new Date();

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

function getNumOfMeasurements() {
  if ($measurements != null){
    return LEN(ARRAY(REPEATABLEVALUES($measurements, 'measurement_id')));
  } else {
    return 0;
  }
}

function setNumOfMeasurements() {
  SETVALUE('number_of_measurements',getNumOfMeasurements());
}

function notSameMeasurementsNumber(){
  if (VALUE('number_of_measurements')==getNumOfMeasurements()){
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
  //setConfig4LocationDraft(true);
  //gpsAccessible(); // NO GPS NEEDED HERE
}

function readOnlyValues(){
  DATANAMES().forEach(function(dataName) {
    SETREADONLY(dataName, true);
  });
  loadDataQualityControl();
  //setConfig4LocationDraft(false);
  //gpsNotAccessible(); // NO GPS NEEDED HERE
}

// NEED to hide the spectral_measurements in new repeatable leaf and read only mode
// to prevent draft even if draft is not enable
function hideMeasurementsValues(){
  DATANAMES().forEach(function(dataName) {
    SETHIDDEN('spectral_measurements', true);
  });
}

function showMeasurementsValues(){
  DATANAMES().forEach(function(dataName) {
    SETHIDDEN('spectral_measurements', null);
  });
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
Record link:    sample, computer, spectroradiometer_id instrumentation_id panel_id
Date:           date_measured spectroradiometer_start_time
Text:           parent_directory working_folder base_file_name
multi choice:   measured_by leaf_larger_than_port 
repeatable:     measurements

** (small_leaf_protocol) [leaf_larger_than_port="no", instrumentation_type="integrating sphere"]

*/
function isDraft(){
  var b = false;
  if (!PROJECTNAME()) {
    b = true;
  }
  var val = ['sample','date_measured','measured_by','spectroradiometer_start_time','computer','spectroradiometer_id','instrumentation_id','panel_id','parent_directory','working_folder','base_file_name','leaf_larger_than_port'];
  val.forEach(function(element) {
    if(!EXISTS(element) || VALUE(element)=='' || !VALUE(element)){
      b = true;
    }
  });
  var num = getNumOfMeasurements();
  if (num<1){
    //ALERT('num>'+num);
    b = true;
  } else {
    // TEST FOR VALUES INSIDE REPEATABLE
    /*
    var m = repeatableVariableInDict($size_measurements,'mode');
    var t = repeatableVariableInDict($size_measurements,'target');
    var ls = repeatableVariableInDict($size_measurements,'leaf_side');
    var ln = repeatableVariableInDict($size_measurements,'leaf_number');
    var fn = repeatableVariableInDict($size_measurements,'file_name');
    for (var i=0 ; i<num ; i++){
      if (!EXISTS(m[i])){
        b = true;
      } else if (!EXISTS(fn[i])){
        b = true;
      }
      if (!EXISTS(t[i])){
        b = true;
      } else if (!CONTAINS(t[i],'stray light') && (!EXISTS(ls[i]) || !EXISTS(ln[i]))){
        b = true;
      } else if (CONTAINS(t[i],'reference') && !EXISTS(ls[i])){
        b = true;
      } 
    }
    */
  }
  return b;
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
 * DATE
 */
//SOURCE: https://stackoverflow.com/a/23593099
function formatYYYYMMDD(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day   = '' + d.getDate(),
      year  = '' + d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return ''+year+'-'+month+'-'+day;
}

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

function getDateMMDDYYMesure() {
  if ($date_measured) return formatMMDDYY($date_measured);
  return '';
}

function getDateYYYYMMDDMesure() {
  if ($date_measured) return formatYYYYMMDD($date_measured);
  return '';
}

function setDateSaved(){
  storageGV.setItem('date_saved',getDateMMDDYYMesure());
}

function getDateSaved(){
  return storageGV.getItem('date_saved');
}

function setCurrentDaySaved(){
  storageGV.setItem('current_day_saved',formatMMDDYY(new Date()));
}

function getCurrentDaySaved(){
  return storageGV.getItem('current_day_saved');
}

function getCurrentDay(){
  return formatMMDDYY(new Date());
}

function setSiteIdSaved(){
  if ($site_id) storageGV.setItem('site_id_saved',VALUE('site_id'));
  else storageGV.setItem('site_id_saved','');
}

function getSiteIdSaved(){
  return storageGV.getItem('site_id_saved');
}

function removeColon(timest){
  return SUBSTITUTE(timest, ':', '-');
}

/*
 * PARENT PATH
 */
function fillParentPath(){
  if (!ISBLANK($target_panel_id)){
    SETVALUE('parent_directory','PANEL-CALIBRATIONS/'+$target_panel_id+'/');
  } else {
    SETREADONLY('parent_directory', true);
    SETVALUE('parent_directory','Select target panel first.');
  }
}

function setParentPath(){
  fillParentPath();
  stopInterval(SETINTERVAL(fillParentPath, 250),500);
}



/*
 * WORKING FOLDER
 */
function fillWorkingFolder(){
  var date = getDateYYYYMMDDMesure();
  var timet = removeColon($time_measured);
  if (EXISTS($target_panel_id) && date!='' && EXISTS($serial_number) && timet!='') {
    SETVALUE('working_folder',''+date+'_'+timet+'/');
  } else {
    SETVALUE('working_folder','');
  }
}

function setWorkingFolder(){
  fillWorkingFolder();
  stopInterval(SETINTERVAL(fillWorkingFolder, 1000),2100);
}

/*
 * BASE NAME
 */
function fillBaseName(){
  var v = '';
  if ($manufacturer_short_name){
    if ($manufacturer_short_name=='ASD'){
      v = 'asd'+getDateMMDDYYMesure();
    } else if ($manufacturer_short_name=='SVC'){
      if ($computer_type === 'laptop') {
        v = 'gr'+getDateMMDDYYMesure();
      } else if ($computer_type === 'PDA') {
        v = 'HR'+getDateMMDDYYMesure();
      }
    }
  }
  SETVALUE('base_file_name', v);
}

function setBaseName(){
  fillBaseName();
  stopInterval(SETINTERVAL(fillBaseName, 1000),2100);
}

function getBaseName(){
  var v = VALUE('base_file_name');
  if (v) return v;
  return '';
}

/*
 * FOLDERS AND FILES
 */
function setFoldersAndFiles(){
  setParentPath();
  setWorkingFolder();
  setBaseName();
}


/*
 * FILE NAME
 */
function setFileNumber(v){
  storageGV.setItem('file_number',''+v);
}

function setFileNumbers(v){
  SETVALUE('file_numbers',v);
}

function getFileNumber(){
  return storageGV.getItem('file_number');
}

function getFN(){
  var v = getFileNumber();
  if (EXISTS(v)){
    if (v.length==1) v = '000'+v;
    if (v.length==2) v = '00'+v;
    if (v.length==3) v = '0'+v;
    return ''+v;
  }
  return '0000';
}

function getShortFileNumber(){
  return '_'+getFN();
}

function getLongFileNumber(){
  var v = getFN();
  if (v.length==4) v = '0'+v;
  return ''+v;
}

function fillFileName(){
  var v = ''
  if ($manufacturer_short_name){
    if ($manufacturer_short_name=='ASD'){
      v = ''+getBaseName()+getLongFileNumber();
    } else if ($manufacturer_short_name=='SVC'){
      v = ''+getBaseName()+getShortFileNumber();
    }
  }
  SETVALUE('file_name',v);
}

function setFileName(){
  fillFileName();
  stopInterval(SETINTERVAL(fillFileName, 250),500);
}

function increaseFileNumberByScan(){
  setFileNumbers(Number(getFileNumber())+$number_of_scans);
}

function increaseFileNumberBy1(){
  setFileNumbers(Number(getFileNumber())+1);
}

function increaseFileNumber(){
  setFileNumber(Number(getFileNumber())+1);
}

/*
 * FILE NUMBER
 */
function setSpectrumNumber(){
  var v = '';
  if ($manufacturer_short_name){
    if ($manufacturer_short_name=='ASD'){
      if (LEN($spectrum_number)>5){
        ALERT('Values are only between 0 and 99999');
        v = FIRST(''+$spectrum_number,5).join('');
      } else if (LEN($spectrum_number)>0 && LEN($spectrum_number)<6){
        v = ''+$spectrum_number;
      }
    } else if ($manufacturer_short_name=='SVC'){
      if (LEN($spectrum_number)>4){
        ALERT('Values are only between 0 and 9999');
        v = FIRST(''+$spectrum_number,4).join('');
      } else if (LEN($spectrum_number)>0 && LEN($spectrum_number)<5){
        v = ''+$spectrum_number;
      }
    }
  }
  if (v !=''){
    SETVALUE('spectrum_number',v);
    setFileName();
    setFileNumber(v);
  }
}

function isFileNumberIncrease(){
  var n = 4;
  if ($manufacturer_short_name=='ASD') n = 5;
  var l = LAST($file_name, n);
  var t = "";
  var b = false;
  for (var y = 0 ; y < LEN(l) ; y++){
    if (l[y] != "0") b=true;
    if (b) t += l[y];
  }
  if (t == "") t = "0";
  return CONTAINS(t,getFileNumber());
}

/*
 * Same day?
 */
function isSameSavedAndCurrent() {
  var cs = getCurrentDaySaved();
  var cd = getCurrentDay();
  if (cs) {
    if (cs != cd) return false;
  } else {
    return false;
  }
  
  // I think this one is always true ...
  var ds = getDateSaved();
  var dd = getDateMMDDYYMesure();
  if (ds) {
    if ( ds != dd) return false;
  }
  var ss = getSiteIdSaved();
  if ($site_id && ss){
    if ($site_id!=ss) return false;
  }
  return true;
}

/*
 * makeGeneralOptionsReadOnly
 * 'properties_measured', 'leaf_sides_measured', 'leaf_larger_than_port', 'protocol', 'computer', 'spectroradiometer_id', 'instrumentation_id', 'panel_id', 'date_measured', 'measured_by', 'spectroradiometer_start_time', 'sample'
 */
function makeGeneralOptionsReadOnly(b) {
  var t = ['properties_measured', 'protocol', 'computer', 'spectroradiometer_id', 'instrumentation_id', 'panel_id', 'date_measured', 'measured_by', 'spectroradiometer_start_time'];
  t.forEach(function(element) {
    SETREADONLY(element, b);
  });
}

function testGeneralOptionsReadOnly(){
  if (getNumOfMeasurements()>0){
    makeGeneralOptionsReadOnly(true);
  } else {
    makeGeneralOptionsReadOnly(false);
  }
}

function checkGeneralOptionsReadOnly(){
  testGeneralOptionsReadOnly();
  SETINTERVAL(testGeneralOptionsReadOnly, 1000);
}

/*
 * preselectValuesRegardingNumOfMeasurements();
 * depends on protocol
 */
function preselectValuesRegardingNumOfMeasurements(){
  var num = getNumOfMeasurements();
  var scs = '';
  scs = preselectValuesReflectance(num);
  setTargetProtocolOptions(scs);
}

//function preselectValuesReflectanceSVCLL(num)
function preselectValuesReflectance(num){
  var scs = '';
  var tab = ['A: Reflectance','B: Reflectance','C: Reflectance'];
  ALERT('num >'+num)
  if (num == 0){
    num_file = $number_of_scans;
  } else{
    num_file = $number_of_scans*(num-1)+1;
  }
  ALERT('num_file >'+num_file)
  setFileNumbers(num_file);
  if (num<3){
    SETVALUE('sphere_configuration',tab[num]);
    scs = tab[num];
    if (num==1){
      setFileNumbers($number_of_scans+1);
    }
  } else if (num<12 && num%2==1) {
    SETVALUE('sphere_configuration',tab[0]);
    scs = tab[0];
  } else if (num<12 && num%2==0) {
    SETVALUE('sphere_configuration',tab[2]);
    scs = tab[2];
  }
  return scs;
}

//function setLeafProtocolOptionsSVCLL(scs){
function setTargetProtocolOptions(scs){
  if (CONTAINS(scs,'A:')) {
    SETVALUE('primary_light_port', 'lamp');
    SETVALUE('transmission_port', 'target + light trap');
    SETVALUE('reflectance_port', 'reference + light trap');
  }
  if (CONTAINS(scs,'B:')) {
    SETVALUE('primary_light_port', 'lamp');
    SETVALUE('transmission_port', 'reference + light trap');
    SETVALUE('reflectance_port', 'light trap');
  } else {
    SETVALUE('target_type', 'target panel');
    SETREADONLY('target_type', true);
  }
  if (CONTAINS(scs,'C:')) {
    SETVALUE('primary_light_port', 'lamp');
    SETVALUE('transmission_port', 'reference + light trap');
    SETVALUE('reflectance_port', 'target + light trap');
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
    if (ISROLE(fieldUserRolesGV)) {
      SETSTATUSFILTER(['pending']);
    } else if (isIntermediateUser()){
      SETSTATUSFILTER(['pending', 'verified', 'submitted', 'deleted']);
      if (isRejected()){
        SETSTATUSFILTER(['rejected', 'verified', 'submitted', 'deleted']);
      }
    }

    changeValues();
    //viewConfig();
    //setProtocol();
    //getElementProtocols();
    checkGeneralOptionsReadOnly();
  }
  
  /*****************************
            NEW RECORD
  ******************************/
  if (event.name === 'new-record') {
    SETVALUE('measured_by', usernameGV);
    loadDataQualityControl();
    setFileNumber(0);
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
    }
  }

  /*****************************
            VALIDATE RECORD
  ******************************/
  if (event.name === 'validate-record') {
    /*
    if (!PROJECTNAME()) {
      INVALID('Select a project before saving.');
    }
    */
    if (notSameMeasurementsNumber() && isReadOnly() && STATUS()!='deleted'){
      INVALID('You can not change the number of panels in readonly mode.');
    }
    if (!isReadOnly()){
      setNumOfMeasurements();
    }
    //setSiteIdSaved();
    setCurrentDaySaved();
    setDateSaved();
    if ($manufacturer_short_name != $manufacturer_short_name_sphere) {
      INVALID('The spectroradiometer is not from the same manufacturer as the integrating sphere.');
    }
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
      setNumOfMeasurements();
      setConfig4LocationDraft(false);
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
  }

  /*****************************
            CHANGE
  ******************************/
  if (event.name === 'change'){
    if (event.field === 'target_panel') {
      //  clear previous site ID values if site record link unselected
      if (ISBLANK($target_panel)) {
        SETVALUE('target_panel_id', null);
      }
      setFoldersAndFiles();
    }
    
    if (event.field === 'reference_panel') {
      //  clear filter_site values once sample is selected
      if (ISBLANK($reference_panel)) {
        SETVALUE('reference_panel_id', '');
      }
    }
    
    if (event.field === 'date_measured' || event.field === 'time_measured') {
      setFoldersAndFiles();
      ALERT($time_measured);
    }
    
    if (event.field === 'spectroradiometer_id') {
      if (!EXISTS($spectroradiometer_id)){
        SETVALUE('manufacturer_short_name','');
      }
      setFoldersAndFiles();
    }
    
    //
    // REPEATABLE
    //
    if (event.field === 'spectrum_number') {
      setSpectrumNumber();
    }
    
    // SVC sphere configuration
    if (event.field == 'sphere_configuration') {
      if (ISBLANK($sphere_configuration)) {
        SETVALUE('primary_light_port', null);
        SETVALUE('transmission_port', null);
        SETVALUE('reflectance_port', null);
      }
      setTargetProtocolOptions(scs);
    }
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
    if (event.field === 'measurements') {
      SETVALUE('measurement_id', REPEATABLENUMBER());
      if (CONTAINS(protLabelGV,'SVC Large Leaves')){
        SETCHOICES('target_type', 'leaf');
      }
    }
  }
  
  if (event.name === 'new-repeatable'){
    if (event.field === 'measurements') {
      fillFileName();
      SETVALUE('spectrum_number',getFileNumber());
      preselectValuesRegardingNumOfMeasurements();
    }
  }
  
  if (event.name === 'validate-repeatable'){
    if (event.field === 'measurements') {
      if (isReadOnly()) {
        INVALID('You cannot add or change measurements under the current status');
      }
      if (isFileNumberIncrease()){
        increaseFileNumber();
      }
    }
  }
  if (event.name === 'save-repeatable'){
    if (event.field === 'measurements') {
      //makeGeneralOptionsReadOnly(true);
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
ON('change','target_panel', callback);
ON('change','date_measured', callback);
ON('change','target', callback);
ON('change','spectrum_number', callback);
ON('change','spectroradiometer_id', callback);
ON('change','time_measured',callback);
ON('new-repeatable', 'measurements', callback);
ON('load-repeatable', 'measurements', callback);
ON('validate-repeatable', 'measurements', callback);
ON('save-repeatable', 'measurements', callback);
