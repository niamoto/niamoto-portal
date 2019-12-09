import * as restUrls from '../restUrls'
import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
// var d3_gauges = require('./d3_gauges');

var plotList = restUrls.plotList

const wmsUrlNC = 'http://carto.gouv.nc/arcgis/services/fond_imagerie/' +
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
const view = new ol.View({
  projection: 'EPSG:4326',
  center: new ol.proj.transform([165.875, -21.145],
    'EPSG:4326',
    'EPSG:4326'),
  zoom: 6
})

// make map
const map = new ol.Map({
  target: 'mapCaledonie',
  view: view
})
map.addLayer(layerBackground)
map.addLayer(layerShape)

function buildPlotList () {
  var plots = {}

  $.ajax({
    type: 'GET',
    data: {
      ordering: 'name'
    },
    url: plotList,
    success: function (result) {
      d3Gauges.initGauges(result.features)
      plots = result.features.reduce(function (map, obj) {
        map[obj.id] = obj
        return map
      }, {})
      var select = document.getElementById('plot_select')
      result.features.map(function (x) {
        var option = document.createElement('option')
        option.text = x.properties.label
        option.value = x.id
        select.add(option)
        source.addFeature(new ol.format.GeoJSON().readFeature(x))
      })
      $('#plot_select').selectpicker({
        noneSelectedText: 'Selectionnez une parcelle'
      })
      $('#plot_select').selectpicker('val', null)
      $('#plot_select').change(function () {
        preloader.showPreloader()
        updateData(plots[this.value])
      })
      preloader.hidePreloader()
    }
  })
}

function updateData (plot) {
  $.ajax({
    type: 'GET',
    url: plotList + plot.id + '/',
    success: function (response) {
      $('#plot_select').trigger('plotSelected', response)
      preloader.hidePreloader()
    }
  })
}

document.addEventListener('DOMContentLoaded', function () {
  $('#preloader').on('elementLoaded', function (event, data) {
    preloader.hidePreloader()
  })

  buildPlotList()
  // d3_map.initMap();
  // d3_families_donut.initFamiliesDonut("#families_donut");
  // // d3_species_donut.initSpeciesDonut("#species_donut");
  // d3_species_barh.initSpeciesDonut("#species_donut");
  // d3_diameters.initDiametersHistogram();
  // d3_strates.initBarh();
  // d3_stems.initStems();
  // d3_type_plant.initTypePlantDonut("#type_plant_donut");
})
