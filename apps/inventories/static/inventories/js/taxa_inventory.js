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
        zoom: 7.0
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
        controls: [
            new ol.control.Zoom(),
        ]
    });

    // Features overlay
    var features = new ol.Collection();
    var source = new ol.source.Vector({features: features});
    var featureOverlay = new ol.layer.Vector({
        source: source,
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
    })
    featureOverlay.setMap(map);

    // Draw point interaction
    var draw = new ol.interaction.Draw({
        'type': ('Point'),
        'features': features,
        'condition': function(evt) {
            var b = ol.events.condition.noModifierKeys(evt);
            return b && (evt.originalEvent.button == 0);
        }
    });
    map.addInteraction(draw);

    // Remove draw interaction after first click
    map.once('click', function(evt) {
        map.removeInteraction(draw);
    });

    // Modify interaction
    var modify = new ol.interaction.Modify({
      features: features,
    });
    map.addInteraction(modify);

    // Coordinates control
    var lat_control = function(opt_options) {
        var options = opt_options || {};
        var lat = document.createElement('div');
        lat.className = "inline";
        lat_html = [
            '<label for="_coords_long"  class="control-label required-field">Latitude (WGS84) - Exemple: -20.939244</label>',
            '<div class="">',
            '<input id="_coords_lat" type="number" step="any" class="form-control">',
            '</div>'
        ];
        lat.innerHTML = lat_html.join('');
        lat.className = "coords_control form-group";
        ol.control.Control.call(this, {
            element: lat,
            target: options['target'],
            render: function(mapEvent) {
                if (features.getLength() > 0) {
                    var coords = features.item(0).getGeometry().getCoordinates();
                    document.getElementById("_coords_lat").value = coords[1];
                    document.getElementById("lat_hidden").value = coords[1];
                }
            }
        });
    };
    ol.inherits(lat_control, ol.control.Control);
    var long_control = function(opt_options) {
        var options = opt_options || {};
        var long = document.createElement('div');
        long.className = "inline";
        long_html = [
            '<label for="_coords_long"  class="control-label required-field">Longitude (WGS84) - Exemple: 165.344324</label>',
            '<div class="">',
            '<input id="_coords_long" type="number" step="any" class="form-control">',
            '</div>'
        ];
        long.innerHTML = long_html.join('');
        long.className = "coords_control form-group";
        ol.control.Control.call(this, {
            element: long,
            target: options['target'],
            render: function(mapEvent) {
                if (features.getLength() > 0) {
                    var coords = features.item(0).getGeometry().getCoordinates();
                    document.getElementById("_coords_long").value = coords[0];
                    document.getElementById("long_hidden").value = coords[0];
                }
            }
        });
    };
    ol.inherits(long_control, ol.control.Control);
    map.addControl(
        new lat_control({
            target: document.getElementById('lat_long')
        })
    );
    map.addControl(
        new long_control({
            target: document.getElementById('lat_long')
        })
    );

    function create_point() {
        var long = $("#long_hidden").val();
        var lat = $("#lat_hidden").val();
        if (long && lat) {
            var coords = [long, lat];
            var point_geom = new ol.geom.Point(coords);
            var point_feature = new ol.Feature({
                name: "inventory",
                geometry: point_geom
            });
            try {
                source.addFeature(point_feature);
                source.changed();
                map.removeInteraction(draw);
            } catch(err) {
                console.log(err);
                if (features.getLength() > 0) {
                    map.removeInteraction(draw);
                }
            }
        }

    };

    $(document).ready(function() {
        // Date picker
        $(".form_date").datetimepicker({format: 'DD/MM/YYYY'});
        // Magic suggest for taxa
        var read_only = $("#read_only_hidden").val() == 'True';
        var ms = $('#magicsuggest').magicSuggest({
            method: 'get',
            displayField: 'full_name',
            queryParam: 'full_name_like',
            data: 'http://localhost:8000/api/1.0/data/taxon/',
            maxSelection: null,
            placeholder: 'Saisissez un nom de taxon',
            allowFreeEntries: false,
            noSuggestionText: 'Aucun taxon correspondant',
            cls:'dropup',
            selectionPosition: 'bottom',
            selectionRenderer: function(data){
                return data.full_name;
            },
            disabled: read_only,
            useZebraStyle: true,
            value: taxa_value
        });
        $(ms).on('selectionchange', function(e) {
            $("#taxa_hidden").val(JSON.stringify(ms.getSelection()));
        });
        // Move point when changing coordinates on the input
        $("#_coords_long").change(function(evt) {
            var val = $("#_coords_long").val();
            document.getElementById("long_hidden").value = val;
            if (features.getLength() > 0) {
                var point = features.item(0);
                var coords = point.getGeometry().getCoordinates();
                point.getGeometry().setCoordinates([val, coords[1]]);
            } else {
                create_point();
            }
        });
        $("#_coords_lat").change(function(evt) {
            var val = $("#_coords_lat").val();
            document.getElementById("lat_hidden").value = val;
            if (features.getLength() > 0) {
                var point = features.item(0);
                var coords = point.getGeometry().getCoordinates();
                point.getGeometry().setCoordinates([coords[0], val]);
            } else {
                create_point();
            }
        });
        create_point();
        if ($("#read_only_hidden").val() == "True") {
            $("#_coords_lat").attr('readonly', true);
            $("#_coords_long").attr('readonly', true);
            map.removeInteraction(modify);
            $('#inventory_form').submit(false);
        }
    })

})(jQuery);
