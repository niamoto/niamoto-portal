import * as d3_gauge from '../D3gauge';


export function initGauges(data) {

    var max_dbh = data['max_dbh'][0];
    var min_dbh = data['min_dbh'][0];
    var max_wood_density = data['max_wood_density'][0];
    var min_wood_density = data['min_wood_density'][0];
    var max_rainfall = data['max_rainfall'][0];
    var min_rainfall = data['min_rainfall'][0];
    var max_height = data['max_height'][0];
    var min_height = data['min_height'][0];

    // Count occurnce
    const dbh_max_Gauge = new d3_gauge.Gauge({
        width            : $("#dbh_max_widget").width(),
        height           : $("#dbh_max_widget").height(),
        displayUnit      : 'cm',
        minValue         : 0,
        maxValue         : max_dbh,
        container        : "#dbh_max_widget"
    });

    dbh_max_Gauge.render();
    
    // Count occurnce
    const distribution_occ_Gauge = new d3_gauge.Gauge({
        width            : $("#count_occurrences_widget").width(),
        height           : $("#count_occurrences_widget").height(),
        displayUnit      : '',
        container        : "#count_occurrences_widget"
    });

    distribution_occ_Gauge.render();

    // wood density
    const wood_density_max_Gauge = new d3_gauge.Gauge({
        width            : $("#wood_density_widget").width(),
        height           : $("#wood_density_widget").height(),
        displayUnit      : 'kg/m3',
        minValue         : 0,
        maxValue         : max_wood_density*1000,
        container        : "#wood_density_widget"
    });

     wood_density_max_Gauge.render();

    // rainfall min : aridity
    const rainfall_min_Gauge = new d3_gauge.Gauge({
        width            : $("#pluvio_min_widget").width(),
        height           : $("#pluvio_min_widget").height(),
        displayUnit      : 'mm/an',
        minValue         : 0,
        maxValue         : max_rainfall,
        container        : "#pluvio_min_widget"
    });

     rainfall_min_Gauge.render();

    // height max
    const height_max_Gauge = new d3_gauge.Gauge({
        width            : $("#height_max_widget").width(),
        height           : $("#height_max_widget").height(),
        displayUnit      : 'm',
        minValue         : 0,
        maxValue         : max_height,
        container        : "#height_max_widget"
    });

    height_max_Gauge.render();

    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data);
    });

    function updateData(data) {

        distribution_occ_Gauge.update(data['nb_occurrences'],
                                    data['total_nb_occurrences']);
        dbh_max_Gauge.update(data['dbh']['max'], max_dbh);
        if (data['wood_density'] !== undefined){
            wood_density_max_Gauge.update(data['wood_density']['max'] 
                *1000, max_wood_density*1000);
        };
        if (data['rainfall'] !== undefined){
            rainfall_min_Gauge.update(data['rainfall']['min'], max_rainfall);
        };
        if (data['heoght'] !== undefined){
            rainfall_min_Gauge.update(data['height']['max'], max_height);
        };

    };
};