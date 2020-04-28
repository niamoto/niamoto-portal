import * as restUrls from '../restUrls'
// import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
import * as d3GraphBarh from './d3GraphBarhs'
import * as d3radarChart from './radarCharts'
import * as d3GraphOneBarv from './d3GraphOneBarvs'
import * as d3GraphBarv from './d3GraphBarvs'
import * as d3GraphDonut from './d3GraphDonuts'
import * as d3GraphTripleDonut from './d3TripleDonuts'
import * as d3GraphStakedArea from './d3GraphStakedAreas'
import * as d3Gauges from './d3Gauges'
import color from '../../css/source/nocompile/color_js.scss'
// import * as d3 from 'd3'
// var d3_gauges = require('./d3_gauges');

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

// make layer Shape Forest
const featuresForest = new ol.Collection()
const sourceForest = new ol.source.Vector({
  features: featuresForest
})
const layerShapeForest = new ol.layer.Vector({
  source: sourceForest,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: color.forest,
      opacity: 0.7
    }),
    stroke: new ol.style.Stroke({
      color: color.forest,
      width: 1
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

// make map
const map = new ol.Map({
  target: 'mapCaledonie',
  view: view,
  controls: ol.control.defaults({
    attribution: false,
    zoom: false
  }).extend([
    new ol.control.ScaleLine()
  ]),
})
map.addLayer(layerBackground)
map.addLayer(layerShape)
map.addLayer(layerShapeForest)

// make layer background
const wmsUrlProvince = 'https://carto.gouv.nc/public/services/aires_coutumieres/' +
  'MapServer/WMSServer'
const layerBackgroundProvince = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: wmsUrlProvince,
    params: {
      LAYERS: '0',
      TILED: true,
      FORMAT: 'image/png'
    },
    serverType: 'mapserver'
  })
})

// make layer Shape
const featuresProvince = new ol.Collection()
const sourceProvince = new ol.source.Vector({
  features: featuresProvince
})
const layerShapeProvince = new ol.layer.Vector({
  source: sourceProvince,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: color.colorSecondary13,
      opacity: 0.7
    }),
    stroke: new ol.style.Stroke({
      color: color.colorSecondary13,
      width: 1
    })
  })
})

// view for map center new caledonia
const viewProvince = new ol.View({
  projection: 'EPSG:4326',
  center: new ol.proj.transform([164.859, -20.583],
    'EPSG:4326',
    'EPSG:4326'),
  zoom: 7.4,
  minZoom: 7.4,
  maxZoom: 7.4
})

// make map
const mapProvince = new ol.Map({
  target: 'mapProvince',
  view: viewProvince,
  controls: ol.control.defaults({
    attribution: false,
    zoom: false
  }).extend([
    new ol.control.ScaleLine()
  ]),
})
mapProvince.addLayer(layerBackgroundProvince)
mapProvince.addLayer(layerShapeProvince)

function buildShapeList() {
  /* TODO
    sort label by typeshape not sort
  */
  var shapes = {}

  $.ajax({
    type: 'GET',
    data: {
      ordering: ('label')
    },
    url: shapeList,
    success: function (result) {
      // reorganize the flux
      shapes = result.reduce(function (map, obj) {
        map[obj.id] = obj
        return map
      }, {})

      // construct the list by type shape
      let typeShape = ''
      const select = document.getElementById('shape_select')
      let optgrp = document.createElement('optgroup')
      for (const idx in shapes) {
        var option = document.createElement('option')
        // test change group
        if (typeShape !== shapes[idx].type_shape) {
          // construct group
          optgrp = document.createElement('optgroup')
          typeShape = shapes[idx].type_shape
          optgrp.label = typeShape
          select.add(optgrp)
        }
        // append an option to the group
        option.text = shapes[idx].label
        option.value = shapes[idx].id
        optgrp.append(option)
      }

      $('#shape_select').selectpicker({
        noneSelectedText: 'Selectionnez une emprise'
      })
      $('#shape_select').selectpicker('val', null)
      $('#shape_select').change(function () {
        preloader.showPreloader()
        updateData(shapes[this.value])
      })
      preloader.hidePreloader()
    }
  })
}

function updateData(shape) {
  $.ajax({
    type: 'GET',
    url: shapeList + shape.id + '/',
    success: function (response) {
      $('#shape_select').trigger('shapeSelected', response)
      updateGeneralInformations(response)
      updateLayerShape(response)
      preloader.hidePreloader()
    }
  })
}

function InitLayerShapeProvince() {
  /* function update the layer
    clear the source
    update the new source
    center map on the new source
  */
  $.ajax({
    type: 'GET',
    url: shapeList + '1/',
    success: function (response) {
      sourceProvince.clear()
      sourceProvince.addFeature(new ol.format.GeoJSON().readFeature(response))
      const feature = sourceProvince.getFeatures()[0]
      const polygon = feature.getGeometry()
      viewProvince.fit(polygon, {
        padding: [5, 5, 5, 5]
      })
    }
  })
}

function updateGeneralInformations(data) {
  $('#commune').text(data.properties.label)
  $('#landArea').text('Surface ' + data.properties.land_area + ' ha')
  $('#forestArea').text('Surface de forêt ' + data.properties.forest_area + ' ha')
  $('#nb_families').text(data.properties.nb_families + ' famille' + plurial(data.properties.nb_families))
  $('#nb_species').text(data.properties.nb_species + ' espèce' + plurial(data.properties.nb_species))
  $('#nb_occurence').text(data.properties.nb_occurence + ' occurence' + plurial(data.properties.nb_occurence))
}

function updateLayerShape(data) {
  /* function update the layer
    clear the source
    update the new source
    center map on the new source
  */
  source.clear()
  sourceForest.clear()
  source.addFeature(new ol.format.GeoJSON().readFeature(data))
  if (data.properties.um_geom !== null) {
    sourceForest.addFeature(new ol.format.GeoJSON().readFeature(data.properties.um_geom))
  }
  const feature = source.getFeatures()[0]
  const polygon = feature.getGeometry()
  view.fit(polygon, {
    padding: [5, 5, 5, 5]
  })
  sourceProvince.clear()
  sourceProvince.addFeature(new ol.format.GeoJSON().readFeature(data))
}

function plurial(data) {
  if (data > 1) {
    return 's'
  } else {
    return ''
  }
}

document.addEventListener('DOMContentLoaded', function () {
  $('#preloader').on('elementLoaded', function (event, data) {
    preloader.hidePreloader()
  })
  buildShapeList()
  // InitLayerShapeProvince()
  d3GraphBarh.initGraphBarhs()
  d3radarChart.initRadarChart()
  d3GraphOneBarv.initGraphBarvs()
  d3GraphBarv.initGraphBarvs()
  d3GraphDonut.initGraphDonuts()
  d3GraphTripleDonut.initGraphDonuts()
  d3GraphStakedArea.initGraphStakedAreas()
  d3Gauges.initGauges(null)
})