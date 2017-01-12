requirejs.config({
    baseUrl: '/static/plot_dashboard/js',
});

require([
    'jquery',
    'rest_urls',
    'd3_map',
    'd3_families_donut',
    'd3_species_donut',
    'd3_diameters',
    'jquery.select'
], function($, rest_urls, d3_map, d3_families_donut, d3_species_donut, d3_diameters) {

    function initModal() {
        $('#modal').on('shown.bs.modal', function() {
            $(document).off('focusin.modal');
        });
        $('#modal').modal({
            backdrop: 'static',
            keyboard: false
        });
        $('.modal-backdrop').appendTo('#right_panel');
        $('#plot_select').on('plotSelected', function (event, data) {
            $('#modal').modal('hide');
        });
    };

    function showPreloader() {
        document.getElementById('preloader').style.display = 'inline';
    }

    function hidePreloader() {
        document.getElementById('preloader').style.display = 'none';
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
                    if (obj.properties.name == "Parcelles 1ha (AMAP) - Calcaires de Koumac") {
                        return map;
                    }
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
                    showPreloader();
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
                    "<b>Nombre d'individus</b>: " + result['nb_occurrences']
                );
                $('#nb_species').html(
                    "<b>Richesse spécifique</b>: " + result['richness']['nb_species']
                );
                $('#nb_families').html(
                    "<b>Nombre de familles</b>: " + result['richness']['nb_families']
                );
                $('#nb_genus').html(
                    "<b>ombre de genres</b>: " + result['richness']['nb_genus']
                );
                hidePreloader();
            }
        });
    };


    $(document).ready(function() {
        $('#preloader').on('elementLoaded', function (event, data) {
            hidePreloader();
        })
        buildPlotList();
        d3_map.initMap();
        d3_families_donut.initFamiliesDonut();
        d3_species_donut.initSpeciesDonut();
        d3_diameters.initDiametersHistogram();
        initModal();
    });
});
