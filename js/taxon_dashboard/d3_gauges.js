import * as d3_gauge from '../D3gauge';


export function initGauges(data) {

    var dbh_max = data['dbh']['max'];
    var dbh_min = data['dbh']['min'];
    var wood_density_max = data['wood_density']['max'];
    var wood_density_min = data['wood_density']['min'];
    var rainfall_max = data['rainfall']['max'];
    var rainfall_min = data['rainfall']['min'];
    var height_max = data['height']['max'];
    var height_min = data['height']['min'];
    var plots_count = data['plots_count'];

    // Count occurnce
    const dbh_max_Gauge = new d3_gauge.Gauge({
        width            : $("#dbh_max_widget").width(),
        height           : $("#dbh_max_widget").height(),
        displayUnit      : 'cm',
        minValue         : 0,
        maxValue         : dbh_max,
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
        maxValue         : wood_density_max *1000,
        container        : "#wood_density_widget"
    });

     wood_density_max_Gauge.render();

    // rainfall min : aridity
    const rainfall_min_Gauge = new d3_gauge.Gauge({
        width            : $("#pluvio_min_widget").width(),
        height           : $("#pluvio_min_widget").height(),
        displayUnit      : 'mm/an',
        minValue         : 0,
        maxValue         : rainfall_max,
        container        : "#pluvio_min_widget"
    });

     rainfall_min_Gauge.render();

    // height max
    const height_max_Gauge = new d3_gauge.Gauge({
        width            : $("#height_max_widget").width(),
        height           : $("#height_max_widget").height(),
        displayUnit      : 'm',
        minValue         : 0,
        maxValue         : height_max,
        container        : "#height_max_widget"
    });

    height_max_Gauge.render();
    

    // height max
    const distribution_geo_Gauge = new d3_gauge.Gauge({
        width            : $("#distribution_geo_widget").width(),
        height           : $("#distribution_geo_widget").height(),
        displayUnit      : 'nombre de parcelles',
        minValue         : 0,
        maxValue         : plots_count,
        container        : "#distribution_geo_widget"
    });

    distribution_geo_Gauge.render();



    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data);
    });

    function updateData(data) {

        distribution_occ_Gauge.update(data['nb_occurrences'],
                                    data['total_nb_occurrences']);
        dbh_max_Gauge.update(data['dbh']['max'], dbh_max);
        if (data['wood_density'] !== undefined){
            wood_density_max_Gauge.update(data['wood_density']['max'] 
                *1000, wood_density_max *1000);
        };
        if (data['rainfall'] !== undefined){
            rainfall_min_Gauge.update(data['rainfall']['min'], rainfall_max);
        };
        if (data['height'] !== undefined){
            height_max_Gauge.update(data['height']['max'], height_max);
        };
        if (data['plots_count'] !== undefined){
            distribution_geo_Gauge.update(data['plots_count'], plots_count);
        };
    };
};