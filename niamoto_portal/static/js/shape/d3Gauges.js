import * as d3Gauge from '../D3gauge'

export function init(data) {
  var fragmentationMax = 900

  // Fragmentation
  let fragmentation = new d3Gauge.Gauge({
    width: $('#fragmentation').width(),
    height: $('#fragmentation').height(),
    displayUnit: 'Taille effective de maillage (km' + '2'.sup()  + ')',
    container: '#fragmentation',
    minValue: 0,
    maxValue: 1000
  })
  
  fragmentation.render()

  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data)
  })

  function updateData(data) {
    fragmentation.update(data.properties.fragment_meff_cbc)
  }
};