/* SAVE VERSIONS */

/*****************************************************************

            FUNCTIONS DATA EVENTS SPECTRORADIOMETERS

*******************************************************************/


/*****************************************************************
                        FUNCTION CALL
******************************************************************/
function callback(event) {

/*****************************
            CHANGE
  ******************************/

  if (event.name === 'change'){
    
    if (event.field === 'manufacturer_name') {
        if (ISBLANK($manufacturer_name) ) {
        SETVALUE('manufacturer_short_name', null);
        SETVALUE('manufacturer_id', null);
        SETVALUE('manufacturer_url', null);
        SETCHOICEFILTER('sensor_name', null);
        }
      
      //  clear previous site ID values if site record link unselected
      if (CHOICEVALUE($manufacturer_name) == 'Spectra Vista Corporation') {
        SETVALUE('sensor_name', null);
        SETVALUE('manufacturer_short_name', 'SVC');
        SETVALUE('manufacturer_id', '7');
        SETVALUE('manufacturer_url', 'https://www.spectravista.com');
        // set sensor values
        SETCHOICEFILTER('sensor_name', ['SVC HR-1024i']);
      }
      if (CHOICEVALUE($manufacturer_name) == 'Analytical Spectral Devices Inc.') {
        SETVALUE('sensor_name', null);
        SETVALUE('manufacturer_short_name', 'ASD');
        SETVALUE('manufacturer_id', '1');
        SETVALUE('manufacturer_url', 'https://www.asdi.com');
        // set sensor values
        SETCHOICEFILTER('sensor_name', ['ASD FR FS-3', 'ASD FS-4']);
      }
    }
    
    if (event.field === 'sensor_name') {
      if (ISBLANK($sensor_name)) {
        SETVALUE('sensor_description', null);
        SETVALUE('sensor_type_number', null);
        SETVALUE('no_of_channels', null);
        SETVALUE('sensor_url', null);
        }
      if (CHOICEVALUE($sensor_name) == 'SVC HR-1024i') {
        SETVALUE('sensor_description', 'Spectra Vista Corporation HR-1024i');
        SETVALUE('sensor_type_number', '1024i');
        SETVALUE('no_of_channels', '1024');
        SETVALUE('sensor_url', 'https://www.spectravista.com/hr-1024i');
      }
      if (CHOICEVALUE($sensor_name) == 'ASD FR FS-3') {
        SETVALUE('sensor_description', 'ASD FieldSpec FR or FieldSpec3 type');
        SETVALUE('sensor_type_number', '3');
        SETVALUE('no_of_channels', '2151');
        SETVALUE('sensor_url', null);
      }
      if (CHOICEVALUE($sensor_name) == 'ASD FS-4') {
        SETVALUE('sensor_description', 'ASD FieldSpec 4 Standard-Res Spectroradiometer');
        SETVALUE('sensor_type_number', '4');
        SETVALUE('no_of_channels', '2151');
        SETVALUE('sensor_url', 'https://www.asdi.com/products-and-services/fieldspec-spectroradiometers/fieldspec-4-standard-res');
      }
    } // end of event.field == 'sensor_name'
  } // end of event.name == 'change'

} // end of FUNCTION CALL

/********** FUNCTIONS **********/

ON('change', 'manufacturer_name', callback);
ON('change', 'sensor_name', callback);
