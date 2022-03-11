import * as d3GraphDonut from '../d3Donut'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'

export function init(data) {


  // substrat
  const distributionSubstrat = new d3GraphDonut.GraphDonut({
    width: $('#distributionSubstrat').width(),
    height: $('#distributionSubstrat').height(),
    container: '#distributionSubstrat',
    value: ['UM', 'NUM'],
    legend: ['Ultramafique (UM)', 'non-Ultramafique (NUM)'],
    color: [color.landUM, color.landNUM]
  })

  // Update Data for trigger
  $('#taxon_treeview').on('taxonSelected', function (event, data) {
    updateData(data)
  })

  function updateData(data) {



    let distributionSubstratData = [

      {
        label: 'NUM',
        value: (data.occ_count - data.occ_um_count) * 100 / (data.occ_count)
      },
      {
        label: 'UM',
        value: data.occ_um_count * 100 / (data.occ_count)
      }
    ]
    distributionSubstrat.update(distributionSubstratData)
  };
};