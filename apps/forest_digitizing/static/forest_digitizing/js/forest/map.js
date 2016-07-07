/**
* Map for forest visualization app.
*/

forest.map = {};
forest.sources = {};
forest.layers = {};

// Add EPSG:32758 projection
proj4.defs(
    "EPSG:32758",
    "+proj=utm +zone=58 +south +datum=WGS84 +units=m +no_defs"
);

var wms_url = 'http://carto.gouv.nc/arcgis/services/fond_imagerie/MapServer/WMSServer';
var target = 'map';
var view = new ol.View({
    'projection': 'EPSG:32758',
    'center': new ol.proj.transform(
        [165.875, -21.145],
        'EPSG:4326',
        'EPSG:32758'
    ),
    'zoom': 7.5
});
forest.map = new ol.Map({
    'target': target,
    'layers': [
        new ol.layer.Tile({
            'source': new ol.source.TileWMS({
                'url': wms_url,
                'params': {
                    'LAYERS': '0',
                    'FORMAT': 'image/png',
                    'CRS': 'EPSG:32758'
                },
                'serverType': 'mapserver'
            })
        })
    ],
    'view': view,
    'controls': [
        new ol.control.Zoom(),
        new olext.control.CurrentScale(),
        new olext.control.SetScale(3000)
    ]
});

forest.sources.massif = null;
forest.sources.problem = null;

forest.layers.massif = null;
forest.layers.forest3k = null;
forest.layers.forest30k = null;
forest.layers.problem = null;

forest.layers.initMassifLayer = function(geojson) {
    forest.layers.massif = olext.utils.makeGeoJSONLayer(
        geojson,
        {
            'style': forest.styles['massif_style'],
            'image_vector': true
        }
    );
    forest.map.addLayer(forest.layers.massif);
    forest.sources.massif = forest.layers.massif.getSource().getSource();
};

forest.layers.initForest3kLayer = function() {
    var wms_url = geoserver_base_url + "niamoto/wms?" +
    "service=WMS&version=1.1.0&request=GetMap" +
    "&layers=niamoto:forest_digitizing_forestfragment3k" +
    "&srs=EPSG:32758" +
    "&cql_filter=massif_id='" + massif_id + "'";
    forest.layers.forest3k = new ol.layer.Tile({
        'source': new ol.source.TileWMS({
            'url': wms_url,
        })
    })
    forest.map.addLayer(forest.layers.forest3k);
};

forest.layers.initForest30kLayer = function() {
    var wms_url = geoserver_base_url + "niamoto/wms?" +
    "service=WMS&version=1.1.0&request=GetMap" +
    "&layers=niamoto:forest_digitizing_forestfragment30k" +
    "&srs=EPSG:32758" +
    "&cql_filter=massif_id='" + massif_id + "'";
    forest.layers.forest30k = new ol.layer.Tile({
        'source': new ol.source.TileWMS({
            'url': wms_url,
        })
    })
    forest.map.addLayer(forest.layers.forest30k);
};

var selected_problem = null;

forest.layers.initProblemLayer = function(geojson) {
    forest.layers.problem = olext.utils.makeGeoJSONLayer(
        geojson,
        {
            'style': forest.styles['problem_style']
        }
    );
    forest.map.addLayer(forest.layers.problem);
    forest.sources.problem = forest.layers.problem.getSource();
    forest.problems.problem_source = forest.sources.problem;
    // Point selection
    var point_select = new ol.interaction.Select({
        'condition': ol.events.condition.click,
        'filter': function(feature) {
            return feature.getId();
        },
        'layers': [forest.layers.problem],
        'style': forest.styles['selected_point_style']
    });
    point_select.on('select', function(evt) {
        var selection = point_select.getFeatures();
        if (selection.getLength() > 0) {
            var pb = selection.item(0);
            forest.problems.setCurrentProblem(pb);
        } else {
            forest.problems.setCurrentProblem(null);
        }
    });
    forest.problems.problem_select = point_select;
    forest.map.addInteraction(point_select);
    // Point highlight
    var point_highlight = new ol.interaction.Select({
        'condition': function(evt) {
            if (evt.type == 'pointermove' && !evt.dragging) {
                return true;
            }
            return false;
        },
        'layers': [forest.layers.problem],
        'style': forest.styles['overlay_style']
    });
    forest.map.addInteraction(point_highlight);
    // Add problem control
    var m_key_name = forest.sources.massif.getFeatures()[0].get('key_name');
    forest.map.addControl(new forest.map.AddProblem({
        'layer': forest.layers.problem,
        'map': forest.map,
        'massif_key_name': m_key_name,
        'problem_types': [
            'Frontière',
            'Limite de la forêt',
            'Visibilité',
            'A inclure',
            'A exclure',
            'Autre'
        ]
    }));
};


