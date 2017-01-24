define([
    'jquery',
    'd3',
], function($, d3) {

    function initElevationRainfallScatterplot() {

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

        $('#taxon_treeview').on('taxonSelected', function (event, data) {
            updateData(data);
        });

        function updateData(data) {
            var elev = data['environmental_values']['elevation'],
                rainfall = data['environmental_values']['rainfall'];

            var dots = g.selectAll('circle')
                .data(elev);

            dots.enter()
                .append("circle")
                .attr('class', 'dot')
                .attr('cx', function(d) { return x(d); })
                .attr('cy', function(d, i) { return y(rainfall[i]); })
                .transition()
                .duration(1000)
                .attr('r', 4);

            dots.transition()
                .duration(1000)
                .attr('cx', function(d) { return x(d); })
                .attr('cy', function(d, i) { return y(rainfall[i]); })

            dots.exit()
                .transition()
                .duration(1000)
                .attr('r', 0)
                .remove();
        }
    }

    return {
        initElevationRainfallScatterplot: initElevationRainfallScatterplot
    }
});
