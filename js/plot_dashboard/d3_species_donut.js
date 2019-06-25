import 'd3';

var color = [
    "#5496c4", "#ffd24d", "#a29cc9", "#f96353", "#6cc6b7",
    "#fcac4f", "#a0d643", "#f99fcd", "#b068b1", "#b3b3b3"
];

var total = 0;

export function initSpeciesDonut() {

    var height = $("#species_donut").height();
    var width = $("#species_donut").width();
    var radius = Math.min(width, height) / 2;

    var svg = d3.select("#species_donut").append("svg")
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
        .attr("id", "donut_tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data);
    });

    function updateData(plot_data) {
        var data = plot_data['species_distribution'];
        total = plot_data['nb_occurrences_identified_specie'];
        /* ------- PIE SLICES -------*/

        var slice = svg.select(".slices")
            .selectAll("path.slice")
            .data(pie(data));

        slice.enter()
            .insert("path")
            .style("fill", function(d, i) { return color[i]; })
            .style("opacity", "0.7")
            .attr("class", "slice")
            .on('mouseover', function(d, i) {
                d3.select(this).style("opacity", "1.0");
                var html = "<p><strong>" + d.data[0] + "</strong></p>";
                html += "<p>" + parseFloat(100 * ((d.data[1]) / total)).toFixed(1) + "%</p>"
                tooltip.transition()
                    .duration(300)
                    .style("opacity", .9);
                tooltip.html(html);
            })
            .on('mouseout', function(d) {
                d3.select(this).style("opacity", "0.7");
                tooltip.transition()
                    .duration(300)
                    .style("opacity", 0);
            })
            .on('mousemove', function(d) {
                var w = $("#donut_tooltip").width();
                var h = $("#donut_tooltip").height();
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
