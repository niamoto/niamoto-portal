import 'd3';

var color = [
    "#ed7d31", "#a5a5a5", "#5b9bd5", "#ffc000"
];
var label = [
    "palmiers", "fougères", "arbres", "lianes"
]
var total = 0;

export function initTypePlantDonut(path_class) {

    var height = $(path_class).height();
    var width = $(path_class).width();
    var radius = Math.min(width, height) / 2;

    var svg = d3.select(path_class).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    var donut = svg.append("g")
        .attr("class", "donut")
        .attr("transform", "translate(" + width / 3 + "," + height / 2 + ")");

    donut.append("g")
        .attr("class", "slices");
    donut.append("g")
        .attr("class", "labels");
    donut.append("g")
        .attr("class", "lines");

    var pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d[1];
        });

    var arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    // Legend
    svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + width * .65 + ", " + height * .15 + ")")

    var tooltip = d3.select("#page-wrapper").append("div")
        .attr("id", "donut_tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data);
    });

    function updateData(plot_data) {

        const stems = plot_data['plot']['properties']['total_stems'];
        const palms = plot_data['plot']['properties']['palms'];
        const lianas = plot_data['plot']['properties']['lianas'];
        const ferns = plot_data['plot']['properties']['ferns'];

        total = stems + palms + lianas + ferns;

        const tbl_data = [palms, ferns, stems, lianas];

        // make table of object for symply use
        var data = [];
        var data_legend = [];
        for (var i = 0; i < tbl_data.length; i++) {
            data_legend[i] = label[i] + " " +
                parseFloat(100 * (tbl_data[i] / total)).toFixed(1) +
                "%"
            data[i] = [label[i], tbl_data[i], color[i]];
        }

        //Legend
        var colorScale = d3.scaleOrdinal()
        .domain(data_legend)
        .range(color);

        var legendColor = d3.legendColor()
            .shapePadding(5)
            .scale(colorScale);

        svg.select(".legend")
            .call(legendColor);

        /* ------- PIE SLICES -------*/

        var slice = donut.select(".slices")
            .selectAll("path.slice")
            .data(pie(data));

        slice.enter()
            .insert("path")
            .style("fill", d => d.data[2])
            .attr("class", "slice")
            .attr("id", (d, i) => d.data[0] + " " + d.data[1])
            .transition()
            .duration(1000)
            .attrTween("d", function (d) {
                this._current = {
                    endAngle: 2 * Math.PI,
                    index: 0,
                    padAngle: 0,
                    startAngle: 2 * Math.PI,
                    value: null
                };
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    return arc(interpolate(t));
                };
            });

        slice.transition()
            .duration(1000)
            .attrTween("d", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    return arc(interpolate(t));
                };
            });

        slice.exit()
            .transition()
            .duration(1000)
            .attrTween("d", function (d) {
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
                return function (t) {
                    return arc(interpolate(t));
                };
            })
            .remove();


    };
};