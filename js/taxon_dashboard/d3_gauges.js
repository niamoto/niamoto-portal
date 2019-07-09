import * as d3_gauge from '../D3gauge';


export function initGauges() {

    var count_occurrences_max = 63000;
    var h_mean_max;

    // basal_area_max = Math.max(...Array
    //                         .from(data.features
    //                         .map(e => e.properties.basal_area)
    //                         .values()));

    // h_mean_max = Math.max(...Array
    //     .from(data.features
    //     .map(e => e.properties.h_mean)
    //     .values()));


    // Count occurnce
    const distribution_occ_Gauge = new d3_gauge.Gauge({
        width            : $("#count_occurrences_widget").width(),
        height           : $("#count_occurrences_widget").height(),
        minValue         : 0,
        maxValue         : count_occurrences_max,
        lowThreshhold    : count_occurrences_max * .2,
        lowMidThreshhold : count_occurrences_max * .4,
        highMidThreshhold: count_occurrences_max * .6,
        highThreshhold   : count_occurrences_max * .8,
        displayUnit      :  ''
    });

    distribution_occ_Gauge.render("#count_occurrences_widget");
    

    // 
    // const h_mean_Gauge = new d3_gauge.Gauge({
    //     width            : $("#h_mean_gauge").width(),
    //     height           : $("#h_mean_gauge").height(),
    //     minValue         : 0,
    //     maxValue         : h_mean_max,
    //     lowThreshhold    : h_mean_max * .2,
    //     lowMidThreshhold : h_mean_max * .4,
    //     highMidThreshhold: h_mean_max * .6,
    //     highThreshhold   : h_mean_max * .8,
    //     displayUnit      :  ''
    // });

    // h_mean_Gauge.render("#h_mean_gauge");

    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data);
    });

    function updateData(data) {
        distribution_occ_Gauge.update(data['nb_occurrences']);
        // h_mean_Gauge.update(data['plot']['properties']['h_mean']);
    };
};