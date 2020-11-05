import * as restUrls from '../restUrls'
import * as d3Gauges from './d3Gauges'
import * as d3GraphBarv from './d3GraphBarvs'
import * as d3GraphBarh from './d3GraphBarhs'
import * as d3GraphOneBarv from './d3GraphOneBarv'
import * as d3GraphDonut from './d3GraphDonuts'
import * as preloader from '../preloader'
import {
  getTaxaTree
} from './taxonomy'
import color from '../../css/source/partials/_color_js.scss'

// var TreeView = require('treeview')
// var d3_gauges = require('./d3Gauges')


// make layer background
const wmsUrlNC = 'https://carto.gouv.nc/public/services/fond_relief/' +
  'MapServer/WMSServer'
const layerBackground = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: wmsUrlNC,
    params: {
      LAYERS: '0',
      TILED: true,
      FORMAT: 'image/png'
    },
    serverType: 'mapserver'
  })
})

// make layer Shape
const features = new ol.Collection()
const source = new ol.source.Vector({
  features: features
})
const layerShape = new ol.layer.Vector({
  source: source
})

// view for map center new caledonia
let view = new ol.View({
  projection: 'EPSG:4326',
  center: new ol.proj.transform([165.875, -21.145],
    'EPSG:4326',
    'EPSG:4326'),
  zoom: 6
})

var CenterControl = /* @__PURE__ */ (function (Control) {
  function CenterControl(optOptions) {
    var options = optOptions || {}

    var button = document.createElement('button')
    button.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>'

    var element = document.createElement('div')
    element.className = 'center ol-unselectable ol-control'
    element.style = 'top: .5em; right: .5em'
    element.appendChild(button)

    ol.control.Control.call(this, {
      element: element,
      target: options.target
    })

    button.addEventListener('click', this.handleCenter.bind(this), false)
  }

  if (ol.control.Control) CenterControl.__proto__ = ol.control.Control
  CenterControl.prototype = Object.create(ol.control.Control && ol.control.Control.prototype)
  CenterControl.prototype.constructor = CenterControl

  CenterControl.prototype.handleCenter = function handleCenter() {

    initView()
  }

  return CenterControl
}(ol.control.Control))

// make map
let map = new ol.Map({
  target: 'distributionMap',
  view: view,
  controls: ol.control.defaults({
    attribution: false,
    zoom: true
  }).extend([
    new ol.control.ScaleLine(),
    new CenterControl()
  ]),
  interactions: ol.interaction.defaults({
    mouseWheelZoom: true,
    dragPan: true,
    doubleClickZoom: false,
  })
})



function initView() {
  view = new ol.View({
    projection: 'EPSG:4326',
    center: new ol.proj.transform([165.875, -21.145],
      'EPSG:4326',
      'EPSG:4326'),
    zoom: 6
  })
  map.setView(view)

}

map.addLayer(layerBackground)
map.addLayer(layerShape)


function buildTaxonList() {
  var taxons = {}

  $.ajax({
    type: 'GET',
    url: restUrls.taxonTreeList,
    success: function (result) {
      // d3Gauges.initGauges(result)
      var tree = new TreeView(result, 'taxon_treeview', 'list-group-item')
      preloader.hidePreloader()
    }
  })
}

function updateData(taxon) {
  $.ajax({
    type: 'GET',
    url: restUrls.taxonList + taxon.id + '/',
    success: function (response) {
      $('#taxon_treeview').trigger('taxonSelected', response)
      updateGeneralInformations(response)
      updateLayerTaxon(response)
      preloader.hidePreloader()
    }
  })
}

function updateLayerTaxon(data) {
  /* function update the layer
    clear the source
    update the new source
    center map on the new source
  */
  source.clear()
  // sourceTaxon.clear()
  if (data.geo_pts_pn !== null) {
    source.addFeature(new ol.format.GeoJSON().readFeature(data.geo_pts_pn))
    // sourceTaxon.addFeature(new ol.format.GeoJSON().readFeature(data.geo_pts_pn))
    const feature = source.getFeatures()[0]
    const polygon = feature.getGeometry()
    view.fit(polygon, {
      padding: [10, 10, 10, 10]
    })

  } else {
    initView()
  }
}

function updateGeneralInformations(data) {
  let rank = ''
  let fleshyFruit = ''
  $('#tax_full_name').html(data.full_name)
  switch (data.id_rang) {
    case 10:
      rank = 'famille';
      break;
    case 14:
      rank = 'genre';
      break;
    case 21:
      rank = 'espèce';
      break;
    case 22:
      rank = 'variété';
      break;
    case 23:
      rank = 'sous-espèces';
      break;
  }
  $('#tax_rank').text('Rang: ' + rank)
  $('#tax_nb_occ').text("Nombre d'occurrences: " + data.occ_count)
  $('#tax_endemia_link_value').attr('href', 'http://endemia.nc/flore/fiche' + data.id_endemia)
  $('#tax_endemia_link_value').text('Fiche Endemia')
  switch (data.id_rang) {
    case 10:
      $('#tax_florical_link_value').attr('href', '')
      $('#tax_florical_link_value').text('')
      break;
    case 14:
      $('#tax_florical_link_value').attr('href', '')
      $('#tax_florical_link_value').text('')
      break;
    default:
      $('#tax_florical_link_value').attr('href', 'http://publish.plantnet-project.org/project/florical_fr/collection/florical/taxons/details/' + data.id_florical)
      $('#tax_florical_link_value').text('Fiche Florical')
  }
  if (data.leaf_type != null) {
    $('#tax_leaf_type').text('Type de feuille: ' + data.leaf_type)
  }
  if (data.sexual_system != null) {
    $('#tax_sexual_system').text('Reproduction: ' + data.sexual_system)
  }
  switch (data.fleshy_fruit) {
    case 'Faux':
      fleshyFruit = 'Non';
      break;
    case 'Vrai':
      fleshyFruit = 'Oui';
      break;
    case 'Faux, Vrai':
      fleshyFruit = 'Oui/Non';
      break;
  }
  if (data.fleshy_fruit != null) {
    $('#tax_sexual_system').text('Fruit charnu: ' + data.sexual_system)
  }
  if (data.dbh_median != null) {
    $('#tax_dbh_median').text('dbh median: ' + data.dbh_median)
  }


}

function makeNode(node) {
  node.text = node.rank_name
  node.icon = 'fas'
  node.state = {
    expanded: false
  }
};

function makeLeaf(node) {
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
      selectedBackColor: color.colorSecondary13,
      onNodeSelected: function (event, node) {
        preloader.showPreloader()
        updateData(node)
      }
    })
    $('#taxon_treeview').selectpicker('val', 1)
    preloader.hidePreloader()
  }, {
    make_node: makeNode,
    make_leaf: makeLeaf
  })

  $.ajax({
    type: 'GET',
    url: restUrls.taxonGeneralInfos,
    success: function (result) {
      d3Gauges.initGauges(result)

      d3GraphBarh.init()
      d3GraphOneBarv.init()
      d3GraphBarv.init()
      d3GraphDonut.init()
    }
  })

})