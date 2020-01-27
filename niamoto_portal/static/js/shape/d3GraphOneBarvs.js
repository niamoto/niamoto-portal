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
    color: color
  })

  // forets Um
  const coverForestsUm = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_um').width(),
    height: $('#cover_forest_um').height(),
    container: '#cover_forest_um',
    value: value,
    color: color
  })

  // forets Num
  const coverForestsNum = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_num').width(),
    height: $('#cover_forest_num').height(),
    container: '#cover_forest_num',
    value: value,
    color: color
  })

  // forets type
  const coverForestsType = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_type').width(),
    height: $('#cover_forest_type').height(),
    container: '#cover_forest_type',
    value: ['forêt coeur', 'forêt mature', 'forêt secondaire'],
    color: ['#2b8313', '#78ac01', '#ceec72']
  })

  // forets type
  const coverForestsAdmin = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_admin').width(),
    height: $('#cover_forest_admin').height(),
    container: '#cover_forest_admin',
    value: ['concessions', 'réserves', 'forêts'],
    color: ['#990000', '#0b6303', '#2b8313'],
    yDomain: [70, 100],
    yTickValue: ['70', '80', '90', '100']
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

    let coverForestTypeData = dataFilter(data, 'cover_foresttype')
    coverForestTypeData = coverForestTypeData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForestsType.update(coverForestTypeData)

    let coverForestAdminData = dataFilter(data, 'cover_forestadmin')
    coverForestAdminData = coverForestAdminData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForestsAdmin.update(coverForestAdminData)
  };
};