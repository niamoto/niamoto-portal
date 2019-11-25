import * as restUrls from '../restUrls'
// import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
// var d3_gauges = require('./d3_gauges');

const shapeList = restUrls.shapeList

// make layer background
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

function buildShapeList () {
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
        if (typeShape !== shapes[idx].typeShape) {
          // construct group
          optgrp = document.createElement('optgroup')
          typeShape = shapes[idx].typeShape
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

function updateData (shape) {
  $.ajax({
    type: 'GET',
    url: shapeList + shape.id + '/',
    success: function (response) {
      $('#shape_select').trigger('shapeSelected', response)
      updateLayerShape(response)
      preloader.hidePreloader()
    }
  })
}

function updateLayerShape (data) {
  /* function update the layer
    clear the source
    update the new source
    center map on the new source
  */
  source.clear()
  source.addFeature(new ol.format.GeoJSON().readFeature(data))
  const feature = source.getFeatures()[0]
  const polygon = feature.getGeometry()
  view.fit(polygon, {
    padding: [5, 5, 5, 5]
  })
}

document.addEventListener('DOMContentLoaded', function () {
  $('#preloader').on('elementLoaded', function (event, data) {
    preloader.hidePreloader()
  })
  buildShapeList()
})
