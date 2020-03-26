import * as d3GraphBarv from '../d3GraphOneBarv'

export function initGraphBarvs(data) {
  function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  const value = ['forêt', 'hors-forêt']
  const color = ['#548235', '#f5e9d8']

  const coverForests = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest').width(),
    height: $('#cover_forest').height(),
    container: '#cover_forest',
    value: value,
    legend: value,
    color: color
  })

  // forets Um
  const coverForestsUm = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_um').width(),
    height: $('#cover_forest_um').height(),
    container: '#cover_forest_um',
    value: value,
    legend: value,
    color: color
  })

  // forets Num
  const coverForestsNum = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_num').width(),
    height: $('#cover_forest_num').height(),
    container: '#cover_forest_num',
    value: value,
    legend: value,
    color: color
  })

  // forets type
  const coverForestsAdmin = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_admin').width(),
    height: $('#cover_forest_admin').height(),
    container: '#cover_forest_admin',
    value: ['concessions', 'réserves', 'forêts'],
    legend: ['concessions', 'réserves', 'forêts'],
    color: ['#990000', '#0b6303', '#2b8313'],
    yDomain: [70, 100],
    yTickValue: ['70', '80', '90', '100']
  })

  // forets type
  const substrat = new d3GraphBarv.GraphOneBarV({
    width: $('#substrat').width(),
    height: $('#substrat').height(),
    container: '#substrat',
    value: ['NUM', 'UM'],
    legend: ['non Utramafique (NUM)', 'Ultramafique (UM)'],
    color: ['#e1a553', '#a97742'],
    typeLegend: 2
  })

  // Update Data for trigger
  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data.properties.frequencies)
  })

  function updateData(data) {
    function dataFilter(data, field, precision = 0) {
      const result = data
        .filter(d => d.class_object === field)
      // .map(d => {
      //   class_name: d.class_name,
      //   class_value: parseFloat(d.class_value.toFixed(precision))
      // })
      return result
    }

    function classFilter(data, field) {
      const result = data
        .filter(d => d.class_object === field)
        .map(d => d.class_name)
      return result
    }

    let coverForestData = dataFilter(data, 'cover_forest')
    coverForestData = coverForestData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForests.update(coverForestData)

    let coverForestUmData = dataFilter(data, 'cover_forestum')
    coverForestUmData = coverForestUmData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForestsUm.update(coverForestUmData)

    let coverForestNumData = dataFilter(data, 'cover_forestnum')
    coverForestNumData = coverForestNumData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForestsNum.update(coverForestNumData)

    let coverForestAdminData = dataFilter(data, 'cover_forestadmin')
    coverForestAdminData = coverForestAdminData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForestsAdmin.update(coverForestAdminData)

    let substratData = dataFilter(data, 'substrat')
    substratData = substratData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    substrat.update(substratData)
  };
};