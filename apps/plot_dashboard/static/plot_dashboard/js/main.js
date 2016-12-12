require([
    'jquery',
    'rest_urls',
    'jquery.treeview'
], function($, rest_urls) {

    function hidePreloader(init) {
        document.getElementById('preloader').style.display = 'none';
    };

    function initSearch() {
        $('#input-search').val("");
        $('#input-search').change(function () {
            var pattern = $('#input-search').val();
            var matching = $('#plot_treeview').treeview('search', pattern, {
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
                    })
                });
            }
        });
    };

    $(document).ready(function() {
        buildPlotList();
        initSearch();
    });
});
