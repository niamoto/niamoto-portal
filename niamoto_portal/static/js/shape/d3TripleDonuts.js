import * as d3GraphDonut from '../d3TripleDonuts'
import color from '../../css/source/nocompile/color_js.scss'


export function initGraphDonuts(data) {
  function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  // forets type
  const coversForests = new d3GraphDonut.GraphDonut({
    width: $('#covers_forest').width(),
    height: $('#covers_forest').height(),
    container: '#covers_forest',
    value: ['Forêt', 'Commune', 'NUM', 'UM'],
    legend: ['Forêt', 'Commune', 'NUM', 'UM'],
    color: [color.forest, color.forestOut, color.landNUM, color.landUM]
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

    function affectData(data) {
      return data.map(function (d, i) {
        var result = {
          label: d.class_name,
          value: d.class_value
        }
        return result
      })
    }

    const coverForestData = affectData(dataFilter(data, 'cover_forest'))
    const coverForestUmData = affectData(dataFilter(data, 'cover_forestum'))
    const coverForestNumData = affectData(dataFilter(data, 'cover_forestnum'))

    const coversForestData = {
      data1: coverForestData,
      color1: [color.forest, color.forestOut],
      data2: coverForestNumData,
      color2: [color.forest, color.landNUM],
      data3: coverForestUmData,
      color3: [color.forest, color.landUM]
    }

    coversForests.update(coversForestData)
  };
};