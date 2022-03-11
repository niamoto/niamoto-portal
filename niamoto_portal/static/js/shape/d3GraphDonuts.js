import * as d3GraphDonut from '../d3Donut'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'

export function init(data) {

  // forets type
  const coverForestsType = new d3GraphDonut.GraphDonut({
    width: $('#cover_forest_type').width(),
    height: $('#cover_forest_type').height(),
    container: '#cover_forest_type',
    value: ['forêt secondaire', 'forêt mature', 'forêt coeur'],
    legend: ['Forêt secondaire', 'Forêt mature', 'Forêt de coeur'],
    color: [color.forestSecondary, color.forestMature, color.forestCore]
  })

  // Update Data for trigger
  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data.properties.frequencies)
  })

  function updateData(data) {

    let coverForestTypeData = d3Graph.dataFilter(data, 'cover_foresttype')
    coverForestTypeData = d3Graph.dataJson(coverForestTypeData)
    coverForestsType.update(coverForestTypeData) //.reverse())
  };
};