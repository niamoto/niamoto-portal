'use strict'

import * as d3GraphBarhSimple from '../d3GraphBarhSimple'
import * as d3Graph from '../d3Graph'
import color from '../../css/source/partials/_color_js.scss'
import * as d3 from 'd3'

export function init(data) {

    // strates
    var strates = new d3GraphBarhSimple.GraphBarhSimple({
        width: $('#stratesHisto').width(),
        height: $('#stratesHisto').height(),
        container: '#stratesHisto',
        yDomain: ['Emergent', 'Canopée', 'Sous-Canopée', 'Sous-bois'],
        value: [100, 0],
        xLabel: 'Pourcentage du peuplement (%)',
        color: [color.emerging, color.canopy, color.undercanopy, color.undergrowth],
        maxValue: '',
        yDomainShow: 0,
        marginLeft: 0.02,
        yTextDomain: 1
    })

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data.properties.frequencies)
    })

    function updateData(data) {

        const strate = d3Graph.dataFilter(data, 'strates')
        const strateData = d3Graph.dataJson(strate)
        strates.config.maxValue = ''
        strates.update(strateData)




    };
};