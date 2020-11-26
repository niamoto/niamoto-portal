import * as d3Gauge from '../D3gauge'
import * as Graph from '../d3Graph'

export function initGauges(data) {
  var basalAreaMax = 10
  var hMeanMax = 25
  var shannonMax = 5
  var pielouMax = 1
  var simpsonMax = 1
  var woodDensityMax = 1.2
  var biomassMax = 100
  var richessMax = 130
  var speciesLevelMax = 100

  function initGauge(id, unit, maxValue, minValue = 0, labelDecimal = '0') {
    return new d3Gauge.Gauge({
      width: $(id).width(),
      height: $(id).height(),
      displayUnit: unit,
      container: id,
      maxValue: maxValue,
      minValue: minValue,
      labelDecimal: labelDecimal
    })
  }

  // Basal area
  var basalArea = Math.max(...Array
    .from(data
      .map(e => e.properties.basal_area)
      .values()))

  basalAreaMax = Graph.initMax(basalArea, basalAreaMax)

  const basalAreaGauge = initGauge(
    '#basalAreaGauge',
    'm' + '2'.sup() +'.ha' + '-1'.sup(),
    basalAreaMax)

  basalAreaGauge.render()

  // H mean
  const hMeanGauge = initGauge('#hMeanGauge', 'm', hMeanMax)

  hMeanGauge.render()

  // shannon
  // var shannon = Math.max(...Array
  //   .from(data
  //     .map(e => e.properties.shannon)
  //     .values()))
  // shannonMax = Graph.initMax(shannon, shannonMax)

  const shannonGauge = initGauge('#shannonGauge', 'NA', shannonMax, 0, '1')

  shannonGauge.render()

  // pielou
  // var pielou = Math.max(...Array
  //   .from(data
  //     .map(e => e.properties.pielou)
  //     .values()))
  // pielouMax = Graph.initMax(pielou, pielouMax)

  const pielouGauge = initGauge('#pielouGauge', 'NA', pielouMax, 0, '2')

  pielouGauge.render()

  // simpson
  // var simpson = Math.max(...Array
  //   .from(data
  //     .map(e => e.properties.simpson)
  //     .values()))
  // simpsonMax = Graph.initMax(simpson, simpsonMax)

  const simpsonGauge = initGauge('#simpsonGauge', 'NA', simpsonMax, 0, '2')

  simpsonGauge.render()

  // woodDensity
  const woodDensityGauge = initGauge('#woodDensityGauge', 'g.cm' + '-3'.sup(), woodDensityMax, 0, '3')

  woodDensityGauge.render()

  // biomasse
  var biomass = Math.max(...Array
    .from(data
      .map(e => e.properties.biomass)
      .values()))
  biomassMax = Graph.initMax(biomass, biomassMax)

  const biomassGauge = initGauge('#biomasseGauge', 'tonnes.ha' + '-1'.sup(), biomassMax)

  biomassGauge.render()

  // richess
  // var richess = Math.max(...Array
  //   .from(data
  //     .map(e => e.properties.count_species)
  //     .values()))
  // richessMax = Graph.initMax(richess, richessMax)

  const richessGauge = initGauge('#richessGauge', "Nombre d'espèces/ha", richessMax)

  richessGauge.render()

  // Update Data for trigger
  $('#plot_select').on('plotSelected', function (event, data) {
    updateData(data)
  })

  function updateData(data) {
    basalAreaGauge.update(data.properties.basal_area, basalAreaMax)
    hMeanGauge.update(data.properties.h_mean, hMeanMax)
    shannonGauge.update(data.properties.shannon, shannonMax)
    pielouGauge.update(data.properties.pielou, pielouMax)
    simpsonGauge.update(data.properties.simpson, simpsonMax)
    woodDensityGauge.update(data.properties.wood_density_mean, woodDensityMax)
    biomassGauge.update(data.properties.biomass, biomassMax)
    richessGauge.update(data.properties.count_species, richessMax)
  }
}