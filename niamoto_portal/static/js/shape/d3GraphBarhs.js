import * as d3GraphBarh from '../d3GraphBarh'
import * as d3GraphPyramidh from '../d3GraphPyramidh'
import color from '../../css/source/nocompile/color_js.scss'

export function initGraphBarhs(data) {
  function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  function initGraphBarh(id, xLabel, yLabel, value, yDomain, maxValue = '', marginLeft = 0.15, legend) {
    return new d3GraphBarh.GraphBarh({
      width: $(id).width(),
      height: $(id).height(),
      container: id,
      title: '',
      xLabel: xLabel,
      yLabel: yLabel,
      value: value,
      yDomain: yDomain,
      maxValue: maxValue,
      marginLeft: marginLeft,
      color: [color.forest, color.forestOut]
    })
  }

  function initGraphPyramidh(id, xLabel, yLabel, value, yDomain, maxValue = 100, marginLeft = 0.15, legend) {
    return new d3GraphPyramidh.GraphPyramidh({
      width: $(id).width(),
      height: $(id).height(),
      container: id,
      title: '',
      xLabel: xLabel,
      yLabel: yLabel,
      value: value,
      yDomain: yDomain,
      maxValue: maxValue,
      marginLeft: marginLeft,
      color: [color.forestUM, color.forestNUM]
    })
  }

  // forets
  const forests = initGraphBarh(
    '#forets',
    'Superfice (hectare)',
    'Alitude (m)',
    ['Forêt', 'Hors-forêt'],
    ['1700', '1500', '1300', '1100', '900', '700', '500', '300', '100']
  )

  //   dbhMaxGauge.render()

  // forets ultramafique
  const forestsUm = initGraphBarh(
    '#forets_um',
    'Superfice (hectare)',
    'Alitude (m)',
    ['Forêt', 'Hors-forêt'],
    ['1700', '1500', '1300', '1100', '900', '700', '500', '300', '100']
  )

  // cover forest NUM UM
  const ratioForest = initGraphPyramidh(
    '#ratio_forests',
    'Répartition (%)',
    'Alitude (m)',
    ['Forêt (UM)', 'Forêt (NUM)'],
    ['1700', '1500', '1300', '1100', '900', '700', '500', '300', '100'],
    100,
    .22
  )

  // Holdridge forest
  // const holdridgeForest = initGraphBarh(
  //   '#holdridge_forest',
  //   'Répartition(%)',
  //   '',
  //   ['Forêt', 'Hors-forêt'],
  //   '',
  //   100,
  //   0.24
  // )

  //   distributionOccGauge.render()

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

    const land = dataFilter(data, 'land_elevation')
    const landUm = dataFilter(data, 'land_um_elevation')
    const forest = dataFilter(data, 'forest_elevation')
    const forestUm = dataFilter(data, 'forest_um_elevation')
    // const holdridgeforest = dataFilter(data, 'holdridge_forest')
    // const holdridgeOutforest = dataFilter(data, 'holdridge_outforest')
    const ratioForestNUM = dataFilter(data, 'ratio_forest_num_elevation')
    const ratioForestUM = dataFilter(data, 'ratio_forest_um_elevation')
    const forestData = land.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        data1: forest[i].class_value.toFixed(0),
        data2: (d.class_value - forest[i].class_value).toFixed(0)
      }
      return result
    })
    const forestUmData = landUm.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        data1: forestUm[i].class_value.toFixed(0),
        data2: (d.class_value - forestUm[i].class_value).toFixed(0)
      }
      return result
    })
    // const holdridgeForestData = holdridgeOutforest.map(function (d, i) {
    //   var result = {
    //     class_name: d.class_name,
    //     data1: holdridgeforest[i].class_value * 100,
    //     data2: (d.class_value) * 100
    //   }
    //   return result
    // })

    const ratioForestData = ratioForestNUM.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        data1: ratioForestUM[i].class_value * 100,
        data2: ratioForestNUM[i].class_value * 100
      }
      return result
    })
    forests.update(forestData.reverse())
    forestsUm.update(forestUmData.reverse())
    ratioForest.update(ratioForestData.reverse())
    // holdridgeForest.update(holdridgeForestData.reverse())
  };
};