import * as d3GraphDonut from '../d3TripleDonuts'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'


export function init(data) {

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

    const coverForestData = d3Graph.dataJson(d3Graph.dataFilter(data, 'cover_forest'))
    const coverForestUmData = d3Graph.dataJson(d3Graph.dataFilter(data, 'cover_forestum'))
    const coverForestNumData = d3Graph.dataJson(d3Graph.dataFilter(data, 'cover_forestnum'))

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