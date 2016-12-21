define([
    'jquery',
    'd3'
], function($, d3) {

    function initDiametersHistogram() {

        var height = $("#diameters_histogram").height();
        var width = $("#diameters_histogram").width();
        var margin = {
            top: height * 0.01,
            right: width * 0.1,
            bottom: height * 0.1,
            left: width * 0.1
        };
        var mheight = height - margin.top - margin.bottom;
        var mwidth = width - margin.left - margin.right;

        var svg = d3.select("#diameters_histogram").append("svg")
            .attr("width", width)
            .attr("height", height);

        var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var x_axis = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + (mheight + margin.top) + ")");
        var y_axis = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        $('#plot_treeview').on('plotSelected', function (event, data) {
            updateData(data);
        });

        function updateData(plot_data) {
            var data = plot_data['dbh_classification'][1];
            var bins = plot_data['dbh_classification'][0];

            var x = d3.scaleLinear()
                .domain([0, d3.max(bins)])
                .range([0, mwidth]);
            var y = d3.scaleLinear()
                .domain([0, d3.max(data)])
                .range([mheight, 0]);

            var rects = g.selectAll('rect')
                .data(data);

            rects.enter()
                .append("rect")
                .attr("x", function (d, i) {
                    return x(bins[i]) + x(bins[i + 1] - bins[i]) * 0.1;
                })
                .attr("transform", function(d) {
                    return "translate(" + 0 + "," + mheight + ")";
                })
                .attr("width", function (d, i) {
                    return x(bins[i + 1] - bins[i]) * 0.8;
                })
                .attr("height", function (d, i) {
                    return 0;
                })
                .transition()
                .duration(500)
                .duration(500)
                .attr("transform", function(d) {
                    return "translate(" + 0 + "," + y(d) + ")";
                })
                .attr("height", function (d, i) {
                    return mheight - y(d);
                });

            rects.transition()
                .duration(500)
                .attr("x", function (d, i) {
                    return x(bins[i]) + x(bins[i + 1] - bins[i]) * 0.1;
                })
                .attr("transform", function(d) {
                    return "translate(" + 0 + "," + y(d) + ")";
                })
                .attr("width", function (d, i) {
                    return x(bins[i + 1] - bins[i]) * 0.8;
                })
                .attr("height", function (d, i) {
                    return mheight - y(d);
                });

            rects.exit()
                .transition()
                .duration(500)
                .remove();


            // add the x Axis
            x_axis.call(
                d3.axisBottom(x)
                    .tickArguments([5, 's'])
            );

            // add the y Axis
            y_axis.call(
                d3.axisLeft(y)
                    .ticks(5)
            );

        };
    }
        return {
            initDiametersHistogram: initDiametersHistogram
        }
});
