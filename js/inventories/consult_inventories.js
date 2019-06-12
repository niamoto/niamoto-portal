import ol from 'openlayers';
import {getDefaultMap, makeGeoJSONLayer, Popup} from '../map_utils';

var map = getDefaultMap();
map.setTarget('map');
var inventories_layer;

function hidePreloader() {
    document.getElementById('preloader').style.display = 'none';
};

$(document).ready(function() {
    $("#inventories_table").tablesorter({
        dateFormat: "ddmmyyyy"
    });
    // Load data
    $.ajax({
        type: 'GET',
        url: rapid_inventory_url,
        success: function(result) {
          var inventories_geojson = result;
          addInventoriesLayer(inventories_geojson);
          hidePreloader();
        }
    });

    function addInventoriesLayer(inventories_geojson) {
        // Create and add massif layer
        inventories_layer = makeGeoJSONLayer(
            inventories_geojson, {
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 5,
                        fill: new ol.style.Fill({
                            color: '#e2bc15'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#fff1ae',
                            width: 1
                        }),
                    })
                })
        });
        map.addLayer(inventories_layer);
        var hover_interaction = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove,
            layers: [inventories_layer],
            updateWhileInteracting: true,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({
                        color: '#e2bc15'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#fff1ae',
                        width: 2
                    }),
                })
            })
        });
        map.addInteraction(hover_interaction);
        addPopupOverlay();
    };

    function addPopupOverlay() {
        var popup = new Popup({
            'positioning': 'bottom-center',
            'autoPan': true,
            'autoPanAnimation': {
                'duration': 250
            }
        });
        map.addOverlay(popup);
        var point_select = new ol.interaction.Select({
            'condition': ol.events.condition.click,
            'layers': [inventories_layer],

        });
        point_select.on('select', function(evt) {
            var selection = point_select.getFeatures();
            if (selection.getLength() > 0) {
                var point = selection.item(0);
                var coord = point.getGeometry().getCoordinates();
                var title = point.get('observer_full_name');
                var content = point.get('inventory_date')
                        + ' - '
                        + point.get('location_description')
                        + '<br><a href="' + point.get('id') + '/">'
                        + 'Inventaire complet'
                        + '</a>';
                popup.show(
                    coord,
                    title,
                    content
                );
            } else {
                popup.hide();
            }
        });
        $('.olext-popup-closer').click(function() {
            point_select.getFeatures().clear();
        });
        map.addInteraction(point_select);
    };

});
