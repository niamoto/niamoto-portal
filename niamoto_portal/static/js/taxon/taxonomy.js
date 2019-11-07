/**
 * Taxonomy utils.
 */

import * as restUrls from '../restUrls'

function getTaxaTreeFromTaxaList (taxa_list, options) {
  /**
   * Builds a nested taxonomic tree from a flat taxon list.
   */

  // Init options
  options = options || {}
  var id_attr = options.id_attr || 'id'
  var make_node = options.make_node || null
  var parent_attr = options.parent_attr || 'parent_id'
  var nodes_attr = options.nodes_attr || 'nodes'
  var make_leaf = options.make_leaf || null

  var tax_dict = {}
  var tree = []
  for (var i = 0; i < taxa_list.length; i++) {
    var taxon = taxa_list[i]
    taxon[nodes_attr] = []
    if (make_node != null) {
      make_node(taxon)
    }
    tax_dict[taxon[id_attr]] = taxon
  }
  for (var tax_id in tax_dict) {
    var tax = tax_dict[tax_id]
    if (tax[parent_attr] != null) {
      tax_dict[tax[parent_attr]][nodes_attr].push(tax)
    }
  }
  for (var i = 0; i < taxa_list.length; i++) {
    var tax = tax_dict[taxa_list[i][id_attr]]
    if (tax[nodes_attr].length == 0) {
      tax[nodes_attr] = null
      if (make_leaf != null) {
        make_leaf(tax)
      }
    }
    if (tax[parent_attr] == null) {
      tree.push(tax)
    }
  }
  return tree
};

export function getTaxaTree (success, options) {
  $.ajax({
    type: 'GET',
    url: restUrls.taxonList,
    success: function (result) {
      options = options || null
      var taxaList = result
      var taxaTree = getTaxaTreeFromTaxaList(taxaList, options)
      success(taxaTree)
    }
  })
};
