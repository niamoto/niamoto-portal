import * as d3GraphBarv from '../d3GraphBarv'
import * as d3GraphBarvMulti from '../d3GraphBarvMulti'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'

export function init(data) {

  // Holdridge forest
  const holdridgeForest = new d3GraphBarv.GraphBarv({
    width: $('#holdridge_forest').width(),
    height: $('#holdridge_forest').height(),
    container: '#holdridge_forest',
    value: ['Forêt', 'Hors-forêt'],
    yDomain: [0, 100],
    maxValue: 100,
    marginLeft: .16,
    color: [color.forest, color.forestOut]
  })
  

  // land_use
  const landUse = new d3GraphBarvMulti.GraphBarvMulti({
    width: $('#land_use').width(),
    height: $('#land_use').height(),
    container: '#land_use',
    yLabel: 'Surface (ha)',
    maxValue: 100,
    marginLeft: .2,
    color: [color.forest, color.forestOut]
  })
  
  // Update Data for trigger
  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data.properties.frequencies)
  })

  function updateData(data) {

    const holdridgeforest = d3Graph.dataFilter(data, 'holdridge_forest')
    const holdridgeforestOut = d3Graph.dataFilter(data, 'holdridge_forest_out')

    const holdridgeForestData = holdridgeforestOut.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        data1: holdridgeforest[i].class_value * 100,
        data2: (d.class_value) * 100
      }
      return result
    })

    holdridgeForest.update(holdridgeForestData.reverse())


    const landuse = d3Graph.dataFilter(data, 'land_use')

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