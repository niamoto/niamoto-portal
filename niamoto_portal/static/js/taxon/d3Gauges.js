import * as d3Gauge from '../D3gauge'

export function initGauges(data) {
  var dbhMax = 150
  var dbhMin = 0
  var woodDensityMax = 1
  var woodDensityMin = 0
  var rainfallMax = 4500
  var rainfallMin = 0
  var heightMax = 40
  var heightMin = 0
  var plotsCount = 20

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

  // Count occurnce
  const dbhMaxGauge = initGauge('#dbhMaxGauge', 'cm', 0, dbhMax)

  dbhMaxGauge.render()

  // Count occurence
  const distributionOccGauge = initGauge('#distributionOccGauge', "", 0, 20)

  distributionOccGauge.render()

  // wood density
  const woodDensityGauge = initGauge('#woodDensityGauge', 'kg.m' + '-3'.sup(), 0, woodDensityMax * 1000)

  woodDensityGauge.render()

  // rainfall min : aridity
  const rainfallMinGauge = initGauge('#pluvioMinGauge', 'mm.an' + '-1'.sup(), 0, rainfallMax)

  rainfallMinGauge.render()

  // height max
  const heightMaxGauge = initGauge('#heightMaxGauge', 'm', 0, heightMax)

  heightMaxGauge.render()

  // distributionGeo
  const distributionGeoGauge = initGauge('#distributionGeoGauge', 'nombre de parcelles', 0, plotsCount)

  distributionGeoGauge.render()

  // distributionGeo
  const sizePopGauge = initGauge('#sizePopGauge', 'Fréquence sur chaque parcelle', 0, plotsCount)

  sizePopGauge.render()

  // Update Data for trigger
  $('#taxon_treeview').on('taxonSelected', function (event, data) {
    updateData(data)
  })

  function updateData(data) {
    // distributionOccGauge.update(data.nbOccurrences, data.total_nbOccurrences)
    dbhMaxGauge.update(data.dbh_max, dbhMax)
    woodDensityGauge.update(data.wood_density_max * 1000, woodDensityMax * 1000)
    // rainfallMinGauge.update(data.rainfall.min, rainfallMax)
    heightMaxGauge.update(data.height_max, heightMax)
    // distributionGeoGauge.update(data.plotsCount, plotsCount)
  };
};