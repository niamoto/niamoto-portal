import * as d3Gauge from '../D3gauge'

export function initGauges(data) {
  const dbhMax = 500
  const dbhMin = data.dbh_min
  const woodDensityMax = 1.2
  const woodDensityMin = 0
  const rainfallMax = 4500
  const rainfallMin = 0
  const heightMax = data.height_max
  const heightMin = data.height_min
  const ncpippn_count_max = data.ncpippn_count_max
  const occCount = data.occ_count_sum
  const leafThicknessMax = 800
  const barkThicknessMax = 80
  const leafSlaMax = 50
  const leafLdmcMax = 800
  const leafAreaMax = 1500


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

  // wood density
  const woodDensityGauge = initGauge('#woodDensityGauge', 'g.cm' + '-3'.sup(), 0, woodDensityMax, 3)
  woodDensityGauge.render()

  // height max
  const heightMaxGauge = initGauge('#heightMaxGauge', 'm', heightMin, heightMax)
  heightMaxGauge.render()

  // distributionGeo
  const distributionGeoGauge = initGauge('#distributionGeoGauge', 'Nombre de parcelles (%)', 0, 100)
  distributionGeoGauge.render()

  // leaf thickness
  const leafThickness = initGauge('#leafThickness', 'µm', 0, leafThicknessMax)
  leafThickness.render()

  // leaf sla
  const leafSla = initGauge('#leafSla', 'm' + '2'.sup()+'.kg' + '-1'.sup(), 0, leafSlaMax)
  leafSla.render()

  // leaf Area
  const leafArea = initGauge('#leafArea', 'cm' + '2'.sup(), 0, leafAreaMax)
  leafArea.render()

  // leaf ldmc
  const leafLdmc = initGauge('#leafLdmc', 'mg.g' + '-1'.sup(), 0, leafLdmcMax)
  leafLdmc.render()

  // leaf ldmc
  const barkThickness = initGauge('#barkThickness', 'mm' , 0, barkThicknessMax)
  barkThickness.render()

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
    barkThickness.update(data.bark_thickness_avg)

  };
};
