({
    baseUrl: ".",
    name: "main",
    out: "main.min.js",
    wrapShim: true,
    paths: {
        "jquery": 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min',
        "jquery.treeview": 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-treeview/1.2.0/bootstrap-treeview.min',
        "jquery.tablesorter": 'https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.24.5/js/jquery.tablesorter.min',
        "jquery.datetimepicker": 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.17.37/js/bootstrap-datetimepicker.min',
        "jquery.magicsuggest": 'https://cdnjs.cloudflare.com/ajax/libs/magicsuggest/2.1.4/magicsuggest-min',
        "jquery.select": "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.1/js/bootstrap-select.min",
        "ol": 'https://cdnjs.cloudflare.com/ajax/libs/ol3/3.10.1/ol.min',
        "olext": '../../../../../web/static/js/olext.min',
        "proj4": 'https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.12/proj4',
        "d3": 'https://cdnjs.cloudflare.com/ajax/libs/d3/4.4.0/d3.min',
        "d3-array": '../../../../../web/static/js/libs/d3-array.v1.min',
        "d3-geo": '../../../../../web/static/js/libs/d3-geo.v1.min',
        "d3-geo-projection": '../../../../../web/static/js/libs/d3-geo-projection.v1.min',
        "topojson": '../../../../../web/static/js/libs/topojson.v1.min',
        "moment": 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min',
        "maps": '../../../../../web/static/js/maps',
        "rest_urls": '../../../../../web/static/js/rest_urls',
        "static_urls": '../../../../../web/static/js/static_urls',
        "taxonomy": '../../../../../web/static/js/taxonomy'
    },
    shim: {
        "jquery.treeview": ["jquery"],
        "jquery.tablesorter": ["jquery"],
        "jquery.datetimepicker": ["jquery", "moment"],
        "jquery.magicsuggest": ["jquery"],
        "jquery.select": ["jquery"]
    }
});
