/* SAVE VERSIONS */


// Projet validation
ON('validate-record', function (event) {
  if (!PROJECTNAME()) {
    INVALID('Select a project before saving.');
  }
});
