/* SAVE VERSIONS */

/*****************************************************************

            FUNCTIONS DATA EVENTS LEAF AREA AND WATER SAMPLES

*******************************************************************/

/* THINGS TO DO:
- test isDRAFT()
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
  if ($date_sampled) return formatMMDDYY($date_sampled);
  return '';
}

function getDateYYYYMMDDMesure() {
  if ($date_sampled) return formatYYYYMMDD($date_sampled);
  return '';
}

Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear();
   var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
   var dd  = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
   return "".concat(yyyy).concat('-').concat(mm).concat('-').concat(dd);
  };

Date.prototype.hhmm = function() {
   var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
   var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
   return "".concat(hh).concat(':').concat(min);
};

function getCurrentHoursMinutes() {
    var d = new Date();
    return d.hhmm();
} 

function getCurrentDate() {
    var d = new Date();
    return d.yyyymmdd();
} 

/*
 Show rehydrated all
*/
function hideRehydratedLeafSampleAll(b) {
  SETHIDDEN('rehydrated_leaf_mass',b);
  SETHIDDEN('total_rehydrated_leaf_mass_g',b);
  SETHIDDEN('weighed_by_rehy',b);
  SETHIDDEN('date_weighed_rehy',b);
  SETHIDDEN('time_weighed_rehy',b);
  SETHIDDEN('parent_directory',b);
}

function setRehydratedLeafSampleAll(){
  if (!ISBLANK($time_rehydratation_started) &&
     $leaf_status != 'fresh'){
    hideRehydratedLeafSampleAll(false);
  } else {
    hideRehydratedLeafSampleAll(true);
  }
}

function rehydratedLeafAreaVisibility() {
  if (ISBLANK($total_rehydrated_leaf_mass_g)){
    SETHIDDEN('rehydrated_leaf_area',true);
    //if (ISBLANK($scanned_by)) SETVALUE('scanned_by',usernameGV);
    //if (ISBLANK($date_scanned)) SETVALUE('date_scanned',getCurrentDate());
    setReadOnlyFresh(true);
  } else {
    SETHIDDEN('rehydrated_leaf_area',false); 
  }
}

/*
 Check Time line
*/

function createDateHours(d,t){
  var d = new Date(d);
  var h = NUM(t[0]+t[1]);
  var m = NUM(t[3]+t[4]);
  d.setHours(h);
  d.setMinutes(m);
  return d;
}

function hoursBetweenDateAndCurrent(d1,t1){
  date1 = createDateHours(d1,t1);
  date2 = new Date();
  return Math.abs(date1 - date2) / 3.6e6;
}

function isHourInRange(h,hm,hM){
  if (hm){
    if (hm > h) return false;
    if (hM){
      if (h > hM) return false;
    }
    return true;
  }
}

function diff4Dried() {
  if (!isVerified()){
    if ($date_scanned && $time_scanned){
      var d1 = VALUE('date_scanned');
      var t1 = VALUE('time_scanned');
      var h = hoursBetweenDateAndCurrent(d1,t1);
      h = +h.toFixed(2);
      if(!isHourInRange(h,48,72) && ISBLANK($total_leaf_dry_mass_g)){
        ALERT("WARNING: Number of hours since dryed is "+h);
      }
    }
  }
}

function calc4Rehy(){
  if (!isVerified()){
    if ($date_rehydratation_started && $time_rehydratation_started){
      var d1 = VALUE('date_rehydratation_started');
      var t1 = VALUE('time_rehydratation_started');
      var h = hoursBetweenDateAndCurrent(d1,t1);
      h = +h.toFixed(2);
      //if(!isHourInRange(h,6,48) && ISBLANK($date_weighed_rehy)){
      if(!isHourInRange(h,6,48)){
        ALERT("WARNING: Number of hours since rehydratation is "+h);
      }
    }
  }
}

function diff4Rehy() {
  SETTIMEOUT(calc4Rehy, 2000);
}

/*
 * INTERVAL
 */
function stopInterval(interval){
  SETTIMEOUT(function() {
    CLEARINTERVAL(interval);
  }, 2100);
}

function stopIntervalWithT(interval,T){
  SETTIMEOUT(function() {
    CLEARINTERVAL(interval);
  }, T);
}

/*
 * PARENT PATH
 */
function setParentPath(){
  if (EXISTS(PROJECTNAME())){
    SETVALUE('parent_directory',PROJECTNAME()+'/leafscans');
  } else {
    SETVALUE('parent_directory','Please select a project');
  }
}

/*
 * WORKING FOLDER
 */
function fillWorkingFolder(){
  var date = getDateYYYYMMDDMesure();
  if (EXISTS($site_id) && date!='') {
    SETVALUE('working_folder',''+date+'-'+$site_id);
  } else {
    SETVALUE('working_folder','');
  }
}

