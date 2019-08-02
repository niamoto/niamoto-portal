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
        displayUnit      :  '',
        container        : "#basal_area_gauge"
    });

    basal_area_Gauge.render();
    

    // 
    const h_mean_Gauge = new d3_gauge.Gauge({
        width            : $("#h_mean_gauge").width(),
        height           : $("#h_mean_gauge").height(),
        displayUnit      :  '',
        container        : "#h_mean_gauge"
    });

    h_mean_Gauge.render();

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data);
    });

    function updateData(data) {
        basal_area_Gauge.update(data['plot']['properties']['basal_area'],basal_area_max);
        h_mean_Gauge.update(data['plot']['properties']['h_mean'], h_mean_max);
    };
};