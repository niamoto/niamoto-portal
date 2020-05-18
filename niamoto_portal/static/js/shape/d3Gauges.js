import * as d3Gauge from '../D3gauge'

export function initGauges(data) {
  var fragmentationMax = 10

  function initMax(maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  function initGauge(id, unit, minValue, maxValue) {
    return new d3Gauge.Gauge({
      width: $(id).width(),
      height: $(id).height(),
      displayUnit: unit,
      container: id,
      minValue: minValue,
      maxValue: maxValue
    })
  }

  // Fragmentation
  const fragmentation = initGauge('#fragmentation', 'Maille effective', 0, fragmentationMax)

  fragmentation.render()

  $('#shape_select').on('shapeSelected', function (event, data) {
    updateData(data)
  })

  function updateData(data) {
    fragmentation.update(data.properties.fragment_meff_cbc, fragmentationMax)
  }
};