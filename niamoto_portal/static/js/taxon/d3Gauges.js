import * as d3Gauge from '../D3gauge'

export function initGauges(data) {
  const dbhMax = data.dbh_max
  const dbhMin = data.dbh_min
  const woodDensityMax = data.wood_density_max
  const woodDensityMin = 0
  const rainfallMax = 4500
  const rainfallMin = 0
  const heightMax = data.height_max
  const heightMin = data.height_min
  const ncpippn_count_max = data.ncpippn_count_max
  const occCount = data.occ_count_sum
  const leafThicknessMax = data.leaf_thickness_max
  const leafSlaMax = data.leaf_sla_max
  const leafLdmcMax = data.leaf_ldmc_max
  const leafAreaMax = data.leaf_area_max


  function initGauge(id, unit, minValue, maxValue, labelDecimal = '0') {
    return new d3Gauge.Gauge({
      width: $(id).width(),
      height: $(id).height(),
      displayUnit: unit,
      container: id,
      minValue: minValue,
      maxValue: maxValue,
      labelDecimal: labelDecimal
    })
  }

  // dbh Max
  const dbhMaxGauge = initGauge('#dbhMaxGauge', 'cm', dbhMin, dbhMax)
  dbhMaxGauge.render()

  // Count occurence
  // const distributionOccGauge = initGauge('#distributionOccGauge', "", 0, 100)
  // distributionOccGauge.render()

  // wood density
  const woodDensityGauge = initGauge('#woodDensityGauge', 'g.cm' + '-3'.sup(), 0, woodDensityMax, 3)
  woodDensityGauge.render()

  // rainfall min : aridity
  // const rainfallMinGauge = initGauge('#pluvioMinGauge', 'mm.an' + '-1'.sup(), 0, rainfallMax)
  // rainfallMinGauge.render()

  // height max
  const heightMaxGauge = initGauge('#heightMaxGauge', 'm', heightMin, heightMax)
  heightMaxGauge.render()

  // distributionGeo
  const distributionGeoGauge = initGauge('#distributionGeoGauge', 'Nombre de parcelles (%)', 0, 100)
  distributionGeoGauge.render()

  // leaf thickness
  const leafThickness = initGauge('#leafThickness', 'mm', 0, leafThicknessMax)
  leafThickness.render()

  // leaf sla
  const leafSla = initGauge('#leafSla', 'm' + '2'.sup()+'.kg' + '-1'.sup(), 0, leafLdmcMax)
  leafSla.render()

  // leaf Area
  const leafArea = initGauge('#leafArea', 'mm' + '2'.sup(), 0, leafAreaMax)
  leafArea.render()

  // leaf ldmc
  const leafLdmc = initGauge('#leafLdmc', 'mg/g', 0, 1000)
  leafLdmc.render()

  // Update Data for trigger
  $('#taxon_treeview').on('taxonSelected', function (event, data) {
    updateData(data)
  })



  function updateData(data) {
    // distributionOccGauge.update(data.occ_count / occCount * 100)
    dbhMaxGauge.update(data.dbh_max)
    woodDensityGauge.update(data.wood_density_max)
    distributionGeoGauge.update(data.ncpippn_count/ncpippn_count_max*100)
    // rainfallMinGauge.update(data.rainfall.min, rainfallMax)
    heightMaxGauge.update(data.height_max)
    // distributionGeoGauge.update(data.plotsCount, plotsCount)
    leafArea.update(data.leaf_area_avg)
    leafLdmc.update(data.leaf_ldmc_avg)
    leafSla.update(data.leaf_sla_avg)
    leafThickness.update(data.leaf_thickness_avg)

  };
};