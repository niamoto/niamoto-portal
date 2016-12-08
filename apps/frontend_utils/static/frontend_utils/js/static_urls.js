/**
 * References static resources urls.
 */
var host = window.location.host;
var protocol = window.location.protocol;

var static_root = protocol + "//" + host + "/static";

define ({
    // New-Caledonia's border in topojson format - For D3.js
    nc_adm_topojson: static_root + "/frontend_utils/topojson/nc_adm0.topojson"
});
