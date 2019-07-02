import * as d3_gauge from '../D3gauge';


export function initGauges(data) {

    var basal_area_max = 0;
    var h_mean_max;

    basal_area_max = Math.max(...Array
                            .from(data.features
                            .map(e => e.properties.basal_area)
                            .values()));

    h_mean_max = Math.max(...Array
        .from(data.features
        .map(e => e.properties.h_mean)
        .values()));


    // Basal area
    const basal_area_Gauge = new d3_gauge.Gauge({
        width            : $("#basal_area_gauge").width(),
        height           : $("#basal_area_gauge").height(),
        minValue         : 0,
        maxValue         : basal_area_max,
        lowThreshhold    : basal_area_max * .2,
        lowMidThreshhold : basal_area_max * .4,
        highMidThreshhold: basal_area_max * .6,
        highThreshhold   : basal_area_max * .8,
        displayUnit      :  ''
    });

    basal_area_Gauge.render("#basal_area_gauge");
    

    // 
    const h_mean_Gauge = new d3_gauge.Gauge({
        width            : $("#h_mean_gauge").width(),
        height           : $("#h_mean_gauge").height(),
        minValue         : 0,
        maxValue         : h_mean_max,
        lowThreshhold    : h_mean_max * .2,
        lowMidThreshhold : h_mean_max * .4,
        highMidThreshhold: h_mean_max * .6,
        highThreshhold   : h_mean_max * .8,
        displayUnit      :  ''
    });

    h_mean_Gauge.render("#h_mean_gauge");

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data);
    });

    function updateData(data) {
        basal_area_Gauge.update(data['plot']['properties']['basal_area']);
        h_mean_Gauge.update(data['plot']['properties']['h_mean']);
    };
};