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

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data.properties.frequencies)
    })

    function updateData(data) {

        const plantType = d3Graph.dataFilter(data, 'type_plant')
        const plantTypeData = d3Graph.dataJson(plantType);
        plantTypes.update(plantTypeData)

    };
};