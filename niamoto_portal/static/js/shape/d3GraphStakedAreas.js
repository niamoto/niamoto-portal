import * as d3GraphstakedArea from '../d3GraphStakedArea'
// import * as color from '../colors'
import color from '../../css/source/nocompile/color_js.scss'


export function initGraphStakedAreas(data) {
  function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  function initGraphStakedArea(id, xLabel, yLabel, value, yDomain, maxValue = '', marginLeft = 0.15, legend, color, xDomain) {
    return new d3GraphstakedArea.GraphStakedArea({
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
      legend: value,
      color: color,
      xDomain: xDomain
    })
  }

  // Holdridge forest
  const forestTypeElevation = initGraphStakedArea(
    '#forest_type_elevation',
    'Altitude(m)',
    '',
    ['Forêt secondaire', 'Forêt mature', 'Forêt coeur'],
    [0, 100],
    100,
    0.15,
    '',
    [color.forestSecondary, color.forestMature, color.forestHeart],
    ['100', '300', '500', '700', '900', '1100', '1300', '1500', '1700']
  )

  const forestFragmentation = initGraphStakedArea(
    '#forest_fragmentation',
    '',
    'Surface (ha)',
    ['Aire Cumulée'],
    [0, 100],
    100,
    0.15,
    '',
    [color.forest],
    ['10', '60', '125', '250', '375', '500', '1000', '1500', '2000', '27000']
    // ['10', '20', '30', '40', '50', '70', '80', '90', '100', '125', '150', '175', '200', '225', '250', '275', '300', '325', '350', '375', '400', '425', '450', '475', '500', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '7000', '12000', '22000', '27000', '32000']
  )

  //   distributionOccGauge.render()

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

    const forestTypeElevationMature = dataFilter(data, 'ratio_forest_mature_elevation')
    const forestTypeElevationCore = dataFilter(data, 'ratio_forest_core_elevation')
    const forestTypeElevationSecondary = dataFilter(data, 'ratio_forest_second_elevation')
    let forestFragmentationData = dataFilter(data, 'forest_fragmentation')

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