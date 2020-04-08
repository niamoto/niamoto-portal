import * as d3GraphDonut from '../d3Donut'

export function initGraphDonuts(data) {
  function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  // forets type
  const coverForestsType = new d3GraphDonut.GraphDonut({
    width: $('#cover_forest_type').width(),
    height: $('#cover_forest_type').height(),
    container: '#cover_forest_type',
    value: ['forêt secondaire', 'forêt mature', 'forêt coeur'],
    legend: ['Forêt secondaire', 'Forêt mature', 'Forêt coeur'],
    color: ['#ceec72', '#78ac01', '#2b8313']
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

    let coverForestTypeData = dataFilter(data, 'cover_foresttype')
    coverForestTypeData = coverForestTypeData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForestsType.update(coverForestTypeData.reverse())
  };
};