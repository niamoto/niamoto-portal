'use strict'

import * as GraphOneBarV from '../d3GraphOneBarv'
import * as d3GraphBarvGroup from '../d3GraphBarvGroup'
import * as d3Graph from '../d3Graph'
import color from '../../css/source/partials/_color_js.scss'

export function init(data) {

    //stems
    const stems = new GraphOneBarV.GraphOneBarV({
        width: $('#stemsHisto').width(),
        height: $('#stemsHisto').height(),
        container: '#stemsHisto',
        value: ['morte', 'vivante'],
        legend: ['mort', 'vivant'],
        color: [color.stemDead, color.stemLiving]
    })

    const dbhs = new d3GraphBarvGroup.GraphBarvGroup({
        width: $('#dbhHisto').width(),
        height: $('#dbhHisto').height(),
        container: '#dbhHisto',
        value: ['dbh'],
        yDomain: [0, 100],
        yLabel: 'Fréquence (%)',
        xLabel: 'Classe de diamètre (cm)',
        maxValue: 100,
        marginLeft: 0.15,
        color: {
            dbh: color.forest
        },
        columns: ['class_name', 'dbh'],
        rectRx: 2,
    })

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data.properties.frequencies)
    })

    function updateData(data) {

        const stem = d3Graph.dataFilter(data, 'stems')
        const stemData = d3Graph.dataJson(stem)

        stems.update(stemData)

        const dbh = d3Graph.dataFilter(data, 'dbh')
        const dbhData = dbh.map(function (d, i) {
            var result = {
                class_name: d.class_name,
                dbh: d.class_value,
            }
            return result
        })
        dbhs.config.yDomain = [0, d3.max(dbhData, d => d.dbh)]
        dbhs.update(dbhData)

    };
};