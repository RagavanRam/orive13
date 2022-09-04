// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/*export const environment = {
  production: false,
  backend: "http://216.137.185.140:9337/api/",
  backendfileURI: "http://216.137.185.140:9337",
  frontend: "http://localhost:4200",
  name: "ORIVCRM",
  defaultpwd: "orive@1234",
  auth: "c76151fd1ba231796f7afa5f29eb24c5d3c85ab21b6f11abc9066ebbaab09642141b257e8f7fd4312ef2bcd995507a4d40099476e2d5bb436ca70c84bbbc821d1925683921422162f5f0b9bc2b083cd43e66eba9f40cb08554025414c3d967aac43a12af60a5f20e64c2763bf58a215db0cf7c6de660869f6de606621fb51115",
};*/
export const environment = {
  production: true,
  backend: "https://api.orivecrm.com/api/",
  backendfileURI: "https://api.orivecrm.com",
  frontend: "https://orivecrm.com",
  name: "ORIVECRM",
  defaultpwd: "orive@1234",
  auth: "dbe51ffd11ba47c1a86832be0753795d6220535c7a08c44665911d839a015539c1c2de2be83604bb886c7e0621a1bceb1d6fca5835c6cca375620614715d6044885c8ab90219416f72bb0bd9f71a41b09d841c01268519062e4ea609573ecda4520100a32121aac2834deb8a4f90ec0337916748b1c817109620296497f9dd35",
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
