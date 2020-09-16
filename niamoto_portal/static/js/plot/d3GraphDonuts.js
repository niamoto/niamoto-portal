import * as d3GraphDonut from '../d3Donut'
import color from '../../css/source/partials/_color_js.scss'
import * as d3Graph from '../d3Graph'

export function init(data) {

    // forets type
    const plantTypes = new d3GraphDonut.GraphDonut({
        width: $('#plantTypeDonut').width(),
        height: $('#plantTypeDonut').height(),
        container: '#plantTypeDonut',
        value: ['arbres', 'fougères', 'lianes', 'palmiers'],
        legend: ['arbres', 'fougères', 'lianes', 'palmiers'],
        color: [color.tree, color.ferns, color.lianas, color.palms]
    })

    // familyTop10
    const familyTops = new d3GraphDonut.GraphDonut({
        width: $('#familyTop10').width(),
        height: $('#familyTop10').height(),
        container: '#familyTop10',
        toolTip:1
        // color: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
    })

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data.properties.frequencies)
    })

    function updateData(data) {

        const plantType = d3Graph.dataFilter(data, 'type_plant')
        const plantTypeData = d3Graph.dataJson(plantType);
        plantTypes.update(plantTypeData.reverse())

        const familyTop = d3Graph.dataFilter(data, 'top10_family')
        const familyTopData = d3Graph.dataJson(familyTop)
        familyTops.config.legend = familyTopData.map(d=> d.class_name)
        familyTops.legende()
        familyTops.update(familyTopData.reverse())

    };
};