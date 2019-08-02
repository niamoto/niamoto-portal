import 'd3';

export function initDistributionAlt() {

    var min_elevation = 0,
        max_elevation = 1700,
        range_elevation = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700]

    var height = $("#distribution_alt_widget").height();
    var width = $("#distribution_alt_widget").width();

    var margin = {
        top: height * 0.15,
        right: width * 0.07,
        bottom: height * 0.10,
        left: width * 0.15
    };

    var mheight = height - margin.top - margin.bottom -1;
    var mwidth = width - margin.left - margin.right;

    // Create grid 
    var grid_size = mheight / 17;
    var grid = d3.range(0, mheight / grid_size).map(function(i) {
            return [i * grid_size + grid_size / 2];
    });
    
    var outerScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, 1]);
    var heat_color = d3.scaleLinear()
        .clamp(true)
        .domain([
            0, 0.1111111111111111, 0.2222222222222222, 0.3333333333333333, 0.4444444444444444,
            0.5555555555555555, 0.6666666666666666, 0.7777777777777777, 0.8888888888888888, 1]
        )
        .range([
            '#ffffff', '#e6edeb', '#e1dac7', '#e9c693', '#f7b04b',
            '#ff8f00', '#f46400', '#db3b00', '#b81602', '#8b0000'
        ]);

    var densities = [];

    // Create svg
    var yScale = d3.scaleLinear()
        .domain([min_elevation, max_elevation])
        .range([ mheight, 0 ])

    var svg = d3.select("#distribution_alt_widget")
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style("position", "absolute")
        .style("left", 0)
        .style("top", margin.top +  "px");

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Y Axis
    var yAxis = d3.axisLeft(yScale)
        .tickPadding(10)
        .tickSizeInner(-mwidth )
        .ticks(18);

    svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(yAxis);

    var canvas = d3.select("#distribution_alt_widget").append("canvas")
        .attr("width", mwidth)
        .attr("height", mheight)
        .style("position", "absolute")
        .style("left", margin.left + "px")
        .style("top", (margin.top + 35) + "px")
        .style("opacity", .9);

    var context = canvas.node().getContext("2d");

    // Y Axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 63)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Altitude (m)");


    $('#taxon_treeview').on('taxonSelected',
        function (event, data, sorted_distribution, total, map_color) {
            updateData(data, map_color);
        }
    );

    function updateData(data, map_color) {

        var elev = (typeof data['environmental_values']['elevation'] !== 'undefined')?
            data['environmental_values']['elevation']
            :[] ;
        var i;
        // Initialise densities 
        for (i = 0; i < 18; i++){
            densities[i*100] = 0;
        }

        // Scale class densities
        var densitiesScale = d3.scaleQuantize()
            .domain([0, max_elevation]) 
            .range(range_elevation);

        // frequency class densities
        elev.map((d =>  densitiesScale(d))).forEach(function (d, i){
            if (!densities[d]){
                densities[d] = 0;
            }
            densities[d] = (densities[d] + 1 / elev.length);
        });

        outerScale.domain([0, d3.max(densities) || 0]);
        grid.forEach(function(point, idx) {
            context.beginPath();
            context.fillStyle = heat_color(outerScale(densities[idx*100]));
            // make trapeze
            var base_down = (mheight - (grid_size * (idx + 1)) ) * mwidth *.35 / mheight;
            var base_top = (mheight - grid_size * idx) * mwidth *.35 / mheight;
            var y = mheight - point[0];
            context.moveTo(mwidth *.5 - base_top,  y + grid_size *.5);
            context.lineTo(mwidth *.5 + base_top,  y + grid_size *.5);
            context.lineTo(mwidth *.5 + base_down, y - grid_size *.5);
            context.lineTo(mwidth *.5 - base_down, y - grid_size *.5);

            context.fill();
            // context.stroke();
            context.closePath();
            
        });

        // context.beginPath();
        // context.moveTo(mwidth *.5, 0);
        // context.lineTo(mwidth *(.5 - .35), mheight-1);
        // context.lineTo(mwidth *(.5 + .35), mheight-1);
        // context.stroke();
        // context.closePath();

    }
}


