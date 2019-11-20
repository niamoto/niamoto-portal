import * as restUrls from '../restUrls'
// import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
// var d3_gauges = require('./d3_gauges');

var shapeList = restUrls.shapeList

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
      shapes = result.reduce(function (map, obj) {
        map[obj.id] = obj
        return map
      }, {})

      var typeShape = ''
      var select = document.getElementById('shape_select')
      var optgrp = document.createElement('optgroup')
      for (var x in shapes) {
        var option = document.createElement('option')
        if (typeShape !== shapes[x].typeShape) {
          optgrp = document.createElement('optgroup')
          typeShape = shapes[x].typeShape
          optgrp.label = typeShape
          select.add(optgrp)
        }
        option.text = shapes[x].label
        option.value = shapes[x].id
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
      preloader.hidePreloader()
    }
  })
}

document.addEventListener('DOMContentLoaded', function () {
  $('#preloader').on('elementLoaded', function (event, data) {
    preloader.hidePreloader()
  })

  buildShapeList()
})
