import * as restUrls from '../restUrls'
// import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
import {
  getTaxaTree
} from './taxonomy'
// import * as TreeView from './treeview'
var TreeView = require('treeview')
// var gijgo = require('gijgo')
// var d3_gauges = require('./d3_gauges');

var taxonTreeList = restUrls.taxonTreeList

function buildTaxonList () {
  var taxons = {}

  $.ajax({
    type: 'GET',
    url: taxonTreeList,
    success: function (result) {
      var tree = new TreeView(result, 'taxon_treeview', 'list-group-item')
      // $('#taxon_treeview').tree({
      //   dataSource: result,
      //   uiLibrary: 'bootstrap4',
      //   textField: 'rank_name',
      //   border: true
      // })
      $('#taxon_treeview').on('select', function () {

      })
      preloader.hidePreloader()
    }
  })
}

function updateData (taxon) {
  $.ajax({
    type: 'GET',
    url: taxonList + taxon.id + '/',
    success: function (response) {
      $('#taxon_select').trigger('taxonSelected', response)
      preloader.hidePreloader()
    }
  })
}

function makeNode (node) {
  node.text = node.rank_name
  node.icon = 'fas'
  node.state = {
    expanded: false
  }
};

function makeLeaf (node) {
  node.icon = ''
};

document.addEventListener('DOMContentLoaded', function () {
  $('#preloader').on('elementLoaded', function (event, data) {
    preloader.hidePreloader()
  })

  // buildTaxonList()
  getTaxaTree(function (taxaTree) {
    $('#taxon_treeview').treeview({
      data: taxaTree,
      expandIcon: 'fas fa-plus',
      collapseIcon: 'fas fa-minus',
      emptyIcon: 'fas',
      nodeIcon: '',
      selectedIcon: '',
      selectedBackColor: '#688BA5',
      onNodeSelected: function (event, node) {
        // taxonSelected(node);
        // updateTaxonData(node['id']);
      }
    })
    preloader.hidePreloader()
  }, {
    make_node: makeNode,
    make_leaf: makeLeaf
  })
  // d3_map.initMap();
  // d3_families_donut.initFamiliesDonut("# families_donut ");
  // // d3_species_donut.initSpeciesDonut("#species_donut");
  // d3_species_barh.initSpeciesDonut("#species_donut");
  // d3_diameters.initDiametersHistogram();
  // d3_strates.initBarh();
  // d3_stems.initStems();
  // d3_type_plant.initTypePlantDonut("#type_plant_donut");
})
