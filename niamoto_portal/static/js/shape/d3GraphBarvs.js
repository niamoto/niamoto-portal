import * as d3GraphBarv from '../d3GraphBarv'
import * as d3GraphBarvMulti from '../d3GraphBarvMulti'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'

export function initGraphBarvs(data) {

  function initGraphBarv(id, xLabel, yLabel, value, yDomain, maxValue = '', marginLeft = 0.15, legend) {
    return new d3GraphBarv.GraphBarv({
      width: $(id).width(),
      height: $(id).height(),
      container: id,
      title: '',
      xLabel: xLabel,
      yLabel: yLabel,
      value: value,
      yDomain: yDomain,
      maxValue: maxValue,
      marginLeft: marginLeft,
      color: [color.forest, color.forestOut]
    })
  }

  function initGraphBarvMulti(id, xLabel, yLabel, value, yDomain, maxValue = '', marginLeft = 0.15, legend) {
    return new d3GraphBarvMulti.GraphBarvMulti({
      width: $(id).width(),
      height: $(id).height(),
      container: id,
      title: '',
      xLabel: xLabel,
      yLabel: yLabel,
      value: value,
      yDomain: yDomain,
      maxValue: maxValue,
      marginLeft: marginLeft,
      color: [color.forest, color.forestOut]
    })
  }

  // Holdridge forest
  const holdridgeForest = initGraphBarv(
    '#holdridge_forest',
    '',
    '',
    ['Forêt', 'Hors-forêt'],
    [0, 100],
    100,
    .16
  )

  // land_use
  const landUse = initGraphBarvMulti(
    '#land_use',
    '',
    'Surface (ha)',
    '',
    '',
    100,
    .20
  )

  //   distributionOccGauge.render()

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