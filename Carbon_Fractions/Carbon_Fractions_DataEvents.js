/* SAVE VERSIONS */

/*****************************************************************

            FUNCTIONS DATA EVENTS CARBON FRACTION

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


/*
 * Make visible if value there
 */

function removeReadOnly(){
  if (VALUE('empty_bag_weight_g')) {
    SETREADONLY('sample_weight_g', false);
    if (VALUE('sample_type')==='blank'){
      SETREADONLY('ndf_weight_g', false);
    }
  } 
  if (VALUE('sample_weight_g')) {
    SETREADONLY('ndf_weight_g', false);
    SETREADONLY('sample_type', true);
  } 
  if (VALUE('ndf_weight_g')) {
    SETREADONLY('adf_weight_g', false);
  }
  if (VALUE('adf_weight_g')) {
    SETREADONLY('adl_weight_g', false);
  }
  if (VALUE('adl_weight_g')) {
    SETREADONLY('empty_crucible_weight_g', false);
  }
  if (VALUE('empty_crucible_weight_g')) {
    SETREADONLY('crucible_ash_weight_g', false);
  }
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
 * ALERT if blank different
 */

function alertBlankDiff(){
  var v = VALUE('ndf_correction_factors');
  var v2 = VALUE('ndf_weight_g') / VALUE('empty_bag_weight_g');
  var c = 0.05;
  if (v2 && v2>0.05){
    if ((v2>v+c) || (v2<v-c)){
      ALERT("Your blanks are different. You need to recalculate all samples between these two blanks by opening and saving their records.");
    }
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

    loadDataQualityControl();
    removeReadOnly();
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
      //if (!isDraft() && isStandardUser()){
      if (isStandardUser()){
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
            NEW RECORD
  ******************************/
  // Assign observer name as default user
  if (event.name === 'new-record') {
    var timenow = ONCE(FLOOR((Date.now() - 1519142458000) / 1000));
    SETVALUE('analysis_id', timenow);
    var username = USERFULLNAME();
    SETVALUE('measured_by', username);
  }

  /*****************************
            VALIDATE RECORD
  ******************************/
  if (event.name === 'validate-record') {
    if (!PROJECTNAME()) {
      INVALID('Select a project before saving.');
    }
    //if (notSameCornersNumber() && isReadOnly() && STATUS()!='deleted'){
    /*
    if (isReadOnly() && STATUS()!='deleted'){
      INVALID('You cannot change the number of corners under the current status.');
    }
    */
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
      //setNumOfCorners();
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
            CHANGE
  ******************************/
  if (event.name === 'change'){
    if (event.field === 'ndf_correction_factor') {
      var type = VALUE('sample_type');
      if (type=='blank'){
       // alertBlankDiff();
      }
    }
    if (event.field === 'sample_type') {
      SETVALUE('leaf_chemistry_sample', null);
      SETVALUE('sample_id', null);
      //SETVALUE('empty_bag_weight_g', null);
      SETVALUE('sample_weight_g', null);
      SETVALUE('ndf_weight_g', null);
      SETVALUE('adf_weight_g', null);
      SETVALUE('adl_weight_g', null);
      SETVALUE('empty_crucible_weight_g', null);
      SETVALUE('crucible_ash_weight_g', null);
      SETVALUE('ash_weight_g', null);
    }
    
    if (event.field === 'empty_bag_weight_g') {
      if (VALUE('empty_bag_weight_g')) {
        SETREADONLY('sample_weight_g', false);
        if (VALUE('sample_type')==='blank'){
          SETREADONLY('ndf_weight_g', false);
        }
      } else {
        SETREADONLY('sample_weight_g', true);
        if (VALUE('sample_type')==='blank'){
          SETREADONLY('ndf_weight_g', true);
        }
      }
    }
    
    if (event.field === 'sample_weight_g') {
      if (VALUE('sample_weight_g')) {
        SETREADONLY('ndf_weight_g', false);
        SETREADONLY('sample_type', true);
      } else {
        SETREADONLY('sample_type', false);
        SETREADONLY('ndf_weight_g', true);
      }
    }
    
    if (event.field === 'ndf_weight_g') {
      if (VALUE('ndf_weight_g')) {
        SETREADONLY('adf_weight_g', false);
      } else {
        SETREADONLY('adf_weight_g', true);
      }
    }
    if (event.field === 'adf_weight_g') {
      if (VALUE('adf_weight_g')) {
        SETREADONLY('adl_weight_g', false);
      } else {
        SETREADONLY('adl_weight_g', true);
      }
    }
    if (event.field === 'adl_weight_g') {
      if (VALUE('adl_weight_g')) {
        SETREADONLY('empty_crucible_weight_g', false);
      } else {
        SETREADONLY('empty_crucible_weight_g', true);
      }
    }
    if (event.field === 'empty_crucible_weight_g') {
      if (VALUE('empty_crucible_weight_g')) {
        SETREADONLY('crucible_ash_weight_g', false);
      } else {
        SETREADONLY('crucible_ash_weight_g', true);
      }
    }
  }

  
  /*****************************
            REPEATABLE
  ******************************/

 if (event.name === 'new-repeatable'){
    // Assign a default incremental value
    if (event.field === 'bags') {
      var serial = REPEATABLENUMBER();
      SETVALUE('bag_number', serial);
      if (serial==1){
        SETVALUE('sample_type','blank');
      }
    }
  }
 if (event.name === 'load-repeatable'){
    if (event.field === 'bags') {
      removeReadOnly();
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
ON('new-repeatable', 'bags', callback);
ON('load-repeatable', 'bags', callback);
ON('change','sample_type', callback);
ON('change','ndf_weight_g', callback);
ON('change','ndf_correction_factor', callback);
ON('change','empty_bag_weight_g', callback);
ON('change','sample_weight_g', callback);
ON('change','empty_crucible_weight_g', callback);
ON('change','adl_weight_g', callback);
ON('change','adf_weight_g', callback);
ON('change','ndf_weight_g', callback);
