'use strict'

import * as d3GraphBarhSimple from '../d3GraphBarhSimple'
import * as d3Graph from '../d3Graph'
import color from '../../css/source/partials/_color_js.scss'
import * as d3 from 'd3'

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
        maxValue: '',
        yDomainShow: 0,
        marginLeft: 0.02,
        yTextDomain: 1
    })

    // topspecies
    var topSpecies = new d3GraphBarhSimple.GraphBarhSimple({
        width: $('#topSpecies').width(),
        height: $('#topSpecies').height(),
        container: '#topSpecies',
        xLabel: 'Dénombrement',
        color: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
        maxValue: '',
        yDomainShow: 0,
        marginLeft: 0.02,
        yTextDomain: 1,
        tooltip: 1
    })

    const elevations = new d3GraphBarhSimple.GraphBarhSimple({
        width: $(elevationHisto).width(),
        height: $(elevationHisto).height(),
        container: '#elevationHisto',
        value: ['elevation'],
        yLabel: 'Altitude',
        xLabel: 'Pourcentage (%)',
        maxValue: 100,
        marginLeft: 0.15,
        color: [color.forest, color.forest, color.forest, color.forest, color.forest, color.forest, color.forest, color.forest, color.forest, color.forest, color.forest, color.forest, color.forest]
    })

    const pluvios = new d3GraphBarhSimple.GraphBarhSimple({
        width: $(pluvioHisto).width(),
        height: $(pluvioHisto).height(),
        container: '#pluvioHisto',
        value: ['pluvio'],
        yLabel: 'Précipitation',
        xLabel: 'Pourcentage (%)',
        maxValue: 100,
        marginLeft: 0.15,
        color: [color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide, color.tres_humide]
    })


    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data.frequencies)
    })

    function updateData(data) {

        const strate = d3Graph.dataFilter(data, 'strate')
        const strateData = d3Graph.dataJson(strate)

        const topSpecie = d3Graph.dataFilter(data, 'top_species')
        const topSpecieData = d3Graph.dataJson(topSpecie)

        strates.config.maxValue = ''
        strates.update(strateData.reverse())
        topSpecies.config.yDomain = ''
        topSpecies.config.maxValue = ''
        topSpecies.update(topSpecieData.reverse())


        const elevation = d3Graph.dataFilter(data, 'elevation')
        const elevationData = d3Graph.dataJson(elevation)
        elevations.config.maxValue = ''
        elevations.update(elevationData)

        const pluvio = d3Graph.dataFilter(data, 'rainfall')
        const pluvioData = d3Graph.dataJson(pluvio)
        pluvios.config.maxValue = ''
        pluvios.update(pluvioData.reverse())

    };
};