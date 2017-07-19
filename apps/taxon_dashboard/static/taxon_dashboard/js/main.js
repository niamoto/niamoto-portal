requirejs.config({
    baseUrl: '/static/taxon_dashboards/js',
});

require([
    'jquery',
    'taxonomy',
    'd3',
    'topojson',
    'static_urls',
    'd3_distribution_donut',
    'd3_map',
    'd3_elevation_rainfall_scatterplot',
    'jquery.treeview',
], function($, taxonomy, d3, topojson, static_urls, d3_distribution_donut, d3_map, d3_elevation_rainfall_scatterplot) {

    var preloader_count = 0;

    var color = [
        "#5496c4", "#ffd24d", "#a29cc9", "#f96353", "#6cc6b7",
        "#fcac4f", "#a0d643", "#f99fcd", "#b068b1", "#b3b3b3"
    ];

    var sorted_distribution = [];
    var total = 0;
    var map_color = {};


    function buildSortedDistribution(taxon_data) {
        var data = taxon_data['taxon_distribution'];
        total = taxon_data['nb_occurrences'];
        // Sort data and retain only 10 categories
        data.sort(function(a, b) {
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;
            return 0;
        });
        data.reverse();
        if (data.length > 10) {
            var others = ['Autres', 0, []];
            for (var i = 9; i < data.length; i++) {
                var j = data[i];
                others[1] += j[1];
                others[2].push(j[0]);
            }
            data = data.slice(0, 9);
            data.push(others);
        }
        var _map_color = {};
        for (var i = 0; i < data.length; i++) {
            _map_color[data[i][0]] = color[i];
        }
        map_color = _map_color;
        sorted_distribution = data;
    };


    function taxonSelected(node) {
        $('#selected_taxon_name').html(node['text']);
    }

    function updateTaxonData(taxon_id) {

        preloader_count = 0;
        showPreloader();

        var url = "/api/1.0/dashboard/taxon_dashboard/"
            + taxon_id + "/?include_coordinates=true"
            + "&include_taxon_distribution=true"
            + "&include_environmental_values=true";

        d3.json(url, function (error, data) {
            if (error) throw error;
            buildSortedDistribution(data);
            $('#taxon_treeview').trigger('taxonSelected', [
                data, sorted_distribution, total, map_color
            ]);
            hidePreloader(false);
            hidePreloader(false);
        });
    }

    function initSearch() {
        $('#input-search').val("");
        $('#input-search').change(function () {
            $('#taxon_treeview').treeview('collapseAll');
            var pattern = $('#input-search').val();
            var matching = $('#taxon_treeview').treeview('search', pattern, {
                ignoreCase: true,
                exactMatch: false,
                revealResults: true
            });
            if (matching.length == 0) {
                return
            }
            var first_element = $("[data-nodeid='" + matching[0]['nodeId'] + "']");
            var m_tree_top = $('#taxon_treeview').offset().top;
            var m_tree_scrolltop = $('#taxon_treeview').scrollTop();
            var scroll_top = first_element.offset().top - m_tree_top + m_tree_scrolltop;
            $('#taxon_treeview').animate({scrollTop: scroll_top}, 200);
        });
    };

    function initGeneralInformations() {

        var rank_map = {
            "FAMILY": "Famille",
            "GENUS": "Genre",
            "SPECIE": "Espèce",
            "INFRA": "Infra"
        }

        var height = $("#tax_proportion_total").height();
        var width = $("#tax_proportion_total").width();

        var formatPercent = d3.format(".3%");

        var previous_value = 0;

        var svg = d3.select("#tax_proportion_total").append("svg")
            .attr("width", width)
            .attr("height", height);

        $('#taxon_treeview').on('taxonSelected', function (event, data) {
            updateGeneralInformations(data);
        });

        function updateGeneralInformations(data) {
            var node = $('#taxon_treeview').treeview('getSelected')[0];
            $("#tax_rank_value").text(rank_map[node['rank']]);
            $("#tax_occ_nb_value").text(data['nb_occurrences']);
            var nb_total_occurrences = data['total_nb_occurrences'];
        }
    };

    function initModal() {
        $('#modal').on('shown.bs.modal', function() {
            $(document).off('focusin.modal');
        });
        $('#modal').modal({
            backdrop: 'static',
            keyboard: false
        });
        $('.modal-backdrop').appendTo('#right_panel');
        $('#taxon_treeview').on('taxonSelected', function (event, data) {
            $('#modal').modal('hide');
        });
    };


    function showPreloader() {
        document.getElementById('preloader').style.display = 'inline';
    }


    function hidePreloader(init) {
        preloader_count += 1;
        if (preloader_count >= 2) {
            document.getElementById('preloader').style.display = 'none';
            if (init) {
                initModal();
            }
        }
    };

    function make_node(node) {
        node['text'] = node['full_name'];
        node['icon'] = 'glyphicon';
        node['state'] = {
            expanded: false
        }
    };

    function make_leaf(node) {
        node['icon'] = 'glyphicon glyphicon-leaf';
    };

    $('#preloader').on('hide', function() {
        hidePreloader(true);
    });

    taxonomy.getTaxaTree(function(taxa_tree) {
        $('#taxon_treeview').treeview({
            data: taxa_tree,
            onNodeSelected: function (event, node) {
                taxonSelected(node);
                updateTaxonData(node['id']);
            }
        });
        hidePreloader(true);
    }, {
        make_node: make_node,
        make_leaf: make_leaf
    });

    initSearch();
    initGeneralInformations();
    d3_map.initMap();
    d3_distribution_donut.initDonutChart();
    d3_elevation_rainfall_scatterplot.initElevationRainfallScatterplot();
});