function setWorkingFolder(){
  fillWorkingFolder();
  stopInterval(SETINTERVAL(fillWorkingFolder, 1000));
}

/*
 * BAGS Name
 */

function fillBagsName(){
  if (EXISTS($sample_id)) {
    var val = VALUE('sample_id');
    SETVALUE('bag_id_fresh', val+'-F');
    SETVALUE('bag_id_rehy', val+'-R');
    SETVALUE('paper_bag_id',val+'-D');
  } else {
    SETVALUE('bag_id_fresh', 'NEED SAMPLE');
    SETVALUE('bag_id_rehy','');
    SETVALUE('paper_bag_id','');
  }
}

function setBagsName(){
  fillBagsName();
  stopInterval(SETINTERVAL(fillBagsName, 1000));
}

/*
 * Data File Name
 */
function fillDataFileName(){
  var v = '';
  var date = getDateYYYYMMDDMesure();
  if (EXISTS($site_id) && date!=''){
    v = date+'-'+$site_id+'.txt';
  } else {
    v = 'Select a site and/or choose a date for the scan';
  }
  SETVALUE('data_file_name', v);
}

function setDataFileName(){
  fillDataFileName();
  stopInterval(SETINTERVAL(fillDataFileName, 1000));
}

/*
 * Set Read Only
 */
function setReadOnlyFresh(b){
  var t = ['bag_barcode_fresh','slawater_sample_remarks_fresh','leaf_fresh_mass_g','number_leaves','weighed_by_fresh','date_weighed_fresh','time_weighed_fresh'];
  for (i = 0; i < LEN(t); i++) {
    SETREADONLY(t[i],b);
  }
}

function setReadOnlyRehy(b){
  var t1 = ['bag_barcode_rehy','slawater_sample_remarks_rehy','date_rehydratation_started','time_rehydratation_started','total_rehydrated_leaf_mass_g','weighed_by_rehy','date_weighed_rehy','time_weighed_rehy'];
  var t2 = ['parent_directory','working_folder','data_file_name','file_name','leaf_area_cm2','scan_remarks','scanned_by','date_scanned','time_scanned'];
  for (var i = 0; i < LEN(t1); i++) {
    SETREADONLY(t1[i],b);
  }
  for (var i = 0; i < LEN(t2); i++) {
    SETREADONLY(t2[i],b);
  }
}

/*
 * Folders and files
 */
function setFoldersAndFiles(){
  setParentPath();
  setWorkingFolder();
  setDataFileName();
}

function set_user_scan(){
  if (ISBLANK($scanned_by)) SETVALUE('scanned_by',usernameGV);
  if (ISBLANK($date_scanned)) SETVALUE('date_scanned',getCurrentDate());
  if (ISBLANK($time_scanned)) SETVALUE('time_scanned',getCurrentHoursMinutes());
}

function set_user_scan_interval(){
  set_user_scan();
  stopIntervalWithT(SETINTERVAL(set_user_scan, 500),1000);
}




