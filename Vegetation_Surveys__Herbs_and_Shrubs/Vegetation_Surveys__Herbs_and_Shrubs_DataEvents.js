/* SAVE VERSIONS */

/*****************************************************************

        FUNCTIONS DATA EVENTS Vegetation Survey: Herbs and Shrubs

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

// Make GPS not available
function gpsNotAccessible(){
  setConfig4Location(false);
}

// Make GPS available
function gpsAccessible(){
  setConfig4Location(true);
}

/*
 * FUNCTIONS for SCIENTIFIC NAMES
 */
function getScientificNames() {
  if ($plant_taxa != null){
    return ARRAY(REPEATABLEVALUES($plant_taxa, 'scientific_name'));
  } else {
    return null;
  }
}

function getTaxonUsed() {
  if ($taxon_coverage != null){
    return ARRAY(REPEATABLEVALUES($taxon_coverage, 'taxon_list').map(CHOICEVALUE));
  } else {
    return null;
  }
}

function getSubplotTaxonUsed() {
  if ($subplot_taxon_coverage != null){
    return ARRAY(REPEATABLEVALUES($subplot_taxon_coverage, 'subplot_taxon_list').map(CHOICEVALUE));
  } else {
    return null;
  }
}

function getNewList(tab1,tab2){
  return tab1.concat(tab2).filter(function(val, index, arr){
    return arr.indexOf(val) === arr.lastIndexOf(val);
  });
}

function setTaxonList() {
  var scientificNames=getScientificNames();
  var taxon_used  = getTaxonUsed();
  if (scientificNames!=null){
    SETCHOICES('taxon_list', getNewList(scientificNames,taxon_used));
  } else {
    SETCHOICES('taxon_list', ['Please choose a taxon first']);
  }
}

function setSubplotTaxonList() {
  var scientificNames     = getScientificNames();
  var subplot_Taxon_used  = getSubplotTaxonUsed();
  if (scientificNames!=null){
    SETCHOICES('subplot_taxon_list', getNewList(scientificNames,subplot_Taxon_used));
  } else {
    SETCHOICES('subplot_taxon_list', ['Please choose a taxon first']);
  }
}

function showTaxonChoices() {
  var scientificNames = getScientificNames();
  var string = "";
  if (scientificNames==null){
    string = "Please CHOOSE a taxon FIRST";
  } else {
    string = "List of scientific names available:"+"\n"
    for (var iter = 0; iter < scientificNames.length; iter++) {
      string = string+'- '+scientificNames[iter]+" \n";
    }
  }
  SETLABEL('taxons_available', string);
}

