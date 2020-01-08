import * as radarChart from '../radarChart'

const w = 210
const h = 210

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

export function initRadarChart() {
  // Data
  const d = [
    [{
        axis: 'Très sec',
        value: 0
      },
      {
        axis: 'Sec',
        value: 0
      },
      {
        axis: 'Humide',
        value: 0
      },
      {
        axis: 'Très humide',
        value: 0
      },
      {
        axis: 'Toujours humide',
        value: 0
      }
    ]
  ]

  // Options for the Radar chart, other than default
  const mycfg = {
    w: w,
    h: h,
    maxValue: 1,
    levels: 5,
    ExtraWidthX: 150,
    ExtraWidthY: 150,
    factorLegend: 0.85
  }
  radarChart.RadarChart.draw('#holdridge', d, mycfg)
}

// Update Data for trigger
$('#shape_select').on('shapeSelected', function (event, data) {
  updateData(data.properties.frequencies)
})

function updateData(data) {
  data = dataFilter(data, 'Holdridge')
  const holdridgeData = [data.map(function (d) {
    var result = {
      axis: d.class_name,
      value: d.class_value
    }
    return result
  })]

  // Options for the Radar chart, other than default
  const mycfg = {
    w: w,
    h: h,
    maxValue: 1,
    levels: 5,
    ExtraWidthX: 150,
    ExtraWidthY: 150,
    factorLegend: 0.85
  }
  radarChart.RadarChart.draw('#holdridge', holdridgeData, mycfg)
}