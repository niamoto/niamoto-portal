import * as restUrls from '../restUrls'
import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
// var d3_gauges = require('./d3_gauges');

var plotList = restUrls.plotList

function buildPlotList () {
  var plots = {}

  $.ajax({
    type: 'GET',
    data: {
      ordering: 'name'
    },
    url: plotList,
    success: function (result) {
      d3Gauges.initGauges(result)
      plots = result.reduce(function (map, obj) {
        map[obj.id] = obj
        return map
      }, {})
      var select = document.getElementById('plot_select')
      result.map(function (x) {
        var option = document.createElement('option')
        option.text = x.label
        option.value = x.id
        select.add(option)
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
