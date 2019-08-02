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
        displayUnit      : '',
        minValue         : 0,
        maxValue         : max_wood_density*100,
        container        : "#wood_density_widget"
    });

     wood_density_max_Gauge.render();

    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data);
    });

    function updateData(data) {

        // Count occurnce
        distribution_occ_Gauge.update(data['nb_occurrences'],
                                    data['total_nb_occurrences']);
        dbh_max_Gauge.update(data['dbh']['max'], max_dbh);
        if (data['wood_density'] !== undefined){
            wood_density_max_Gauge.update(data['wood_density']['max']*100, max_wood_density*100);
        };

    };
};