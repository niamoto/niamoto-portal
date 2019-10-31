import * as restUrls from '../restUrls'
// import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
// var d3_gauges = require('./d3_gauges');

var taxonList = restUrls.taxonList

function buildTaxonList () {
  var taxons = {}

  $.ajax({
    type: 'GET',
    data: {
      ordering: 'name'
    },
    url: taxonList,
    success: function (result) {
      taxons = result.reduce(function (map, obj) {
        map[obj.id] = obj
        return map
      }, {})
      var select = document.getElementById('taxon_select')
      result.map(function (x) {
        var option = document.createElement('option')
        option.text = x.label
        option.value = x.id
        select.add(option)
      })
      $('#taxon_select').selectpicker({
        noneSelectedText: 'Selectionnez une parcelle'
      })
      $('#taxon_select').selectpicker('val', null)
      $('#taxon_select').change(function () {
        preloader.showPreloader()
        updateData(taxons[this.value])
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

document.addEventListener('DOMContentLoaded', function () {
  $('#preloader').on('elementLoaded', function (event, data) {
    preloader.hidePreloader()
  })

  buildTaxonList()
  // d3_map.initMap();
  // d3_families_donut.initFamiliesDonut("#families_donut");
  // // d3_species_donut.initSpeciesDonut("#species_donut");
  // d3_species_barh.initSpeciesDonut("#species_donut");
  // d3_diameters.initDiametersHistogram();
  // d3_strates.initBarh();
  // d3_stems.initStems();
  // d3_type_plant.initTypePlantDonut("#type_plant_donut");
})
