import * as d3GraphDonut from '../d3Donut'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'

export function initGraphDonuts(data) {

  // forets type
  const coverForestsType = new d3GraphDonut.GraphDonut({
    width: $('#cover_forest_type').width(),
    height: $('#cover_forest_type').height(),
    container: '#cover_forest_type',
    value: ['forêt secondaire', 'forêt mature', 'forêt coeur'],
    legend: ['Forêt secondaire', 'Forêt mature', 'Forêt coeur'],
    color: [color.forestSecondary, color.forestMature, color.forestCore]
  })

  // Update Data for trigger
  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data.properties.frequencies)
  })

  function updateData(data) {

    let coverForestTypeData = d3Graph.dataFilter(data, 'cover_foresttype')
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