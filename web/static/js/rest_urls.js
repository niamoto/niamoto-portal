/**
 * References Niamoto's rest urls.
 */

var host = window.location.host;
var protocol = window.location.protocol;

var api_root = protocol + "//" + host + "/api/1.0";

define ({
    taxon_list: api_root + "/data/taxon/",
    plot_list: api_root + "/data/plot/"
});

