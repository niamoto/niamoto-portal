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
            new ol.control.Zoom(),
            new olext.control.CurrentScale(),
            new olext.control.SetScale(3000)
        ]
    });

    // Selected massif/row reference
    var selected_massif = null;
    var selected_row = null;

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

    popup = new olext.overlay.Popup({
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
            // Move and select the corresponding row in the table
            var m_table_top = $('#massif_table').offset().top;
            var row = $('#' + key_name);
            var scroll_top = row.offset().top - m_table_top;
            var scroll_table = $(".tablesorter-scroller-table");
            scroll_table.animate({scrollTop: scroll_top}, 500);
        }
    };

    function setCurrentMassif(massif) {
        selected_massif = massif.get('key_name');
        updateDetails(massif);
        massif_source.changed();
        // Set selected row style
        var row = $('#' + selected_massif);
        if (selected_row) {
            selected_row.removeClass('selected');
        }
        selected_row = row;
        selected_row.addClass('selected');
    };

    function updateDetails(massif) {
        var id = massif.get('id');
        var key_name = massif.get('key_name');
        var name = massif.get('full_name');
        var operator = massif_data[key_name]['operator'];
        var status = massif_data[key_name]['status_display'];
        var status_idx = massif_data[key_name]['status'];
        var file_available = massif_data[key_name]['file_available'];
        var link = '';
        if (status_idx > 0) {
            link = '<a href="' + key_name
                + '/">Consulter l\'état actuel de la digitalisation</a>'
        }
        var details = ["<h3>"];
        details.push(name);
        details.push("</h3>");
        details.push("Digitalisé par: ");
        details.push(operator);
        details.push("</p>");
        details.push("<p>");
        details.push("Status: ");
        details.push(status);
        details.push("</p>");
        details.push(link);
        $('#detail_content').html(details.join(''));
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
            var selected_style = olext.utils.makeStyle({
                fill_color: 'rgba(51, 133, 214, 0.9)',
                stroke_color: 'rgb(174, 194, 214)',
                stroke_width: 1
            });
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
                if (k_n == selected_massif) {
                    return [selected_style];
                }
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
                console.log("click!")
                selectMassif(evt.pixel);
            });

            // Directly go to massif page on dblclick
            map.on('dblclick', function(evt) {
                if (selected_massif == null) {
                    return
                }
                window.location.href = selected_massif;
            });

            // On table click select massif
            $(".massif_button").click(function() {
                var massif_key_name = $(this).attr('value');
                setCurrentMassif(massifs_keymap[massif_key_name]);
            });

             // On table dblclick go to massif page
            $(".massif_button").dblclick(function () {
                var massif_key_name = $(this).attr('value');
                window.location.href = massif_key_name;
            });
            fitMassif();
        };
        $(window).resize(sizeContent);
        sizeContent();
    });
})(jQuery);
