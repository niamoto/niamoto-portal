import * as d3GraphBarv from '../d3GraphOneBarv'

export function initGraphBarvs(data) {
  function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  function initGraphBarv(id, xLabel, yLabel, value, maxValue = '', marginLeft = 0.15, color = ['#548235', '#f5e9d8']) {
    return new d3GraphBarv.GraphOneBarV({
      width: $(id).width(),
      height: $(id).height(),
      container: id,
      title: '',
      xLabel: xLabel,
      yLabel: yLabel,
      value: value,
      maxValue: maxValue,
      marginLeft: marginLeft,
      color: color
    })
  }

  // forets
  const coverForests = initGraphBarv(
    '#cover_forest',
    '',
    '',
    ['forêt', 'hors-forêt']
  )

  // forets Um
  const coverForestsUm = initGraphBarv(
    '#cover_forest_um',
    '',
    '',
    ['forêt', 'hors-forêt']
  )

  // forets Num
  const coverForestsNum = initGraphBarv(
    '#cover_forest_num',
    '',
    '',
    ['forêt', 'hors-forêt']
  )

  // forets type
  const coverForestsType = initGraphBarv(
    '#cover_forest_type',
    '',
    '',
    ['forêt coeur', 'forêt mature', 'forêt secondaire'],
    '100',
    '.15',
    ['#2b8313', '#78ac01', '#ceec72']
  )

  // forets type
  const coverForestsAdmin = initGraphBarv(
    '#cover_forest_admin',
    '',
    '',
    ['concessions', 'réserves', 'forêts'],
    '100',
    '.15',
    ['#990000', '#0b6303', '#2b8313']
  )

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