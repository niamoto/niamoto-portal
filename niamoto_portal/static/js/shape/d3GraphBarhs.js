import * as d3GraphBarh from '../d3GraphBarh'
import * as d3GraphPyramidh from '../d3GraphPyramidh'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'

export function init(data) {

  // forets
  const forests = new d3GraphBarh.GraphBarh({
    width: $('#forests').width(),
    height: $('#forests').height(),
    container: '#forests',
    xLabel: 'Superfice (ha)',
    yLabel: 'Alitude (m)',
    value: ['Forêt', 'Hors-forêt'],
    yDomain: ['1700', '1500', '1300', '1100', '900', '700', '500', '300', '100'],
    color: [color.forest, color.forestOut]
  })
  

    // cover forest NUM UM
    const ratioForest = new d3GraphPyramidh.GraphPyramidh ({
      width: $('#ratio_forests').width(),
      height: $('#ratio_forests').height(),
      container: '#ratio_forests',
      xLabel: 'Couverture (%)',
      yLabel: 'Alitude (m)',
      value: ['Forêt (UM)', 'Forêt (NUM)', 'Hors-forêt'],
      yDomain: ['1700', '1500', '1300', '1100', '900', '700', '500', '300', '100'],
      maxValue: 100,
      marginLeft: .22,
      color: [color.forestUM, color.forestNUM, color.forestOut, color.forestOut]
    })
    
    
  // Update Data for trigger
  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data.properties.frequencies)
  })

  function updateData(data) {

    const land = d3Graph.dataFilter(data, 'land_elevation')
    const landUm = d3Graph.dataFilter(data, 'land_um_elevation')
    const forest = d3Graph.dataFilter(data, 'forest_elevation')
    const forestUm = d3Graph.dataFilter(data, 'forest_um_elevation')
    const ratioForestNUM = d3Graph.dataFilter(data, 'ratio_forest_num_elevation')
    const ratioForestUM = d3Graph.dataFilter(data, 'ratio_forest_um_elevation')
    const forestData = land.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        data1: forest[i].class_value.toFixed(0),
        data2: (d.class_value - forest[i].class_value).toFixed(0)
      }
      return result
    })

    const ratioForestData = ratioForestNUM.map(function (d, i) {
      let UM
      let NUM
      if (landUm[i].class_value === 0) {
        UM = 0
      } else {
        UM = 100
      }
      if (land[i].class_value - landUm[i].class_value === 0) {
        NUM = 0
      } else {
        NUM = 100
      }
      var result = {
        class_name: d.class_name,
        data1: ratioForestUM[i].class_value * 100,
        data2: ratioForestNUM[i].class_value * 100,
        data3: UM,
        data4: NUM
      }
      return result
    })
    forests.update(forestData.reverse())
    ratioForest.update(ratioForestData.reverse())
  };
};