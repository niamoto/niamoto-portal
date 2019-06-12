/**
 * References static resources urls.
 */
var host = window.location.host;
var protocol = window.location.protocol;

var static_root = protocol + "//" + host + "/static";

// New-Caledonia's border in topojson format - For D3.js
export const nc_adm_topojson = static_root + "/topojson/nc_adm0.topojson";
