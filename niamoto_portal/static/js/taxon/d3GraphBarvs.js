'use strict'

import * as d3GraphBarvGroup from '../d3GraphBarvGroup'
import * as d3Graph from '../d3Graph'
import color from '../../css/source/partials/_color_js.scss'
import * as d3 from 'd3'

export function init(data) {

    // phenology
    const phenologys = new d3GraphBarvGroup.GraphBarvGroup({
        width: $('#phenologyHisto').width(),
        height: $('#phenologyHisto').height(),
        container: '#phenologyHisto',
        xDomain: [
            'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
            'aout', 'septembre', 'octobre', 'novembre', 'decembre'
        ],
        yDomain: [0, 100],
        value: ['fleur', 'fruit'],
        legend: ['Fleur', 'Fruit'],
        yLabel: 'Fréquence (%)',
        color: {
            fleur: color.phenologyFlower,
            fruit: color.phenologyFruit
        },
        maxValue: '',
        columns: ['month', 'fleur', 'fruit'],
        rectRx: 2,
        marginBottom: .4,
        xDomainTextRotation: -35,
        xDomainTextPosition: 'end'
    })

    const dbhs = new d3GraphBarvGroup.GraphBarvGroup({
        width: $('#dbhHisto').width(),
        height: $('#dbhHisto').height(),
        container: '#dbhHisto',
        value: ['dbh'],
        yDomain: [0, 100],
        yLabel: 'Fréquence (%)',
        xLabel: 'Classe de diamètre (en cm)',
        maxValue: 100,
        marginLeft: 0.15,
        color: {
            dbh: color.forest
        },
        columns: ['class_name', 'dbh'],
        rectRx: 2,
    })



    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data.frequencies)
    })

    function updateData(data) {

        const phenoFleur = d3Graph.dataFilter(data, 'pheno_fleur')
        const phenoFruit = d3Graph.dataFilter(data, 'pheno_fruit')

        let phenologyData = []
        let valueMax = 0
        for (let i = 0; i < phenologys.config.xDomain.length; i++) {
            let max = 0
            if (phenoFleur[i].class_value >= phenoFruit[i].class_value) {
                max = phenoFleur[i].class_value
            } else {
                max = phenoFruit[i].class_value
            }
            if (valueMax <= max) {
                valueMax = max
            }
            phenologyData[i] = {
                month: phenologys.config.xDomain[i],
                fleur: phenoFleur[i].class_value * 100,
                fruit: phenoFruit[i].class_value * 100
            }
        }

        phenologys.config.yDomain = [0, valueMax * 100]
        phenologys.update(phenologyData)

        const dbh = d3Graph.dataFilter(data, 'dbh')
        const dbhData = dbh.map(function (d, i) {
            var result = {
                class_name: d.class_name,
                dbh: d.class_value,
            }
            return result
        })
        dbhs.config.yDomain = [0, d3.max(dbhData, d => d.dbh)]
        dbhs.update(dbhData.reverse())



    };
};