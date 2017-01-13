define([
    'jquery',
    'd3'
], function($, d3) {

    var color = [
        "#5496c4", "#ffd24d", "#a29cc9", "#f96353", "#6cc6b7",
        "#fcac4f", "#a0d643", "#f99fcd", "#b068b1", "#b3b3b3"
    ];

    var sorted_distribution = [];
    var total = 0;
    var map_color = {};

    function buildSortedDistribution(taxon_data) {
        var data = taxon_data['taxon_distribution'];
        total = taxon_data['nb_occurrences'];
        // Sort data and retain only 10 categories
        data.sort(function(a, b) {
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;
            return 0;
        });
        data.reverse();
        if (data.length > 10) {
            var others = ['Autres', 0, []];
            for (var i = 9; i < data.length; i++) {
                var j = data[i];
                others[1] += j[1];
                others[2].push(j[0]);
            }
            data = data.slice(0, 9);
            data.push(others);
        }
        var _map_color = {};
        for (var i = 0; i < data.length; i++) {
            _map_color[data[i][0]] = color[i];
        }
        map_color = _map_color;
        sorted_distribution = data;
    };

    function initDonutChart() {

        var height = $("#taxon_proportions_widget").height();
        var width = $("#taxon_proportions_widget").width();
        var radius = Math.min(width, height) / 2;

        var svg = d3.select("#taxon_proportions_widget").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g");

            svg.append("g")
                .attr("class", "slices");
            svg.append("g")
                .attr("class", "labels");
            svg.append("g").
                attr("class", "lines");

        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var pie = d3.pie()
            .sort(null)
            .value(function(d) {
                return d[1];
            });

        var arc = d3.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4);

        var tooltip = d3.select("#page-wrapper").append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);

        $('#taxon_treeview').on('taxonSelected', function (event, data) {
            buildSortedDistribution(data);
            updateData(data);
        });

        function updateData(taxon_data) {
            var data = sorted_distribution;

            /* ------- PIE SLICES -------*/

            var slice = svg.select(".slices")
                .selectAll("path.slice")
                .data(pie(data));

            slice.enter()
                .insert("path")
                .style("fill", function(d, i) { return color[i]; })
                .style("opacity", "0.8")
                .attr("class", "slice")
                .on('mouseover', function(d) {
                    d3.select(this).style("opacity", "1.0");
                    var html = "<p><strong>" + d.data[0] + "</strong></p>";
                    html += "<p>" + parseFloat(100 * ((d.data[1]) / total)).toFixed(2) + "%</p>"
                    tooltip.transition()
                        .duration(300)
                        .style("opacity", .9);
                    tooltip.html(html);
                })
                .on('mouseout', function(d) {
                    d3.select(this).style("opacity", "0.8");
                    tooltip.transition()
                        .duration(300)
                        .style("opacity", 0);
                })
                .on('mousemove', function(d) {
                    var w = $("#tooltip").width();
                    var h = $("#tooltip").height();
                    tooltip.style("left", (d3.event.pageX - w / 2 - 15) + "px")
                    .style("top", (d3.event.pageY - h - 25) + "px");
                })
                .transition()
                .duration(1000)
                .attrTween("d", function(d) {
                    this._current = {
                        endAngle: 2 * Math.PI,
                        index: 0,
                        padAngle: 0,
                        startAngle: 2 * Math.PI,
                        value: null
                    };
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });

            slice.transition()
                .duration(1000)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });

            slice.exit()
                .transition()
                .duration(1000)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var dest = {
                        endAngle: this._current.endAngle,
                        index: 0,
                        padAngle: 0,
                        startAngle: this._current.endAngle,
                        value: null
                    };
                    var interpolate = d3.interpolate(this._current, dest);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                })
                .remove();
        };
    };

    return {
        initDonutChart: initDonutChart
    }
});
