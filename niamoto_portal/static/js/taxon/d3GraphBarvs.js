import * as d3GraphBarv from '../d3GraphBarv'
import * as d3Graph from '../d3Graph'
import * as d3 from 'd3'
import color from '../../css/source/partials/_color_js.scss'

export function init(data) {

    const dbhs = new d3GraphBarv.GraphBarv({
        width: $(dbhHisto).width(),
        height: $(dbhHisto).height(),
        container: '#dbhHisto',
        value: ['dbh'],
        yDomain: [0, 100],
        yLabel: 'Fréquence',
        maxValue: 100,
        marginLeft: 0.15,
        color: [color.forest]
    })

    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data.frequencies)
    })

    function updateData(data) {

        const dbh = d3Graph.dataFilter(data, 'dbh')
        const dbhData = dbh.map(function (d, i) {
            var result = {
                class_name: d.class_name,
                data1: d.class_value,
            }
            return result
        })
        dbhs.config.yDomain = [0, d3.max(dbhData, d => d.data1)]
        dbhs.update(dbhData)

    }

};