/*
 DRAFT test
Record link:    site sample
Date:           
Text:           
multi choice:   
repeatable:     

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
  var val = ['sample'];
  b = tabAbsence(b,val);
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
    setRehydratedLeafSampleAll();
    rehydratedLeafAreaVisibility();
    setFoldersAndFiles();
    if (!ISBLANK($sample2)){
      SETHIDDEN('sample', true);
      SETHIDDEN('sample2', false);
    }

  }
  
  /*****************************
            NEW RECORD
  ******************************/
  if (event.name === 'new-record') {
    // Assign bag ID using timestamp with 8 characters
    if (ISBLANK($weighed_by_fresh)) SETVALUE('weighed_by_fresh',usernameGV);
    if (ISBLANK($date_weighed_fresh)) SETVALUE('date_weighed_fresh',getCurrentDate());
    if (ISBLANK($date_weighed_fresh)) SETVALUE('time_weighed_fresh',getCurrentHoursMinutes());
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
      SETVALUE('bag_id_rehy',VALUE('sample_id')+'-R');
      SETVALUE('paper_bag_id',VALUE('sample_id')+'-D');
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
    if (!PROJECTNAME()) {
      INVALID('Select a project before saving.');
    }
    if (!ISBLANK($total_rehydrated_leaf_mass_g) && !ISBLANK($leaf_fresh_mass_g)){
      if ($total_rehydrated_leaf_mass_g < $leaf_fresh_mass_g) {
        INVALID('Rehydrated leaf mass cannot be lower than leaf fresh mass.');
      }
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
      ALERT('The project can not be changed for this status');
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
    if (event.field === 'filter_site') {
      //  clear previous site ID values if site record link unselected
      if (ISBLANK($filter_site)) {
        SETVALUE('filter_site_id', null);
      }
    }
    
    if (event.field === 'filter_plot') {
      //  clear previous site plot values if plot record link unselected
      if (ISBLANK($filter_plot)) {
        SETVALUE('filter_plot_id', null);
      }
    }
    
    if (event.field === 'sample2') {
      //  clear filter_site values once sample is selected
      if (ISBLANK($sample2)) {
        SETVALUE('site_id', null);
        SETVALUE('filter_site_id',null);
        SETVALUE('filter_plot_id',null);
        SETVALUE('filter_site', null);
        SETVALUE('filter_plot', null);
      } else {
        SETVALUE('filter_site', null);
        SETVALUE('filter_plot', null);
      }
      setBagsName();
      //setWorkingFolder();
      setFoldersAndFiles();
    }

    if (event.field === 'sample') {
      //  clear filter_site values once sample is selected
      if (ISBLANK($sample)) {
        SETVALUE('site_id', null);
        SETVALUE('filter_site_id',null);
        SETVALUE('filter_plot_id',null);
      } else {
        SETVALUE('filter_site', null);
        SETVALUE('filter_plot', null);
      }
      setBagsName();
      //setWorkingFolder();
      setFoldersAndFiles();
    }
    /*
    if (event.field === 'date_scanned') {
      setFoldersAndFiles();
    }
    */
    
    if (event.field === 'leaf_status') {
      var b = 0;
      if (ISBLANK($leaf_status) || $leaf_status == 'fresh') {
        SETVALUE('leaf_status', 'fresh');
        if (ISBLANK($weighed_by_fresh)) SETVALUE('weighed_by_fresh',usernameGV);
        if (ISBLANK($date_weighed_fresh)) SETVALUE('date_weighed_fresh',getCurrentDate());
        if (ISBLANK($date_weighed_fresh)) SETVALUE('time_weighed_fresh',getCurrentHoursMinutes());
        setReadOnlyFresh(null);
      }
      if ($leaf_status == 'rehy'){
        if (ISBLANK($leaf_fresh_mass_g)){
          SETVALUE('leaf_status', 'fresh');
        } else {
          if (ISBLANK($date_weighed_rehy)) SETVALUE('date_rehydratation_started',getCurrentDate());
          //setRehydratedLeafSampleAll();
          setReadOnlyFresh(true);
          setReadOnlyRehy(null);
        }
      }
      if ($leaf_status == 'dried'){
        if (ISBLANK($leaf_fresh_mass_g)){
          SETVALUE('leaf_status', 'fresh');
        } else {
          if (ISBLANK($total_rehydrated_leaf_area_cm2) && ISBLANK($time_scanned)){
            SETVALUE('leaf_status', 'rehy');
          } else {
            diff4Dried();
            if (ISBLANK($weighed_by_dried)) SETVALUE('weighed_by_dried',usernameGV);
            if (ISBLANK($date_weighed_dried)) SETVALUE('date_weighed_dried',getCurrentDate());
            if (ISBLANK($time_weighed_dried)) SETVALUE('time_weighed_dried',getCurrentHoursMinutes());
            setReadOnlyFresh(true);
            setReadOnlyRehy(true);
          }
        }
      }
    }
    if (event.field === 'total_rehydrated_leaf_mass_g') {
      if (ISBLANK($total_rehydrated_leaf_mass_g)){
        rehydratedLeafAreaVisibility();
        SETVALUE('date_weighed_rehy','');
        SETVALUE('time_weighed_rehy','');
      } else {
        SETVALUE('weighed_by_rehy',usernameGV);
        SETVALUE('date_weighed_rehy',getCurrentDate());
        diff4Rehy();
        SETVALUE('time_weighed_rehy',getCurrentHoursMinutes());
      }
    }
    if (event.field === 'total_rehydrated_leaf_area_cm2') {
        set_user_scan();
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
  if (event.name === 'new-repeatable'){
    if (event.field === 'scan_files') {
      var n = $sample_id;
      if (REPEATABLENUMBER()>1) n = n+'-'+REPEATABLENUMBER();
      SETVALUE('file_name',n+'.TIF');
    }
  }
  
  if (event.name === 'load-repeatable'){
  }

  if (event.name === 'validate-repeatable'){
  }

  if (event.name === 'save-repeatable'){
  }
}

/********** FUNCTIONS **********/
ON('load-record', callback);
ON('new-record', callback);
ON('edit-record', callback);
ON('change','filter_site', callback);
ON('change','filter_plot', callback);
ON('change','sample', callback);
ON('change','sample2', callback);
ON('change','leaf_status', callback);
ON('change','date_scanned', callback);
ON('change','total_rehydrated_leaf_mass_g', callback);
ON('change','total_rehydrated_leaf_area_cm2', callback);
ON('validate-record', callback);
ON('save-record', callback);
ON('change-status', callback);
ON('change-project', callback);
ON('new-repeatable', 'scan_files', callback);
