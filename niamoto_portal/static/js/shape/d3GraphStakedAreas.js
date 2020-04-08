import * as d3GraphstakedArea from '../d3GraphStakedArea'

export function initGraphStakedAreas(data) {
  function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  function initGraphStakedArea(id, xLabel, yLabel, value, yDomain, maxValue = '', marginLeft = 0.15, legend) {
    return new d3GraphstakedArea.GraphStakedArea({
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
      legend: value,
      color: ['#ceec72', '#78ac01', '#2b8313']
    })
  }

  // Holdridge forest
  const forestTypeElevation = initGraphStakedArea(
    '#forest_type_elevation',
    'Altitude(m)',
    '',
    ['Forêt secondaire', 'Forêt mature', 'Forêt coeur'],
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

    const forestTypeElevationMature = dataFilter(data, 'ratio_forest_mature_elevation')
    const forestTypeElevationCore = dataFilter(data, 'ratio_forest_core_elevation')
    const forestTypeElevationSecondary = dataFilter(data, 'ratio_forest_second_elevation')

    const forestTypeElevationData = forestTypeElevationMature.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        data1: forestTypeElevationSecondary[i].class_value * 100,
        data2: (d.class_value) * 100,
        data3: forestTypeElevationCore[i].class_value * 100
      }
      return result
    })

    forestTypeElevation.update(forestTypeElevationData)
  };
};