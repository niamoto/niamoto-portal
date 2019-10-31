import * as d3Gauge from '../D3gauge'

export function initGauges (data) {
  var basalAreaMax = 10
  var hMeanMax = 10
  var shannonMax = 10
  var pielouMax = 10
  var simpsonMax = 10
  var woodDensityMax = 1
  var biomasseMax = 10
  var richessMax = 10
  var speciesLevelMax = 100

  function initMax (maxValue, initMaxValue) {
    if (maxValue === 0) {
      return initMaxValue
    } else {
      return maxValue
    }
  }

  function initGauge (id, unit, maxValue) {
    return new d3Gauge.Gauge({
      width: $(id).width(),
      height: $(id).height(),
      displayUnit: unit,
      container: id,
      maxValue: maxValue
    })
  }

  // Basal area
  var basalArea = Math.max(...Array
    .from(data
      .map(e => e.basal_area)
      .values()))
  basalAreaMax = initMax(basalArea, basalAreaMax)

  const basalAreaGauge = initGauge(
    '#basalAreaGauge',
    'm².ha<sup>-1</sup>',
    basalAreaMax)

  basalAreaGauge.render()

  // H mean
  var hMean = Math.max(...Array
    .from(data
      .map(e => e.h_mean)
      .values()))
  hMeanMax = initMax(hMean, hMeanMax)

  const hMeanGauge = initGauge('#hMeanGauge', 'm', hMeanMax)

  hMeanGauge.render()

  // shannon
  var shannon = Math.max(...Array
    .from(data
      .map(e => e.shannon)
      .values()))
  shannonMax = initMax(shannon, shannonMax)

  const shannonGauge = initGauge('#shannonGauge', 'SI', shannonMax)

  shannonGauge.render()

  // pielou
  var pielou = Math.max(...Array
    .from(data
      .map(e => e.pielou)
      .values()))
  pielouMax = initMax(pielou, pielouMax)

  const pielouGauge = initGauge('#pielouGauge', 'SI', pielouMax)

  pielouGauge.render()

  // simpson
  var simpson = Math.max(...Array
    .from(data
      .map(e => e.simpson)
      .values()))
  simpsonMax = initMax(simpson, simpsonMax)

  const simpsonGauge = initGauge('#simpsonGauge', 'SI', simpsonMax)

  simpsonGauge.render()

  // woodDensity
  var woodDensity = Math.max(...Array
    .from(data
      .map(e => e.wood_density)
      .values()))
  woodDensityMax = initMax(woodDensity, woodDensityMax)

  const woodDensityGauge = initGauge('#woodDensityGauge', 'kg.m' + '-3'.sup(), woodDensityMax * 1000)

  woodDensityGauge.render()

  // biomasse
  var biomasse = Math.max(...Array
    .from(data
      .map(e => e.biomasse)
      .values()))
  biomasseMax = initMax(biomasse, biomasseMax)

  const biomasseGauge = initGauge('#biomasseGauge', 'SI', biomasseMax)

  biomasseGauge.render()

  // richess
  var richess = Math.max(...Array
    .from(data
      .map(e => e.count_species)
      .values()))
  richessMax = initMax(richess, richessMax)

  const richessGauge = initGauge('#richessGauge', 'nombre d espèces ', richessMax)

  richessGauge.render()

  // speciesLevel
  // var speciesLevel = Math.max(...Array
  //   .from(data
  //     .map(e => e.speciesLevel)
  //     .values()))
  // speciesLevelMax = initMax(speciesLevel, speciesLevelMax)

  const speciesLevelGauge = initGauge('#speciesLevelGauge', '%', speciesLevelMax)

  speciesLevelGauge.render()

  // Update Data for trigger
  $('#plot_select').on('plotSelected', function (event, data) {
    updateData(data)
  })

  function updateData (data) {
    basalAreaGauge.update(data.properties.basal_area, basalAreaMax)
    hMeanGauge.update(data.properties.h_mean, hMeanMax)
    shannonGauge.update(data.properties.shannon, shannonMax)
    pielouGauge.update(data.properties.pielou, pielouMax)
    simpsonGauge.update(data.properties.simpson, simpsonMax)
    woodDensityGauge.update(data.properties.wood_density * 1000, woodDensityMax * 1000)
    biomasseGauge.update(data.properties.biomasse, biomasseMax)
    richessGauge.update(data.properties.richess, richessMax)
    speciesLevelGauge.update(data.properties.species_level * speciesLevelMax, speciesLevelMax)
  }
}
