requirejs.config({
    baseUrl: '/static/plot_dashboard/js',
});

require([
    'jquery',
    'rest_urls',
    'd3_map',
    'd3_families_donut',
    'd3_diameters',
    'jquery.select'
], function($, rest_urls, d3_map, d3_families_donut, d3_diameters) {

    var loaded_elements = [];
    var nb_elements_to_load = 1;

    function hidePreloader(element) {
        if (loaded_elements.indexOf(element) != -1) {
            return
        } else {
            loaded_elements.push(element)
            if (loaded_elements.length == nb_elements_to_load) {
                document.getElementById('preloader').style.display = 'none';
            }
        }
    };

    function buildPlotList() {
        var plots = {};
        $.ajax({
            type: 'GET',
            data: {
                name__icontains: "Parcelles 1ha (AMAP) - ",
                ordering: "name"
            },
            url: rest_urls.plot_list,
            success: function(result) {
                plots = result.features.reduce(function(map, obj) {
                    map[obj.id] = obj;
                    return map;
                }, {});
                var select = document.getElementById("plot_select");
                result.features.map(function(x) {
                    var option = document.createElement('option');
                    option.text = x.properties.name;
                    option.value = x.id;
                    select.add(option);
                });
                $('#plot_select').selectpicker({
                    noneSelectedText: "Selectionnez une parcelle"
                });
                $('#plot_select').selectpicker('val', null);
                $('#plot_select').change(function () {
                    updateData(plots[this.value]);
                })
            }
        });
    };


    function updateData(node) {
        $.ajax({
            type: 'GET',
            url: rest_urls.plot_dashboard + node['id'] + "/",
            success: function(result) {
                $('#plot_select').trigger('plotSelected', result);
                // Update plot general informations
                $('#selected_plot_name').html(node['properties']['name']);
                $('#plot_elevation').html(
                    "<b>Altitude</b>: "  + node['properties']['elevation'] + " m"
                );
                $('#nb_occurrences').html(
                    "<b>Nombre de tiges</b>: " + result['nb_occurrences']
                );
            }
        });
    };


    $(document).ready(function() {
        $('#preloader').on('elementLoaded', function (event, data) {
            hidePreloader(data);
        })
        buildPlotList();
        d3_map.initMap();
        d3_families_donut.initFamiliesDonut();
        d3_diameters.initDiametersHistogram();
    });
});
