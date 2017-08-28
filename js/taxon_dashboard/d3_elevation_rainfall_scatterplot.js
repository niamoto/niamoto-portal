import 'd3';

export function initElevationRainfallScatterplot() {

    var min_elevation = 0,
        max_elevation = 1628,
        min_rainfall = 290,
        max_rainfall = 4820;

    var full_height = $("#elevation_rainfall_scatterplot").height();
    var full_width = $("#elevation_rainfall_scatterplot").width();

    var margin = {
        top: full_height * 0.05,
        right: full_width * 0.07,
        bottom: full_height * 0.13,
        left: full_width * 0.10
    };

    var height = full_height - margin.top - margin.bottom;
    var width = full_width - margin.left - margin.right;

    // Create grid for kde heatmap
    var grid_size = 10;
    var grid = d3.merge(d3.range(0, height / grid_size).map(function(i) {
        return d3.range(0, width / grid_size).map(function(j) {
            return [j * grid_size + grid_size / 2, i * grid_size + grid_size / 2];
        });
    }));
    var outerScale = d3.scalePow()
        .exponent(0.6)
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

    var canvas = d3.select("#elevation_rainfall_scatterplot").append("canvas")
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("left", margin.left + "px")
        .style("top", (margin.top + 41) + "px")
        .style("opacity", 0.75);

    var context = canvas.node().getContext("2d");

    // Create svg
    var x = d3.scaleLinear()
        .domain([min_elevation, max_elevation])
        .range([ 0, width ]);

    var y = d3.scaleLinear()
        .domain([min_rainfall, max_rainfall])
        .range([ height, 0 ]);

    var svg = d3.select("#elevation_rainfall_scatterplot")
        .append('svg')
        .attr('width', full_width)
        .attr('height', full_height);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X Axis
    var xAxis = svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")");
    xAxis.call(d3.axisBottom(x));

    // Y Axis
    var yAxis = svg.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;
    yAxis.call(d3.axisLeft(y));

    // X Axis label
    svg.append("text")
        .attr("transform", "translate("
            + (full_width / 2) + " ,"
            + (full_height - 15) + ")")
        .style("text-anchor", "middle")
        .text("Altitude (m)");

    // Y Axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 63)
        .attr("x",0 - (full_height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Précipitations (mm/an)");


    $('#taxon_treeview').on('taxonSelected',
        function (event, data, sorted_distribution, total, map_color) {
            updateData(data, map_color);
        }
    );

    function updateData(data, map_color) {
        var elev = data['environmental_values']['elevation'],
            rainfall = data['environmental_values']['rainfall'],
            taxon_name = data['environmental_values']['tax_full_name'];

        // Heat map
        var xy_points = [[]]
        if (elev) {
            xy_points = elev.map(function (elev, i) {
                return [x(elev), y(rainfall[i])];
            });
        }
        var x_points = xy_points.map(function(d) { return d[0] }).sort(function(a, b) { return a - b });
        var iqr = d3.quantile(x_points, 0.75) - d3.quantile(x_points, 0.25);
        var h = 1.06 * Math.min(d3.deviation(x_points), iqr / 1.34) * Math.pow(xy_points.length, -0.2);
        var h2 = h * h;

        // Compute KDE for each (x,y) pair and update the color scale
        densities = grid.map(function(point) { return kde(point, xy_points, h, h2); });
        // outerScale.domain([0, d3.max(densities) || 0]);
        outerScale.domain([0, d3.max(densities) || 0]);
        grid.forEach(function(point, idx) {
            context.beginPath();
            context.fillStyle = heat_color(outerScale(densities[idx]));
            // Subtract to get the corner of the grid cell
            context.rect(
                point[0] - grid_size / 2, point[1] - grid_size / 2,
                grid_size, grid_size
            );
            context.fill();
            context.closePath();
        });

        var dots = g.selectAll('circle')
            .data(elev || []);

        dots.enter()
            .append("circle")
            .attr('class', 'dot')
            .attr('fill', function(d, i) {
                return map_color[taxon_name[i]] || map_color["Autres"];
            })
            .attr('cx', function(d) { return x(d); })
            .attr('cy', function(d, i) { return y(rainfall[i]); })
            .transition()
            .duration(1000)
            .attr('r', 4);

        dots.transition()
            .duration(1000)
            .attr('fill', function(d, i) {
                return map_color[taxon_name[i]] || map_color["Autres"];
            })
            .attr('cx', function(d) { return x(d); })
            .attr('cy', function(d, i) { return y(rainfall[i]); })

        dots.exit()
            .transition()
            .duration(1000)
            .attr('r', 0)
            .remove();
    }
}

function kde(gridPoint, xy_points, h, h2) {
  return d3.mean(xy_points, function(p) { return gaussian(norm(p, gridPoint) / h) }) / h2;
}

// Norm of 2D arrays/vectors
function norm(v1, v2) {
  return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]));
}

function gaussian(x) {
  // sqrt(2 * PI) is approximately 2.5066
  return Math.exp(-x * x / 2) / 2.5066;
}
