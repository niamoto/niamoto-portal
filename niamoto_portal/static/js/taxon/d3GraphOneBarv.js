import * as d3GraphBarv from '../d3GraphOneBarv'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'

export function init(data) {

    const holdridges = new d3GraphBarv.GraphOneBarV({
        width: $('#holdridgeHisto').width(),
        height: $('#holdridgeHisto').height(),
        container: '#holdridgeHisto',
        value: ['Très humide', 'Humide', 'Sec'],
        legend: ['Très humide', 'Humide', 'Sec'],
        color: [color.tres_humide, color.humide, color.sec, ]
    })

    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data.frequencies)
    })

    function updateData(data) {

        let holdridgeData = d3Graph.dataFilter(data, 'holdridge')
        holdridgeData = d3Graph.dataJson(holdridgeData)
        holdridges.update(holdridgeData) //.reverse())
    }
};