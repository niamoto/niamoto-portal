import 'd3';

export function initDiametersHistogram() {

    var height = $("#distribution_dbh_widget").height();
    var width = $("#distribution_dbh_widget").width();
    var margin = {
        top: height * 0.08,
        right: width * 0.07,
        bottom: height * 0.19,
        left: width * 0.10
    };
    var mheight = height - margin.top - margin.bottom;
    var mwidth = width - margin.left - margin.right;

    var svg = d3.select("#distribution_dbh_widget").append("svg")
        .attr("width", width)
        .attr("height", height);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var x_axis = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (mheight + margin.top) + ")");
    var y_axis = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("#page-wrapper").append("div")
        .attr("id", "diameters_tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var x_domain = [Math.floor(0/10)*10, Math.ceil(130/10)*10];
    var y_domain = [0, 100];

    // x and y axis
    x_axis.call(
        d3.axisBottom(
            d3.scaleLinear()
                .range([0, mwidth])
                .domain(x_domain)
        ).ticks(10)
    );
    y_axis.call(
        d3.axisLeft(
            d3.scaleLinear()
                .range([mheight, 0])
                .domain(y_domain)
        ).ticks(5)
    );

    // x axis label
    svg.append("text")
        .attr("transform", "translate("
            + (width / 2) + " ,"
            + (height - 15) + ")")
        .style("text-anchor", "middle")
        .text("dbh (cm)");

    // y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 50)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Fréquence (%)");

    // Update Data for trigger
    $('#taxon_treeview').on('taxonSelected', function (event, data) {
        updateData(data);
    });

    function updateData(taxon_data) {
        var data = taxon_data['dbh_class'][1];
        var bins = taxon_data['dbh_class'][0];
        var x = d3.scaleLinear()
            .domain(x_domain)
            .range([0, mwidth]);
        var y = d3.scaleLinear()
            .domain(y_domain)
            .range([mheight, 0]);

        var rects = g.selectAll('rect')
            .data(data);

        rects.enter()
            .append("rect")
            .attr("x", (d, i) => x(bins[i]))
            .style("fill", "#70af3f")
            .style("opacity", "0.8")
            .style("stroke", "white")
            .attr("transform", d => "translate(" + 0 + "," + mheight + ")")
            .attr("width", (d, i) => Math.abs(x(bins[i + 1] - bins[i])))
            .attr("height",(d, i) => 0)
            .on('mouseover', function(d, i) {
                d3.select(this).style("opacity", "1.0");
                var html = "<p><strong>[ " + bins[i] + "cm, "
                    + bins[i + 1] + "cm [</strong></p><p>"
                    + parseFloat(d) + "%</p>";
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
                var w = $("#diameters_tooltip").width();
                var h = $("#diameters_tooltip").height();
                tooltip.style("left", (d3.event.pageX - w / 2 - 15) + "px")
                    .style("top", (d3.event.pageY - h - 25) + "px");
            })
            .transition()
            .duration(500)
            .duration(500)
            .attr("transform", d => "translate(" + 0 + "," + y(d) + ")")
            .attr("height", (d, i) => mheight - y(d));

        rects.transition()
            .duration(500)
            .attr("x", (d, i) => x(bins[i]))
            .attr("transform", d => "translate(" + 0 + "," + y(d) + ")")
            .attr("width", (d, i) => Math.abs(x(bins[i + 1] - bins[i])))
            .attr("height", (d, i) => mheight - y(d))

        rects.exit()
            .transition()
            .duration(500)
            .remove();
    };
};
