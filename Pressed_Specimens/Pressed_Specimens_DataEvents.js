/* SAVE VERSIONS */

/*****************************************************************

            FUNCTIONS DATA EVENTS PRESSED SPECIMENS

*******************************************************************/

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

function getNumOfBoundaries() {
  if ($boundaries != null){
    return LEN(ARRAY(REPEATABLEVALUES($boundaries, 'boundary')));
  } else {
    return 0;
  }
}

function setNumOfBoundaries() {
  SETVALUE('number_of_boundaries',getNumOfBoundaries());
}

function notSameBoundariesNumber(){
  if (VALUE('number_of_boundaries')==getNumOfBoundaries()){
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

function resetIdenInfo() {
  SETVALUE('plant_scientific_name', null);
  SETVALUE('vernacular_name_english', null);
  SETVALUE('vernacular_name_french', null);
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
  var val = ['plant','date_collected','collected_by'];
  b = tabAbsence(b,val);
  var ps = CHOICEVALUE($deposited_in_herbarium);
  if (ps=='yes'){
    var val = ['herbarium_name','accession_number'];
    b = tabAbsence(b,val);
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
  }
  
  /*****************************
            NEW RECORD
  ******************************/
  // Assign plant ID using timestamp with 8 characters
  // Assign observed name as default user
  if (event.name === 'new-record') {
    var timenow = ONCE(FLOOR((Date.now() - 1519142458000) / 1000));
    SETVALUE('specimen_id', timenow);
    SETVALUE('collected_by', usernameGV);
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
    if (event.field === 'filter_site'){
      if (ISBLANK($filter_site)){
        SETVALUE('filter_site_id', null);
      }
    }
    if (event.field === 'plant'){
      if (ISBLANK($plant)){
        SETVALUE('plant_id', null);
        SETVALUE('scientific_name', null);
      } else {
        SETVALUE('filter_site', null);
        SETVALUE('filter_site_id', null);
        SETVALUE('collected_by', usernameGV);
        SETVALUE('date_collected', Date.now());
      }
    }
    
    if (event.field === 'taxon_checklist'){
      resetIdenInfo();
      
      if (CHOICEVALUE($taxon_checklist) == 'VASCAN') {
        SETVALUE('bryoquel_taxon', null);
        SETVALUE('generic_taxon', null);
      } else if (CHOICEVALUE($taxon_checklist) == 'Bryoquel') {
        SETVALUE('vascan_taxon', null);
        SETVALUE('generic_taxon', null);
        SETVALUE('vascan_filter_geography', null);
        SETVALUE('vascan_filter_growth_form', null);
      } else if (CHOICEVALUE($taxon_checklist) == 'Generic') {
        SETVALUE('vascan_taxon', null);
        SETVALUE('bryoquel_taxon', null);
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
  }
  
  if (event.name === 'load-repeatable'){
  }

  if (event.name === 'validate-repeatable'){
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
ON('change', 'filter_site', callback);
ON('change', 'plant', callback);
ON('change', 'taxon_checklist', callback);
ON('change', 'vascan_taxon', callback);
ON('change', 'bryoquel_taxon', callback);
ON('change', 'generic_taxon', callback);
