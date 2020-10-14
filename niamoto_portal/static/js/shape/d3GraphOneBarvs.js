import * as d3GraphBarv from '../d3GraphOneBarv'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'

export function initGraphBarvs(data) {

  const value = ['Forêt', 'Hors-forêt']
  const colors = [color.forest, color.forestOut]

  const coverForests = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest').width(),
    height: $('#cover_forest').height(),
    container: '#cover_forest',
    value: value,
    legend: value,
    color: colors
  })

  // forets Um
  const coverForestsUm = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_um').width(),
    height: $('#cover_forest_um').height(),
    container: '#cover_forest_um',
    value: value,
    legend: value,
    color: colors
  })

  // forets Num
  const coverForestsNum = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_num').width(),
    height: $('#cover_forest_num').height(),
    container: '#cover_forest_num',
    value: value,
    legend: value,
    color: colors
  })

  // forets type
  const coverForestsAdmin = new d3GraphBarv.GraphOneBarV({
    width: $('#cover_forest_admin').width(),
    height: $('#cover_forest_admin').height(),
    container: '#cover_forest_admin',
    value: ['concessions', 'réserves', 'forêts'],
    legend: ['concessions', 'réserves', 'forêts'],
    color: [color.concession, color.reserve, color.forest],
    yDomain: [70, 100],
    yTickValue: ['70', '80', '90', '100']
  })

  // forets type
  const substrat = new d3GraphBarv.GraphOneBarV({
    width: $('#substrat').width(),
    height: $('#substrat').height(),
    container: '#substrat',
    value: ['NUM', 'UM'],
    legend: ['Ultramafique (UM)', 'non Utramafique (NUM)'],
    color: [color.landUM, color.landNUM],
    typeLegend: 2,
    marginLeft: .2
  })

  // Update Data for trigger
  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data.properties.frequencies)
  })

  function updateData(data) {

    let coverForestData = d3Graph.dataFilter(data, 'cover_forest')
    coverForestData = coverForestData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForests.update(coverForestData)

    let coverForestUmData = d3Graph.dataFilter(data, 'cover_forestum')
    coverForestUmData = coverForestUmData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForestsUm.update(coverForestUmData)

    let coverForestNumData = d3Graph.dataFilter(data, 'cover_forestnum')
    coverForestNumData = coverForestNumData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForestsNum.update(coverForestNumData)

    let coverForestAdminData = d3Graph.dataFilter(data, 'cover_forestadmin')
    coverForestAdminData = coverForestAdminData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    coverForestsAdmin.update(coverForestAdminData)

    let substratData = d3Graph.dataFilter(data, 'substrat')
    substratData = substratData.map(function (d, i) {
      var result = {
        label: d.class_name,
        value: d.class_value
      }
      return result
    })
    substrat.update(substratData.reverse())
  };
};