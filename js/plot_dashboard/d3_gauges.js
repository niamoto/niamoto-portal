import * as d3_gauge from '../D3gauge';


export function initGauges(data) {

    var basal_area_max = 0;

    basal_area_max = Math.max(...Array.from(data.features.map(e => e.properties.basal_area).values()));

    const basal_area_Gauge = new d3_gauge.Gauge({
        width            : $("#basal_area_gauge").width(),
        height           : $("#basal_area_gauge").height(),
        minValue         : 0,
        maxValue         : basal_area_max,
        lowThreshhold    : basal_area_max * .2,
        lowMidThreshhold : basal_area_max * .4,
        highMidThreshhold: basal_area_max * .6,
        highThreshhold   : basal_area_max * .8,
        displayUnit      :  'test'
    });

    basal_area_Gauge.render("#basal_area_gauge");

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data);
    });

    function updateData(data) {
        console.log(data);
        basal_area_Gauge.update(data['plot']['properties']['basal_area']);
    };
};