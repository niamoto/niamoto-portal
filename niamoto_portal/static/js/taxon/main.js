import * as restUrls from '../restUrls'
import * as d3Gauges from './d3Gauges'
import * as d3PhenologyHisto from './d3PhenologyHisto.js'
import * as d3GraphBarh from './d3GraphBarhs'
import * as d3GraphOneBarv from './d3GraphOneBarv'
import * as d3GraphBarv from './d3GraphBarvs'
import * as d3GraphDonut from './d3GraphDonuts'
import * as preloader from '../preloader'
import {
  getTaxaTree
} from './taxonomy'
import color from '../../css/source/partials/_color_js.scss'

// var TreeView = require('treeview')
// var d3_gauges = require('./d3Gauges')

const shapeList = restUrls.shapeList
const shapeLocation = restUrls.shapeLocation

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

// make layer Point Taxon
const featuresTaxon = new ol.Collection()
const sourceTaxon = new ol.source.Vector({
  features: featuresTaxon
})
const layerPointTaxon = new ol.layer.Vector({
  source: sourceTaxon,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: color.forest,
      opacity: .1
    })
  })
})

// view for map center new caledonia
const view = new ol.View({
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
    this.getMap().setView(new ol.View({
      projection: 'EPSG:4326',
      center: new ol.proj.transform([165.875, -21.145],
        'EPSG:4326',
        'EPSG:4326'),
      zoom: 6
    }))
  }

  return CenterControl
}(ol.control.Control))

// make map
const map = new ol.Map({
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
map.addLayer(layerBackground)
map.addLayer(layerShape)
map.addLayer(layerPointTaxon)

var taxonTreeList = restUrls.taxonTreeList

function buildTaxonList() {
  var taxons = {}

  $.ajax({
    type: 'GET',
    url: taxonTreeList,
    success: function (result) {
      d3Gauges.initGauges(result)
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
  sourceTaxon.clear()
  source.addFeature(new ol.format.GeoJSON().readFeature(data.geo_pts_pn))
  if (data.geo_pts_pn !== null) {
    sourceTaxon.addFeature(new ol.format.GeoJSON().readFeature(data.geo_pts_pn))
  }
  const feature = source.getFeatures()[0]
  const polygon = feature.getGeometry()
  view.fit(polygon, {
    padding: [10, 10, 10, 10]
  })


}

function updateGeneralInformations(data) {
  $('#tax_endemia_link_value').attr('href', 'http://endemia.nc/flore/fiche' + data.id_endemia)
  $('#tax_endemia_link_value').text('Fiche Endemia')
  $('#tax_rank').text('Rang :' + data.rank_name)
  $('#tax_full_name').html(data.full_name)
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
  d3Gauges.initGauges(null)

  d3PhenologyHisto.initPhenologyHisto()
  d3GraphBarh.init()
  d3GraphOneBarv.init()
  d3GraphBarv.init()
  d3GraphDonut.init()
  // d3_families_donut.initFamiliesDonut("# families_donut ");
  // // d3_species_donut.initSpeciesDonut("#species_donut");
  // d3_species_barh.initSpeciesDonut("#species_donut");
  // d3_diameters.initDiametersHistogram();
  // d3_strates.initBarh();
  // d3_stems.initStems();
  // d3_type_plant.initTypePlantDonut("#type_plant_donut");
})