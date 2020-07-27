import * as d3GraphBarhSimple from '../d3GraphBarhSimple'
import * as d3Graph from '../d3Graph'
import color from '../../css/source/partials/_color_js.scss'

export function init(data) {

    // strates
    var strates = new d3GraphBarhSimple.GraphBarhSimple({
        width: $('#strate').width(),
        height: $('#strate').height(),
        container: '#strate',
        yDomain: ['Emergent', 'Canopée', 'Sous-Canopée', 'Sous-bois'],
        value: [100, 0],
        xLabel: 'Pourcentage du peuplement (%)',
        color: [color.emerging, color.canopy, color.undercanopy, color.undergrowth],
        maxValue: 100,
        yDomainShow: 0,
        marginLeft: 0.02,
        yTextDomain: 1
    })


    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data.frequencies)
    })

    function updateData(data) {

        const strate = d3Graph.dataFilter(data, 'strate')
        const strateData = d3Graph.dataJson(strate)

        strates.update(strateData.reverse())


    };
};