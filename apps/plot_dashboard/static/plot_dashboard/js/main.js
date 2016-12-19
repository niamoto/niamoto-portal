requirejs.config({
    baseUrl: '/static/plot_dashboard/js',
});

require([
    'jquery',
    'rest_urls',
    'd3_map',
    'd3_families_donut',
    'jquery.treeview'
], function($, rest_urls, d3_map, d3_families_donut) {

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

    function initSearch() {
        $('#input-search').val("");
        $('#input-search').change(function () {
            var pattern = $('#input-search').val();
            var matching = $('#').treeview('search', pattern, {
                ignoreCase: true,
                exactMatch: false,
                revealResults: true
            });
            if (matching.length == 0) {
                return
            }
            var first_element = $("[data-nodeid='" + matching[0]['nodeId'] + "']");
            var m_tree_top = $('#plot_treeview').offset().top;
            var m_tree_scrolltop = $('#plot_treeview').scrollTop();
            var scroll_top = first_element.offset().top - m_tree_top + m_tree_scrolltop;
            $('#plot_treeview').animate({scrollTop: scroll_top}, 200);
        });
    };


    function buildPlotList() {
        $.ajax({
            type: 'GET',
            data: {
                name__icontains: "Parcelles 1ha (PN) -",
                ordering: "name"
            },
            url: rest_urls.plot_list,
            success: function(result) {
                $('#plot_treeview').treeview({
                    data: result.features.map(function(x) {
                        x['text'] = x.properties.name;
                        x['icon'] = 'fa fa-square';
                        return x;
                    }),
                    onNodeSelected: function (event, node) {
                        updateData(node);
                    }
                });
            }
        });
    };


    function updateData(node) {
        $('#selected_plot_name').html(node['text']);
        $('#plot_elevation').html(
            "<b>Altitude</b>: "  + node['properties']['elevation'] + " m"
        );
        $.ajax({
            type: 'GET',
            url: rest_urls.plot_dashboard + node['id'] + "/",
            success: function(result) {
                $('#plot_treeview').trigger('plotSelected', result);
            }
        });
    };


    $(document).ready(function() {
        $('#preloader').on('elementLoaded', function (event, data) {
            hidePreloader(data);
        })
        buildPlotList();
        initSearch();
        d3_map.initMap();
        d3_families_donut.initFamiliesDonut();
    });
});
