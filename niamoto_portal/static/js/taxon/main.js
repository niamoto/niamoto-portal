import * as restUrls from '../restUrls'
// import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
import {
  getTaxaTree
} from './taxonomy'
var TreeView = require('treeview')
// var d3_gauges = require('./d3_gauges');

var taxonTreeList = restUrls.taxonTreeList

function buildTaxonList () {
  var taxons = {}

  $.ajax({
    type: 'GET',
    url: taxonTreeList,
    success: function (result) {
      var tree = new TreeView(result, 'taxon_treeview', 'list-group-item')
      preloader.hidePreloader()
    }
  })
}

function updateData (taxon) {
  $.ajax({
    type: 'GET',
    url: restUrls.taxonList + taxon.id + '/',
    success: function (response) {
      updateGeneralInformations(response)
      preloader.hidePreloader()
    }
  })
}

function updateGeneralInformations (data) {
  $('#tax_endemia_link_value').attr('href', 'http://endemia.nc/flore/fiche' + data.id_endemia)
  $('#tax_endemia_link_value').text('fiche ' + data.full_name)
  $('#tax_full_name').html(data.full_name)
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
        preloader.showPreloader()
        updateData(node)
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
