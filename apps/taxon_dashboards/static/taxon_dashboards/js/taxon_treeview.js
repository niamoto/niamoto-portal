(function($, undefined) {

    function getTaxaTreeFromTaxaList(taxa_list) {
        var tax_dict = {};
        var tree = [];
        for (var i = 0; i < taxa_list.length; i++) {
            var taxon = taxa_list[i]
            taxon['text'] = taxon['full_name'];
            taxon['nodes'] = [];
            taxon['state'] = {
                expanded: false,
            },
            tax_dict[taxon['id']] = taxon;
        }
        for (var tax_id in tax_dict) {
            var tax = tax_dict[tax_id];
            if (tax['parent'] != null) {
                tax_dict[tax['parent']]['nodes'].push(tax);
            }
        }
        for (var tax_id in tax_dict) {
            var tax = tax_dict[tax_id];
            if (tax['nodes'].length == 0) {
                tax['nodes'] = null;
                tax['icon'] = 'glyphicon glyphicon-leaf';
            }
            if (tax['parent'] == null) {
                tree.push(tax);
            }
        }
        return tree;
    };

    function buildTaxaTree() {
        $.ajax({
            type: 'GET',
            url: taxa_tree_url,
            success: function (result) {
                var taxa_list = result;
                var taxa_tree = getTaxaTreeFromTaxaList(taxa_list);
                $('#taxon_treeview').treeview({data: taxa_tree});
            }
        })
    };

    $(document).ready(function () {
        buildTaxaTree();
        $('#input-search').val("");
        $('#input-search').change(function () {
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
    });

})(jQuery);