function updateTaxonLists() {
  setTaxonList();
  setSubplotTaxonList();
  showTaxonChoices();
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

function getNumOfTaxa() {
  if ($plant_taxa != null){
    return LEN(ARRAY(REPEATABLEVALUES($plant_taxa, 'scientific_name')));
  } else {
    return 0;
  }
}

function setNumOfTaxa() {
  SETVALUE('number_of_taxa',getNumOfTaxa());
}

function notSameTaxaNumber(){
  if (VALUE('number_of_taxa')==getNumOfTaxa()){
    return false;
  } else {
    return true;
  }
}

function setRepeable(){
  setNumOfTaxa();
}

function notSameNumberOfRepeatable() {
  if (notSameTaxaNumber()){
    return true;
  } else {
    return false;
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
Record link:    plot subplot (if trees_measured_in_subplot == yes) 
Date:           date_surveyed
Text:           surveyed_by
multi choice:   
repeatable:     surveyed_trees scientific_names
number:         

*/
function isDraft(){
  var val = ['plot','date_surveyed','surveyed_by'];
  var b = false;
  val.forEach(function(element) {
    if(!EXISTS(element) || VALUE(element)=='' || !VALUE(element)){
      b = true;
    }
  });
  if (!PROJECTNAME()) {
    b = true;
  }
  var numT = getNumOfTrees();
  var numS = getNumOfScientificNames();
  if (numT<1 || numS<1){
    b = true;
  }
  if (VALUE('trees_measured_in_subplot') == 'yes'){
    var sub = ['subplot']
    sub.forEach(function(element) {
      if(!EXISTS(element) || VALUE(element)=='' || !VALUE(element)){
        b = true;
      }
    });
  }
  return b;
}

/*
 * Geometry
 */
function fillGeometry(){
  if (EXISTS($plot_latitude)
   && EXISTS($plot_longitude)
   ) {
    SETLOCATION(VALUE('plot_latitude'),VALUE('plot_longitude'));
  }
}

function setGeometry(){
  fillGeometry();
  stopInterval(SETINTERVAL(fillGeometry, 500),1000);
}

/*
 * Set location from (sub)plot
 */

function setLocation(){
  var lat = VALUE('plot_latitude');
  var lon = VALUE('plot_longitude');
  if (EXISTS(lon) && EXISTS(lat)) {
    SETLOCATION(lat,lon);
  }
}

function setLocationInterval(){
  setLocation();
  stopInterval(SETINTERVAL(setLocation, 500),1000);
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
    loadDataQualityControl();
    changeValues();
    //gpsNotAccessible();
    /* UPDATE taxons */
    updateTaxonLists();
  }
  
  /*****************************
            NEW RECORD
  ******************************/
  // Assign plant ID using timestamp with 8 characters
  // Assign observed name as default user
  if (event.name === 'new-record') {
    var username = USERFULLNAME(); 
    SETVALUE('surveyed_by', username);
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
      if (isStandardUser()){
        // add the submitted status
        SETSTATUSFILTER(['pending', 'verified', 'submitted', 'deleted']);
        if (isRejected()){
          SETSTATUSFILTER(['rejected', 'verified', 'submitted', 'deleted']);
        }
      }
      // lock the record status
      SETREADONLY('@status', true);
      //... except for verified by the standard user who verified the record
      if ((usernameGV == $verified_by) && (STATUS() == 'verified')) {
        SETREADONLY('@status', false);
      }
    } else {
      //if (!isDraft() && isStandardUser()){
      if (isStandardUser()){
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
    if (notSameNumberOfRepeatable() && isReadOnly()){
      INVALID('You can not change the number of Scientific Names or Trees. It is not possible in read only mode.');
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
      setRepeable();
      SETVALUE('verified_by', usernameGV);
      SETVALUE('date_verified', today);
      projectNameGV = PROJECTNAME();
      ALERT('This will make the record read-only for all other standard users.');
    } else if (status == 'deleted') {
      readOnlyValues();
      setRepeable();
      SETVALUE('deleted_by', usernameGV);
      SETVALUE('date_deleted', today);
      ALERT('This will make the record read-only for all other standard users. Deleted records can no longer be edited by standard users.');
    } else if (status == 'submitted') {
      SETVALUE('submitted_by', usernameGV);
      SETVALUE('date_submitted', today);
      ALERT('This will submit the record to the data manager for approval. Submitted records can no longer be edited by users.');
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
      setLocationInterval();
    }
  }

  /*****************************
            CHANGE
  ******************************/
  if (event.name === 'change'){
    if (event.field === 'filter_site'){
      if (ISBLANK($filter_site)) {
        SETVALUE('filter_site_id', null);
      }
    }
    if (event.field === 'plot'){
      if (ISBLANK($plot)) {
        SETVALUE('filter_site', null);
        SETVALUE('filter_site_id', null);
        SETVALUE('plot_id', null);
        SETVALUE('site_id', null);
      } else {
        setLocationInterval();
      }
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
  if (event.name === 'load-repeatable'
      || event.name === 'new-repeatable'
      || event.name === 'validate-repeatable'
      || event.name === 'save-repeatable'
      ){
    if (event.field == 'plant_taxa' 
        || event.field == 'taxon_coverage'
        || event.field == 'subplot_measurements'
        || event.field == 'subplot_taxon_coverage'
        ) {
      updateTaxonLists();
    }
  }
  /*
  if (event.name === 'new-repeatable'){
    if (event.field === 'plant_taxa') {
      //updateScientificNames();
    }
    if (event.field === 'taxon_coverage') {
      //updateTreeAccordingPosition();
    }
    if (event.field === 'subplot_measurements') {
      //updateTreeAccordingPosition();
    }
    if (event.field === 'subplot_taxon_coverage') {
      //updateTreeAccordingPosition();
    }
  }
  
  if (event.name === 'validate-repeatable'){
    if (event.field === 'plant_taxa') {
      if (isReadOnly()){
        INVALID('You can not add a scientific name in read only mode');
      }
    }
    if (event.field === 'taxon_coverage') {
      //updateTreeAccordingPosition();
    }
    if (event.field === 'subplot_measurements') {
      //updateTreeAccordingPosition();
    }
    if (event.field === 'subplot_taxon_coverage') {
      //updateTreeAccordingPosition();
    }
  }

  if (event.name === 'save-repeatable'){
    if (event.field === 'plant_taxa') {
      //updateTreeAccordingPosition();
    }
    if (event.field === 'taxon_coverage') {
      //updateTreeAccordingPosition();
    }
    if (event.field === 'subplot_measurements') {
      //updateTreeAccordingPosition();
    }
    if (event.field === 'subplot_taxon_coverage') {
      //updateTreeAccordingPosition();
    }
  }
  */
}

/********** FUNCTIONS **********/
//Record
ON('load-record', callback);
ON('new-record', callback);
ON('edit-record', callback);
ON('validate-record', callback);
ON('save-record', callback);
ON('change-status', callback);
ON('change-project', callback);
ON('change-geometry', callback);
//Change
ON('change', 'filter_site',callback);
ON('change', 'plot',callback);
ON('change', 'subplot',callback);
//Repeatable
ON('load-repeatable', 'plant_taxa', callback);
ON('load-repeatable', 'taxon_coverage', callback);
ON('load-repeatable', 'subplot_measurements', callback);
ON('load-repeatable', 'subplot_taxon_coverage', callback);
ON('new-repeatable', 'plant_taxa', callback);
ON('new-repeatable', 'taxon_coverage', callback);
ON('new-repeatable', 'subplot_measurements', callback);
ON('new-repeatable', 'subplot_taxon_coverage', callback);
ON('validate-repeatable', 'plant_taxa', callback);
ON('validate-repeatable', 'taxon_coverage', callback);
ON('validate-repeatable', 'subplot_measurements', callback);
ON('validate-repeatable', 'subplot_taxon_coverage', callback);
ON('save-repeatable', 'plant_taxa', callback);
ON('save-repeatable', 'taxon_coverage', callback);
ON('save-repeatable', 'subplot_measurements', callback);
ON('save-repeatable', 'subplot_taxon_coverage', callback);
