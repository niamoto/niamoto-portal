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
    'jquery.treeview',
], function($, taxonomy, d3, topojson, static_urls, d3_distribution_donut, d3_map) {

    var preloader_count = 0;

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
            $('#taxon_treeview').trigger('taxonSelected', data);
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

});
