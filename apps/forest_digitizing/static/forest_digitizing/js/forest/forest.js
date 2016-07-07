/**
* Forest map for a massif.
*/

map = forest.map;
view = map.getView();

map.addOverlay(forest.problems.popup);

function fitMassif() {
    view.fitExtent(forest.sources.massif.getExtent(), map.getSize());
};

function sizeContent() {
    var newHeight = $("#content").height() * 0.85;
    $(".column").css("height", newHeight + "px");
    map.updateSize();
};

$(document).ready(function() {

    function addProblemsLayer(problem_geojson) {
        forest.layers.initProblemLayer(problem_geojson);

    };

    var massif_wfs_url = geoserver_base_url + 'niamoto/ows?' +
                  'service=WFS&version=1.0.0&request=GetFeature' +
                  '&typeName=niamoto:niamoto_data_massif' +
                  '&outputFormat=application%2Fjson' +
                  '&srsname=EPSG:32758&' +
                  "&cql_filter=key_name='" + massif_key_name + "'";

    var problem_wfs_url = geoserver_base_url + 'niamoto/ows?' +
                  'service=WFS&version=1.0.0&request=GetFeature' +
                  '&typeName=niamoto:forest_digitizing_digitizingproblem_view ' +
                  '&outputFormat=application%2Fjson' +
                  '&srsname=EPSG:32758&' +
                  "&cql_filter=massif_id='" + massif_id + "'";

    $.ajax({
        url: massif_wfs_url,
        dataType: 'json',
        jsonp: false,
        success: function(result) {
            forest.layers.initMassifLayer(result);
            forest.layers.initForest3kLayer();
            forest.layers.initForest30kLayer();
            $.ajax({
                url: problem_wfs_url,
                dataType: 'json',
                jsonp: false,
                success: function(result) {
                    addProblemsLayer(result);
                    addShowHideControl();
                }
            });
            fitMassif();
        }
    });

    function addShowHideControl() {
        var show_hide_control = new olext.control.LayersVisibility({
            'layers': [
                forest.layers.problem,
                forest.layers.forest3k,
                forest.layers.forest30k,
                forest.layers.massif
            ],
            'labels': [
                'Problèmes:',
                'Forêt (3k):',
                'Forêt (30k):',
                'Massif:'
            ],
            'initial_states': [
                true,
                true,
                false,
                true
            ]
        });
        map.addControl(show_hide_control);
    };
    $(window).resize(sizeContent);
    sizeContent();
});
