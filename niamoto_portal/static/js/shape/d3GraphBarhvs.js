import * as d3GraphBarh from '../d3GraphBarv'

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
      color: ['#548235', '#f5e9d8']
    })
  }

  // Holdridge forest
  const holdridgeForest = initGraphBarh(
    '#holdridge_forest',
    '',
    '',
    ['forêt', 'hors-forêt'],
    [0, 100],
    100
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
  };
};