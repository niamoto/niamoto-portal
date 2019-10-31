import * as restUrls from '../restUrls'
// import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
// var d3_gauges = require('./d3_gauges');

var shapeList = restUrls.shape

function buildShapeList () {
  var shapes = {}

  $.ajax({
    type: 'GET',
    data: {
      ordering: 'name'
    },
    url: shapeList,
    success: function (result) {
      shapes = result.reduce(function (map, obj) {
        map[obj.id] = obj
        return map
      }, {})
      var select = document.getElementById('shape_select')
      result.map(function (x) {
        var option = document.createElement('option')
        option.text = x.label
        option.value = x.id
        select.add(option)
      })
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
  // d3_map.initMap();
  // d3_families_donut.initFamiliesDonut("#families_donut");
  // // d3_species_donut.initSpeciesDonut("#species_donut");
  // d3_species_barh.initSpeciesDonut("#species_donut");
  // d3_diameters.initDiametersHistogram();
  // d3_strates.initBarh();
  // d3_stems.initStems();
  // d3_type_plant.initTypePlantDonut("#type_plant_donut");
})
