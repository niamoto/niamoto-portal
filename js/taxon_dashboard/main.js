import {getTaxaTree} from '../taxonomy';
import * as static_urls from '../static_urls';
// import {initDonutChart} from './d3_distribution_donut';
import * as d3_distribution from './d3_distribution_barh';
import * as d3_gauges from './d3_gauges';
import * as d3_distribution_alt from './d3_distribution_alt';
import {initMap} from './d3_map';
import {initElevationRainfallScatterplot} from './d3_elevation_rainfall_scatterplot';
import 'd3';
import 'topojson';

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
    // data.reverse();
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

    d3.json(url, function (data) {
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
        var scroll_top = first_element.offset().top 
                        - m_tree_top 
                        + m_tree_scrolltop;
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

function showPreloader() {
    document.getElementById('preloader').style.display = 'inline';
}


function hidePreloader(init) {
    preloader_count += 1;
    if (preloader_count >= 2) {
        document.getElementById('preloader').style.display = 'none';
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

getTaxaTree(function(taxa_tree) {
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

$(document).ready(function() {

    initSearch();
    initGeneralInformations();

    initMap();
    d3_distribution.initBarhChart();
    d3_gauges.initGauges();
    d3_distribution_alt.initDistributionAlt();
    initElevationRainfallScatterplot();

    var leftPanel = $("#left_panel");
    var leftPanelPlaceholder = $("#left_panel_placeholder");
    var didScroll = false;
    $(window).scroll(function() {
        didScroll = true;
    });
    setInterval(function() {
        if (didScroll) {
            didScroll = false;
            var top = leftPanelPlaceholder.offset().top;
            var doc_height = $(document).height();
            var viewTop = $(window).scrollTop();
            var viewBottom = $(window).scrollTop() + $(window).height();
            if ((viewTop + 70) >= top && viewBottom <= (doc_height - 41)) {
                var width = leftPanel.width();
                var height = leftPanel.height();
                leftPanel.removeClass("panel-bottom");
                leftPanel.addClass("panel-fixed");
                leftPanel.width(width);
                leftPanel.height(height);
            } else {
                if (viewBottom >= (doc_height - 41)) {
                    leftPanel.addClass("panel-bottom");
                    leftPanel.removeClass("panel-fixed");
                } else {
                    leftPanel.removeClass("panel-bottom");
                    leftPanel.removeClass("panel-fixed");
                }
            }
        }
    }, 50);
});
