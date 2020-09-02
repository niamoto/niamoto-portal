'use strict'

import * as d3GraphBarvGroup from '../d3GraphBarvGroup'
import * as GraphOneBarV from '../d3GraphOneBarv'
import * as d3Graph from '../d3Graph'
import color from '../../css/source/partials/_color_js.scss'
import * as d3 from 'd3'

export function init(data) {

    //stems
    const stems = new GraphOneBarV.GraphOneBarV({
        width: $('#stemsHisto').width(),
        height: $('#stemsHisto').height(),
        container: '#stemsHisto',
        value: ['morte', 'vivante'],
        legend: ['morte', 'vivante'],
        color: [color.stemDead, color.stemLiving]
    })

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data.properties.frequencies)
    })

    function updateData(data) {

        const stem = d3Graph.dataFilter(data, 'stems')
        const stemData = d3Graph.dataJson(stem)

        stems.update(stemData)
    };
};