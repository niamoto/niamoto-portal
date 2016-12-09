({
    baseUrl: ".",
    name: "homepage",
    out: "homepage.min.js",
    wrapShim: true,
    paths: {
        "jquery": 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min',
        "jquery.treeview": 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-treeview/1.2.0/bootstrap-treeview.min',
        "jquery.tablesorter": 'https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.24.5/js/jquery.tablesorter.min',
        "jquery.datetimepicker": 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.37/js/bootstrap-datetimepicker.min',
        "jquery.magicsuggest": 'https://cdnjs.cloudflare.com/ajax/libs/magicsuggest/2.1.4/magicsuggest-min',
        "ol": 'https://cdnjs.cloudflare.com/ajax/libs/ol3/3.10.1/ol.min',
        "olext": 'libs/olext.min',
        "proj4": 'https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.12/proj4',
        "d3": 'https://cdnjs.cloudflare.com/ajax/libs/d3/4.4.0/d3.min',
        "d3-array": 'libs/d3-array.v1.min',
        "d3-geo": 'libs/d3-geo.v1.min',
        "d3-geo-projection": 'libs/d3-geo-projection.v1.min',
        "topojson": 'libs/topojson.v1.min',
        "moment": 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min',
        "maps": 'maps',
        "rest_urls": 'rest_urls',
        "static_urls": 'static_urls',
        "taxonomy": 'taxonomy'
    },
    shim: {
        "jquery.treeview": ["jquery"],
        "jquery.tablesorter": ["jquery"],
        "jquery.datetimepicker": ["jquery", "moment"],
        "jquery.magicsuggest": ["jquery"]
    }
});
