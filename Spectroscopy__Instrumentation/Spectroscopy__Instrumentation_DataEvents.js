/* SAVE VERSIONS */

/*****************************************************************

            FUNCTIONS DATA EVENTS SPECTROSCOPY: INSTRUMENTATION

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
        SETVALUE('manufacturer_url', null);
        }
    
      if (CHOICEVALUE($manufacturer_name) == 'Spectra Vista Corporation') {
        SETVALUE('manufacturer_short_name', 'SVC');
        SETVALUE('manufacturer_url', 'https://www.spectravista.com');
      }
       if (CHOICEVALUE($manufacturer_name) == 'Analytical Spectral Devices Inc.') {
        SETVALUE('manufacturer_short_name', 'ASD');
        SETVALUE('manufacturer_url', 'https://www.asdi.com');
        }
     } // end of event.field == 'manufacturer_name'
    
    if (event.field === 'instrumentation_type') {
       
      if (ISBLANK($instrumentation_type)) {
        SETVALUE('instrumentation_name', null); 
        SETVALUE('manufacturer_url', null);
          }
       if (CHOICEVALUE($instrumentation_type) == 'integrating sphere') {
          if ($manufacturer_short_name == 'SVC') {
           SETVALUE('instrumentation_model_name', 'DC-R/T');
           SETVALUE('instrumentation_url', 'https://www.spectravista.com/spheres/reflectance-sphere/');
           } // end of SVC
          if ($manufacturer_short_name == 'ASD') {
           SETVALUE('instrumentation_model_name', 'RTS-3ZC');
          SETVALUE('instrumentation_url', 'https://www.malvernpanalytical.com/en/products/product-range/asd-range/fieldspec-range/fieldspec-4-standard-res-spectroradiometer/index.html');
          } // end of ASD
      } else {}// end of integrating sphere 
    }
  
  }// end of event.name == 'change'
} // end of FUNCTION CALL

/********** FUNCTIONS **********/

ON('change', 'manufacturer_name', callback);
ON('change', 'instrumentation_type', callback);
