require([
    'jquery',
    'rest_urls',
    'jquery.treeview'
], function($, rest_urls) {

    function hidePreloader(init) {
        document.getElementById('preloader').style.display = 'none';
    };

    function buildPlotList() {
        $.ajax({
            type: 'GET',
            data: {

            },
            url: rest_urls.plot_list,
            success: function(result) {
                console.log(result);
            }
        });
    };

    $(document).ready(function() {
        buildPlotList();
    });
});
