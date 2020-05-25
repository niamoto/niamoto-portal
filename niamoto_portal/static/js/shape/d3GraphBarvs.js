import * as d3GraphBarv from '../d3GraphBarv'
import * as d3GraphBarvMulti from '../d3GraphBarvMulti'
import color from '../../css/source/nocompile/color_js.scss'

export function initGraphBarvs(data) {
  function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  function initGraphBarv(id, xLabel, yLabel, value, yDomain, maxValue = '', marginLeft = 0.15, legend) {
    return new d3GraphBarv.GraphBarv({
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

  function initGraphBarvMulti(id, xLabel, yLabel, value, yDomain, maxValue = '', marginLeft = 0.15, legend) {
    return new d3GraphBarvMulti.GraphBarvMulti({
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

  // Holdridge forest
  const holdridgeForest = initGraphBarv(
    '#holdridge_forest',
    '',
    '',
    ['Forêt', 'Hors-forêt'],
    [0, 100],
    100,
    .16
  )

  // land_use
  const landUse = initGraphBarvMulti(
    '#land_use',
    '',
    'Surface (ha)',
    '',
    '',
    100,
    .20
  )

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

    const holdridgeforest = dataFilter(data, 'holdridge_forest')
    const holdridgeforestOut = dataFilter(data, 'holdridge_forest_out')

    const holdridgeForestData = holdridgeforestOut.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        data1: holdridgeforest[i].class_value * 100,
        data2: (d.class_value) * 100
      }
      return result
    })

    holdridgeForest.update(holdridgeForestData.reverse())


    const landuse = dataFilter(data, 'land_use')

    const landUseData = landuse.map(function (d, i) {
      const str = d.class_name
      var result = {
        class_name: str.substring(3, str.length),
        data1: landuse[i].class_value,
      }
      return result
    })
    landUse.update(landUseData)

  };


};