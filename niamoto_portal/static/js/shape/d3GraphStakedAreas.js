import * as d3GraphstakedArea from '../d3GraphStakedArea'
import * as d3Graph from '../d3Graph'
import color from '../../css/source/partials/_color_js.scss'


export function init(data) {

  function initGraphStakedArea(id, xLabel, yLabel, value, yDomain, maxValue = '', marginLeft = 0.15, legend, color, xDomain, typeLegend = 1) {
    return 
  }

  // Holdridge forest
  const forestTypeElevation = new d3GraphstakedArea.GraphStakedArea({
    width: $('#forest_type_elevation').width(),
    height: $('#forest_type_elevation').height(),
    container: '#forest_type_elevation',
    xLabel: 'Altitude (m)',
    yLabel: 'Fréquence (%)',
    value: ['Forêt secondaire', 'Forêt mature', 'Forêt coeur'],
    yDomain:[0, 100],
    maxValue: 100,
    legend: ['Forêt secondaire', 'Forêt mature', 'Forêt coeur'],
    color: [color.forestSecondary, color.forestMature, color.forestCore],
    xDomain: ['100', '300', '500', '700', '900', '1100', '1300', '1500', '1700'],
    typeLegend: 1
  })
  
  // forestFragmentation
  const forestFragmentation = new d3GraphstakedArea.GraphStakedArea({
    width: $('#forest_fragmentation').width(),
    height: $('#forest_fragmentation').height(),
    xLabel: 'Surperficie (ha)',
    container: '#forest_fragmentation',
    yLabel: 'Fréquence (%)',
    value: ['Aire Cumulée'],
    maxValue: 100,
    legend: ['Aire Cumulée'],
    color: [color.forest],
    xDomain: ['10', '60', '125', '250', '375', '500', '1000', '1500', '2000', '27000'],
    typeLegend: 1
  })
  
  // Update Data for trigger
  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data.properties.frequencies)
  })

  function updateData(data) {

    const forestTypeElevationMature = d3Graph.dataFilter(data, 'ratio_forest_mature_elevation')
    const forestTypeElevationCore = d3Graph.dataFilter(data, 'ratio_forest_core_elevation')
    const forestTypeElevationSecondary = d3Graph.dataFilter(data, 'ratio_forest_second_elevation')
    let forestFragmentationData = d3Graph.dataFilter(data, 'forest_fragmentation')

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

    forestFragmentationData = forestFragmentationData.map(function (d, i) {
      var result = {
        class_name: d.class_name,
        data1: d.class_value * 100
      }
      return result
    })
    forestFragmentation.update(forestFragmentationData)
  }
}