import * as d3Gauge from '../D3gauge'
import * as Graph from '../d3Graph'

export function initGauges(data) {
  var basalAreaMax = 10
  var hMeanMax = 10
  var shannonMax = 10
  var pielouMax = 10
  var simpsonMax = 10
  var woodDensityMax = 1.2
  var biomasseMax = 10
  var richessMax = 10
  var speciesLevelMax = 100

  function initGauge(id, unit, maxValue, labelDecimal = '0') {
    return new d3Gauge.Gauge({
      width: $(id).width(),
      height: $(id).height(),
      displayUnit: unit,
      container: id,
      maxValue: maxValue,
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
    'm².ha<sup>-1</sup>',
    basalAreaMax)

  basalAreaGauge.render()

  // H mean
  var hMean = Math.max(...Array
    .from(data
      .map(e => e.properties.h_mean)
      .values()))
  hMeanMax = Graph.initMax(hMean, hMeanMax)

  const hMeanGauge = initGauge('#hMeanGauge', 'm', hMeanMax)

  hMeanGauge.render()

  // shannon
  var shannon = Math.max(...Array
    .from(data
      .map(e => e.properties.shannon)
      .values()))
  shannonMax = Graph.initMax(shannon, shannonMax)

  const shannonGauge = initGauge('#shannonGauge', 'SI', shannonMax, '1')

  shannonGauge.render()

  // pielou
  var pielou = Math.max(...Array
    .from(data
      .map(e => e.properties.pielou)
      .values()))
  pielouMax = Graph.initMax(pielou, pielouMax)

  const pielouGauge = initGauge('#pielouGauge', 'SI', pielouMax, '2')

  pielouGauge.render()

  // simpson
  var simpson = Math.max(...Array
    .from(data
      .map(e => e.properties.simpson)
      .values()))
  simpsonMax = Graph.initMax(simpson, simpsonMax)

  const simpsonGauge = initGauge('#simpsonGauge', 'SI', simpsonMax, '2')

  simpsonGauge.render()

  // woodDensity
  var woodDensity = Math.max(...Array
    .from(data
      .map(e => e.properties.wood_density)
      .values()))
  woodDensityMax = Graph.initMax(woodDensity, woodDensityMax)

  const woodDensityGauge = initGauge('#woodDensityGauge', 'g.cm' + '-3'.sup(), woodDensityMax, '3')

  woodDensityGauge.render()

  // biomasse
  var biomasse = Math.max(...Array
    .from(data
      .map(e => e.properties.biomasse)
      .values()))
  biomasseMax = Graph.initMax(biomasse, biomasseMax)

  const biomasseGauge = initGauge('#biomasseGauge', 'SI', biomasseMax)

  biomasseGauge.render()

  // richess
  var richess = Math.max(...Array
    .from(data
      .map(e => e.properties.count_species)
      .values()))
  richessMax = Graph.initMax(richess, richessMax)

  const richessGauge = initGauge('#richessGauge', 'nombre d espèces ', richessMax)

  richessGauge.render()

  // speciesLevel
  // var speciesLevel = Math.max(...Array
  //   .from(data
  //     .map(e => e.properties.speciesLevel)
  //     .values()))
  // speciesLevelMax = Graph.initMax(speciesLevel, speciesLevelMax)

  const speciesLevelGauge = initGauge('#speciesLevelGauge', '%', speciesLevelMax)

  speciesLevelGauge.render()

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
    woodDensityGauge.update(data.properties.wood_density, woodDensityMax)
    biomasseGauge.update(data.properties.biomasse, biomasseMax)
    richessGauge.update(data.properties.richess, richessMax)
    speciesLevelGauge.update(data.properties.species_level * speciesLevelMax, speciesLevelMax)
  }
}