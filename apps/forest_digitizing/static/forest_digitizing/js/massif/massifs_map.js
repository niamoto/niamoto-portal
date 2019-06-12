(function($, undefined) {

    var massifs_keymap,
        massif_source,
        massif_layer;

    // Add EPSG:32758 projection
    proj4.defs("EPSG:32758",
               "+proj=utm +zone=58 +south +datum=WGS84 +units=m +no_defs");

    var wms_url = 'http://carto.gouv.nc/arcgis/services/fond_imagerie/MapServer/WMSServer';
    var target = 'map';
    var view = new ol.View({
        projection: 'EPSG:32758',
        center: new ol.proj.transform([165.875, -21.145],
                                      'EPSG:4326',
                                      'EPSG:32758'),
        zoom: 7.5
    });
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
        interactions : ol.interaction.defaults({doubleClickZoom :false}),
        controls: [
            new olext.control.CurrentScale()
        ]
    });

    // Selected massif/row reference
    var selected_massif = null;

    // Create feature overlay
    var overlay_style = olext.utils.makeStyle({
        fill_color: 'rgba(0, 0, 0, 0.2)',
        stroke_color: '#FFFFFF',
        stroke_width: 1
    });
    var featureOverlay = new ol.FeatureOverlay({
        map: map,
        style: overlay_style
    });

    // Hovered massif highlighting and info popup
    var highlight;

    var popup = new olext.overlay.Popup({
        positioning: 'bottom-center'
    });

    map.addOverlay(popup);

    var highlightMassif = function(evt, pixel) {
        var pixel = map.getEventPixel(evt.originalEvent);
        var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            return feature;
        });
        if (feature) {
            popup.setPosition(evt.coordinate);
        }
        if (feature !== highlight) {
            if (highlight) {
                featureOverlay.removeFeature(highlight);
            }
            highlight = feature;
            if (highlight) {
                featureOverlay.addFeature(highlight);
                popup.setContent(highlight.get('full_name'));
            } else {
                popup.hide();
            }
        }
    };

    // Select massif on feature click
    function selectMassif(pixel) {
        var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            return feature;
        });
        if (feature) {
            var key_name = feature.get('key_name');
            setCurrentMassif(feature);
        }
    };

    function setCurrentMassif(massif) {
        selected_massif = massif.get('key_name');
        updateDetails(massif);
        massif_source.changed();
    };

    function updateDetails(massif) {
    };

    // Window resizing
    function fitMassif() {
        var duration = 800;
        var pan = ol.animation.pan({
            duration: duration,
            source: view.getCenter()
        });
        var zoom = ol.animation.zoom({
            duration: duration,
            resolution: view.getResolution()
        });
        map.beforeRender(pan, zoom);
        view.fitExtent(massif_source.getExtent(), map.getSize());
    }

    function sizeContent() {
        var new_height = $("#page-wrapper").height() * 0.85;
        $(".column").css("height", new_height + "px");
        var header_height = $(".tablesorter-scroller-header").height();
        var table_height = $("#massif_form").height() - header_height;
        $(".tablesorter-scroller-table").css({
            height: ((table_height - 1) + "px"),
            'max-height': 'none'
        });
        map.updateSize();
    };

    // Massif selection
    $(document).ready(function() {

        var wfs_url = geoserver_base_url + 'niamoto/ows?' +
                      'service=WFS&version=1.0.0&request=GetFeature' +
                      '&typeName=niamoto:niamoto_data_massif' +
                      '&outputFormat=application%2Fjson' +
                      '&srsname=EPSG:32758&';

        $.ajax({
            url: wfs_url,
            dataType: 'json',
            jsonp: false,
            success: function(result) {
                addMassifLayer(result);
            }
        });

        function addMassifLayer(geojson_result) {
            // Massif style
            var not_digitized_style = olext.utils.makeStyle({
                fill_color: 'rgba(255, 120, 120, 0.5)',
                stroke_color: 'rgb(255, 120, 120)',
                stroke_width: 1
            });
            var being_digitized_style = olext.utils.makeStyle({
                fill_color: 'rgba(255, 163, 0, 0.5)',
                stroke_color: 'rgb(255, 163, 0)',
                stroke_width: 1
            });
            var digitized_style = olext.utils.makeStyle({
                fill_color: 'rgba(120, 255, 120, 0.5)',
                stroke_color: 'rgb(120, 255, 120)',
                stroke_width: 1
            });
            var massif_style = function(feature, resolution) {
                k_n = feature.get('key_name');
                status = massif_data[k_n]['status'];
                var style = [ol.style.Style()];
                switch (status) {
                    case '0':
                        style = [not_digitized_style];
                        break;
                    case '1':
                        style = [being_digitized_style];
                        break;
                    case '2':
                        style = [digitized_style];
                        break;
                }
                return style;
            };
            // Create and add massif layer
            massif_layer = window.olext.utils.makeGeoJSONLayer(
                geojson_result,
                {
                    style: massif_style,
                    image_vector: true,
                }
            );
            map.addLayer(massif_layer);
            massif_source = massif_layer.getSource().getSource();
            massifs_keymap = {};
            massif_source.forEachFeature(function(feature) {
                massifs_keymap[feature.get('key_name')] = feature;
                return false;
            });
            // Pointer move event handler for highlight and popup
            map.on('pointermove', function(evt) {
                if (evt.dragging) {
                    return;
                }
                highlightMassif(evt);
            });
            // On click event handler for massif selection
            map.on('click', function(evt) {
                selectMassif(evt.pixel);
                if (selected_massif == null) {
                    return
                }
                window.location.href = selected_massif;
            });

            fitMassif();
        };
        $(window).resize(sizeContent);
        sizeContent();
    });
})(jQuery);
