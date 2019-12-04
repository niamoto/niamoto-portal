import * as d3GraphBarh from '../d3GraphBarh'

export function initGraphBarhs (data) {
  function initMax (maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  function initGraphBarh (id, xLabel, yLabel, value, legend) {
    return new d3GraphBarh.GraphBarh({
      width: $(id).width(),
      height: $(id).height(),
      container: id,
      title: '',
      xLabel: xLabel,
      yLabel: yLabel,
      value: value,
      color: ['#548235', '#f5e9d8']
    })
  }

  // forets
  const forests = initGraphBarh(
    '#forets',
    'Superfice(hectare)',
    'Alitude(m)',
    ['forêt', 'hors-forêt']
  )

  //   dbhMaxGauge.render()

  // forets ultramafique
  const forestsUm = initGraphBarh(
    '#forets_um',
    'Superfice(hectare)',
    'Alitude(m)',
    ['forêt', 'hors-forêt']
  )

  //   distributionOccGauge.render()

  // Update Data for trigger
  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data.properties.frequencies)
  })

  function updateData (data) {
    function dataFilter (data, field, precision = 0) {
      const result = data
        .filter(d => d.class_object === field)
      // .map(d => {
      //   class_name: d.class_name,
      //   class_value: parseFloat(d.class_value.toFixed(precision))
      // })
      return result
    }

    function classFilter (data, field) {
      const result = data
        .filter(d => d.class_object === field)
        .map(d => d.class_name)
      return result
    }

    const elevation = classFilter(data, 'land_elevation')
    const land = dataFilter(data, 'land_elevation')
    const landUm = dataFilter(data, 'land_um_elevation')
    const forest = dataFilter(data, 'forest_elevation')
    const forestUm = dataFilter(data, 'forest_um_elevation')
    const forestData = land.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        forest: forest[i].class_value.toFixed(0),
        outForest: (d.class_value - forest[i].class_value).toFixed(0)
      }
      return result
    })
    const forestUmData = landUm.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        forest: forestUm[i].class_value.toFixed(0),
        outForest: (d.class_value - forestUm[i].class_value).toFixed(0)
      }
      return result
    })

    forests.update(forestData.reverse())
    forestsUm.update(forestUmData.reverse())
  };
};
