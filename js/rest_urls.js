/**
 * References Niamoto's rest urls.
 */

var host = window.location.host;
var protocol = window.location.protocol;
var api_root = protocol + "//" + host + "/api/1.0";

export const taxon_list = api_root + "/data/taxon/";
export const plot_list = api_root + "/data/plot/";
export const plot_dashboard = api_root + "/dashboard/plot/plot_dashboard/";
export const occurrence_infos = api_root + "/dashboard/taxon/occurrences_infos/0/";

