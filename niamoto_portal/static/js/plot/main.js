import * as restUrls from '../restUrls'
import * as d3Gauges from './d3Gauges'
import * as preloader from '../preloader'
import * as d3graphBarvs from './d3GraphBarvs'
import * as d3GraphDonuts from './d3GraphDonuts'
import * as d3GraphBarhs from './d3GraphBarhs'
// var d3_gauges = require('./d3_gauges');

var plotList = restUrls.plotList

var highlightStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 5,
    fill: new ol.style.Fill({
      color: 'rgba(255,90,90,0.7)'
    }),
    stroke: new ol.style.Stroke({
      color: 'rgba(255,50,50,1)',
      width: 2
    })
  })
})

const wmsUrlNC = 'https://carto.gouv.nc/arcgis/services/fond_imagerie/' +
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
  target: 'mapCaledonie',
  view: view,
  controls: ol.control.defaults().extend([
    new CenterControl()
  ])
  // interactions: interaction
})

map.addLayer(layerBackground)
map.addLayer(layerShape)

var selected = null

map.on('click', function (e) {
  if (selected !== null) {
    selected.setStyle(undefined)
    selected = null
  }

  map.forEachFeatureAtPixel(e.pixel, function (f) {
    selected = f
    f.setStyle(highlightStyle)
    return true
  })

  if (selected) {
    $('#plot_select').selectpicker('val', selected.id_)
  }
})

map.on('pointermove', function (event) {
  if (map.hasFeatureAtPixel(event.pixel)) {
    map.getViewport().style.cursor = 'pointer';
  } else {
    map.getViewport().style.cursor = 'inherit';
  }
})

function buildPlotList() {
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
        noneSelectedText: 'Selectionnez une parcelle de 1 ha'
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

function updateData(plot) {
  $.ajax({
    type: 'GET',
    url: plotList + plot.id + '/',
    success: function (response) {
      updateGeneralInformations(response)
      $('#plot_select').trigger('plotSelected', response)

      preloader.hidePreloader()
    }
  })
}

function updateGeneralInformations(data) {
  let holdridge = ''
  let substrat = ''
  $('#plot_commune').text('Commune: ' + data.properties.town)
  if (data.properties.elevation) {
    $('#plot_elevation').text('Altitude: ' + data.properties.elevation + ' m')
  }
  $('#plot_long').text('Longitude: ' + data.properties.longitude)
  $('#plot_lat').text('Latitude: ' + data.properties.latitude)
  $('#plot_rainfall').text('Précipitation annuelle moyenne: ' + data.properties.rainfall + ' mm/an')
  switch (data.properties.holdridge) {
    case 1:
      holdridge = 'sec';
      break;
    case 2:
      holdridge = 'humide';
      break;
    case 3:
      holdridge = 'très humide';
      break;
  }
  $('#plot_holdridge').text('Milieu : ' + holdridge)

  switch (data.properties.um_substrat) {
    case true:
      substrat = 'Substrat ultramafique'
      break;
    case false:
      substrat = 'Substrat non ultramafique'
      break;
  }
  $('#plot_um_substrat').text(substrat)
  $('#plot_nb_families').text('Nombre de familles : ' + data.properties.count_families)
  $('#plot_nb_species').text("Nombre d'espèces : " + data.properties.count_species)
  $('#plot_nb_species').text("Taux d'identification : " + data.properties.species_level * 100 + '%')
}

document.addEventListener('DOMContentLoaded', function () {
  $('#preloader').on('elementLoaded', function (event, data) {
    preloader.hidePreloader()
  })

  $(document).ready(function () {
    $('[data-toggle="popover"]').popover();
  });

  buildPlotList()
  d3graphBarvs.init()
  d3GraphDonuts.init()
  d3GraphBarhs.init()
})