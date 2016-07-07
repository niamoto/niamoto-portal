(function($, undefined) {

    // Add EPSG:32758 projection
    proj4.defs(
        "EPSG:32758",
        "+proj=utm +zone=58 +south +datum=WGS84 +units=m +no_defs"
    );

    var wms_url = 'http://carto.gouv.nc/arcgis/services/fond_imagerie/MapServer/WMSServer';
    var target = 'map';
    var view = new ol.View({
        projection: 'EPSG:4326',
        center: new ol.proj.transform([165.875, -21.145],
                                      'EPSG:4326',
                                      'EPSG:4326'),
        zoom: 7.5
    });
    var inventories_layer;
    var map = new ol.Map({
        target: target,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: wms_url,
                    params: {
                        LAYERS: '0',
                        FORMAT: 'image/png',
                        CRS: 'EPSG:32758'
                    },
                    serverType: 'mapserver'
                })
            })
        ],
        view: view,
        controls: [
            new ol.control.Zoom(),
        ]
    });

    $(document).ready(function() {
        $("#inventories_table").tablesorter();
        // Load data
        var progress_bar = new olext.control.ProgressBar();
        progress_bar.setLabel("0%");
        map.addControl(progress_bar);
        $.ajax({
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var progr = (evt.loaded / evt.total * 100).toFixed(1);
                        progress_bar.setValue(progr);
                        progress_bar.setLabel(progr + "%");
                    }
                }, false);
                return xhr;
            },
            type: 'GET',
            url: rapid_inventory_url,
            success: function(result) {
              var inventories_geojson = result;
              addInventoriesLayer(inventories_geojson);
              map.removeControl(progress_bar);
            }
        });

        function addInventoriesLayer(inventories_geojson) {
            // Create and add massif layer
            inventories_layer = window.olext.utils.makeGeoJSONLayer(
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
            hover_interaction = new ol.interaction.Select({
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
            var popup = new olext.overlay.Popup({
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
                            + '<br><a href=' + point.getId() + '>'
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

})(jQuery);
