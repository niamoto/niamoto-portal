import ol from 'openlayers';
import {getDefaultMap, makeGeoJSONLayer, Popup} from '../map_utils';

var map = getDefaultMap({zoom: 6.5});
map.setTarget('map');

function hidePreloader() {
    document.getElementById('preloader').style.display = 'none';
};

$(document).ready(function() {
    // Load data
    var nb_layer_loaded = 0;
    var rapid_inv_geojson = null;
    var taxa_inv_geojson = null;
    $.ajax({
        type: 'GET',
        url: rapid_inventories_url,
        success: function (result) {
            rapid_inv_geojson = result.results;
            for (let i=0; i < rapid_inv_geojson.features.length; i++) {
                rapid_inv_geojson
                    .features[i]
                    .properties
                    .type = "Inventaire rapide";
            }
            nb_layer_loaded += 1;
            if (nb_layer_loaded == 2) {
                addInventoriesLayer(rapid_inv_geojson, taxa_inv_geojson);
                hidePreloader();
            }
        }
    });
    $.ajax({
        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    let progr = (evt.loaded / evt.total * 100).toFixed(1);
                    progress_bar.setValue(progr);
                    progress_bar.setLabel(progr + "%");
                }
            }, false);
            return xhr;
        },
        type: 'GET',
        url: taxa_inventories_url,
        success: function (result) {
            taxa_inv_geojson = result.results;
            for (let i=0; i < taxa_inv_geojson.features.length; i++) {
                taxa_inv_geojson
                    .features[i]
                    .properties
                    .type = "Inventaire taxonomique";
            }
            nb_layer_loaded += 1;
            if (nb_layer_loaded == 2) {
                addInventoriesLayer(rapid_inv_geojson, taxa_inv_geojson);
                hidePreloader();
            }
        }
    });

    function addInventoriesLayer(rapid_inv_geojson, taxa_inv_geojson) {
        let fill = 'rgba(226, 188, 21, 0.7)';
        let stroke = '#474747';

        let features = new ol.Collection();
        let source = new ol.source.Vector({features: features});
        let vector = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: fill
                    }),
                    stroke: new ol.style.Stroke({
                        color: stroke,
                        width: 1
                    })
                })
            })
        });

        source.addFeatures(
            (new ol.format.GeoJSON()).readFeatures(rapid_inv_geojson)
        );
        source.addFeatures(
            (new ol.format.GeoJSON()).readFeatures(taxa_inv_geojson)
        );

        map.addLayer(vector);
        let hover_interaction = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove,
            layers: [vector],
            updateWhileInteracting: true,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({
                        color: "#66a3ff"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "#cce0ff",
                        width: 2
                    }),
                })
            })
        });
        map.addInteraction(hover_interaction);
        addPopupOverlay(vector);
    };

    function addPopupOverlay(layer) {
        let popup = new Popup({
            'positioning': 'bottom-center',
            'autoPan': true,
            'autoPanAnimation': {
                'duration': 250
            }
        });
        map.addOverlay(popup);
        let point_select = new ol.interaction.Select({
            'condition': ol.events.condition.click,
            'layers': [layer],

        });
        point_select.on('select', function(evt) {
            let selection = point_select.getFeatures();
            if (selection.getLength() > 0) {
                let point = selection.item(0);
                let coord = point.getGeometry().getCoordinates();
                let title = point.get('observer_full_name');
                let content = point.get('type')
                        + ' - '
                        + point.get('inventory_date')
                        + ' - '
                        + point.get('location_description');
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

    function createProgressBar(container, total, color, suffix, icon) {
        // From https://kimmobrunfeldt.github.io/progressbar.js/
        var bar = new ProgressBar.SemiCircle(container, {
            color: '#333',
            // This has to be the same size as the maximum width to
            // prevent clipping
            strokeWidth: 4,
            trailWidth: 1,
            easing: 'easeInOut',
            duration: 1400,
            text: {
                autoStyleContainer: false
            },
            from: { color: '#aaa', width: 1 },
            to: { color: color, width: 4 },
            // Set default step function for all animate calls
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
                var value = Math.round(circle.value() * total);
                if (value === 0) {
                    circle.setText('');
                } else {
                    circle.setText(
                        '<i class="fa ' + icon + '" aria-hidden="true"></i> '
                        + value
                        + "<p>" + suffix + "</p>"
                    );
                }
            }
        });
        bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
        bar.text.style.fontSize = '2rem';
        bar.animate(1.0);
    }

    createProgressBar(
        '#occurrence_count_container',
        niamoto_status.nb_occurrences,
        "#b3de69",
        " occurrences",
        "fa-pagelines"
    );
    createProgressBar(
        '#plot_count_container',
        niamoto_status.nb_plots,
        "#80b1d3",
        " parcelles",
        "fa-map-marker"
    );
    createProgressBar(
        '#provider_count_container',
        niamoto_status.nb_data_providers,
        "#969696",
        " sources",
        "fa-database"
    );
    createProgressBar(
        '#taxa_count_container',
        niamoto_status.nb_taxa,
        "#fb8072",
        " taxons",
        "fa-leaf"
    );
});