/*--------------------------------------*/
/* TODO: Make it more generic, in olext */
/*--------------------------------------*/

/**
* Return a combo box element filled with a list of options.
*/
function getComboBox(id, optionList) {
    var combo = $('<select class="pb_type_select"></select>').attr("id", id);
    $.each(optionList, function (i, el) {
        combo.append("<option>" + el + "</option>");
    });
    return combo;
}

/**
 * @constructor
 * Custom control allowing the draw of a feature on click.
 */
forest.map.AddProblem = function(opt_options) {
    var options = opt_options || {};
    var this_ = this;
    var problem_types = options['problem_types'];
    var massif_key_name = options['massif_key_name'];
    var layer = options['layer'];
    var source = layer.getSource();
    var ol_map = options['map'];
    var coordinate;
    var last_problem;
    var active;

    var button = document.createElement('button');
    button.innerHTML = "Problème";

    var $popup_form_element = $('<div></div>');
    var $map_element = $("#map");
    $map_element.append($popup_form_element);
    $popup_form_element.addClass('popup-form');

    var $type_combo = getComboBox('type_combo', problem_types);
    var tarea = '<textarea class="add_pb_textarea"></textarea>';
    var $comment_input = $(tarea);
    var $ok_button = $('<button></button>');
    var $cancel_button = $('<button></button>');
    $ok_button.html('Ok');
    $cancel_button.html('Annuler');
    $popup_form_element.append($type_combo)
    $popup_form_element.append($comment_input);
    $popup_form_element.append($('<br>'));
    $popup_form_element.append($ok_button);
    $popup_form_element.append($cancel_button);

    function cancel(evt) {
        if (last_problem) {
            source.removeFeature(last_problem);
        }
        popup_form.setPosition(undefined);
        active = false;
    };

    function ok(evt) {
        var csrftoken = $.cookie('csrftoken');
        $.ajaxSetup({
            'beforeSend': function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        });
        $.ajax({
            'url': 'add_problem',
            'type': 'POST',
            'data': {
                'massif_key_name': massif_key_name,
                'x': coordinate[0],
                'y': coordinate[1],
                'problem': $type_combo.val(),
                'comment': $comment_input.val()
            },
            'success': function(response) {
                data = JSON.parse(response);
                last_problem.set('id', data['id']);
                last_problem.setId(data['id']);
                last_problem.set('creator_name',
                                 data['creator_full_name']);
                last_problem.set('creator_username',
                                 data['creator_username']);
                last_problem.set('comments', data['comments']);
                last_problem.set('problem', data['problem'])
                popup_form.setPosition(undefined);
                active = false;
            },
            'error': function(response) {
                msg = ["Erreur: Impossible d'ajouter le problème.\n",
                       "Veuillez contacter l'administrateur du site si ",
                       "l'erreur persiste."];
                alert(msg.join(''));
                cancel();
            }
        });
    };

    $cancel_button.on('click', cancel);
    $ok_button.on('click', ok);

    var popup_form = new ol.Overlay({
        'element': $popup_form_element,
        'positioning': 'bottom-center'
    });
    ol_map.addOverlay(popup_form);

    var draw = new ol.interaction.Draw({
        'source': source,
        'type': ('Point'),
        'condition': function(evt) {
            var b = ol.events.condition.noModifierKeys(evt);
            return b && (evt.originalEvent.button == 0);
        }
    });

    draw.on('drawend', function(evt) {
        last_problem = evt.feature;
    });

    function addProblem() {
        if (active) {
            return;
        }
        active = true;
        var map = this_.getMap();
        map.addInteraction(draw);
        map.once('click', function(evt) {
            coordinate = evt.coordinate;
            $comment_input.val('');
            popup_form.setPosition(coordinate);
            map.removeInteraction(draw);
        });
    }
    button.addEventListener('click', addProblem, false);

    var div = document.createElement('div');
    div.appendChild(button);
    div.className = 'add-comment ol-unselectable ol-control';
    ol.control.Control.call(this, {
        'element': div,
        'target': options['target']
    });
};
ol.inherits(forest.map.AddProblem, ol.control.Control);
