import 'd3';

var color = [
    "#5496c4", "#ffd24d", "#a29cc9", "#f96353", "#6cc6b7",
    "#fcac4f", "#a0d643", "#f99fcd", "#b068b1", "#b3b3b3","#000000"
].reverse();

var total = 0;
var x_max_value = 80;
var x_max_value_text = 20;

export function initSpeciesDonut(path_class) {

    var height = $(path_class).height();
    var width = $(path_class).width();
    var radius = Math.min(width, height) / 2;

    var margin = {
        top: height * 0.08,
        right: width * 0.07,
        bottom: height * 0.19,
        left: width * 0.40
    };
    var mheight = height - margin.top - margin.bottom;
    var mwidth = width - margin.left - margin.right;

    var svg = d3.select(path_class).append("svg")
        .attr("width", width)
        .attr("height", height);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var x_axis = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + margin.left + "," + (mheight + margin.top) + ")");
    var y_axis = svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Label Y
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr("y", 5)
        .attr('x', 0 - height * .5)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text("Espèces");

    // Label X
    svg.append('text')
        .attr("y",  height * .92)
        .attr('x', width * .65 )
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text("Pourcentage du peuplement (%)");

    // var tooltip = d3.select("#page-wrapper").append("div")
    //     .attr("id", "donut_tooltip")
    //     .attr("class", "tooltip")
    //     .style("opacity", 0);

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data);
    });

    function updateData(plot_data) {
        var data = plot_data['species_distribution'].reverse();
        total = plot_data['nb_occurrences_identified_specie'];
    

        // varible of function selection value
        const xValue = d => (d[1]*100/total);
        const yValue = d => d[0];


        var yScale = d3.scaleBand()
            .domain(data.map(yValue))
            .range ([0, mheight])
            .padding(0.2);
        var xScale = d3.scaleLinear()
            .domain([0, x_max_value])
            .range ([0, mwidth]);

        svg.selectAll('.xAxis')
            .call(d3.axisBottom(xScale));
            
        svg.select('.yAxis')
            .call(d3.axisLeft(yScale))


        var rects = g.selectAll('rect').data(data);
        var texts = g.selectAll('text').data(data);

        rects.enter().append('rect')
            .style("fill",  (d, i) => color[i])
            // .style('opacity', 0.8)
            .attr('y', d => yScale(yValue(d)))
            .attr('width', d => xScale(xValue(d)))
            .attr('height', yScale.bandwidth());

        rects.transition()
            .duration(500)
            .attr("y", d => yScale(yValue(d)))
            .attr("width", d => xScale(xValue(d)))
            .attr("height", yScale.bandwidth());

        rects.exit()
            .transition()
            .duration(500)
            .remove();

        texts.enter().append("text")
            .attr("class", "label")
            .attr("x", function(d) {
                if (xValue(d) > x_max_value_text) {
                    return xScale(xValue(d)) - (xValue(d).toFixed(1) + "%").length*10;
                }
                else {
                    return xScale(xValue(d)) + 10;
                }
            })
            .attr("y", d => yScale(yValue(d)) + yScale.bandwidth() *.5)
            .attr("dy", ".5em")
            .attr("dx", ".5em")
            .style("text-anchor", "start")
            .text( d => xValue(d).toFixed(1) + "%")
            .attr("font-family", "sans-serif")
            .attr("fill", function(d) {
                if (xValue(d) > x_max_value_text) {
                    return "white";
                }
            })
            .transition()
            .duration(500);

        texts.transition().duration(500)
            .attr("x", function(d) {
                if (xValue(d) > x_max_value_text) {
                    return xScale(xValue(d)) - (xValue(d).toFixed(1) + "%").length*10 ;
                }
                else {
                    return xScale(xValue(d)) + 10;
                }
            })
            .attr("y", d => yScale(yValue(d)) + yScale.bandwidth() *.5)
            .text( d => xValue(d).toFixed(1) + "%")
            .attr("fill", function(d) {
                if (xValue(d) > x_max_value_text) {
                    return "white";
                }
        });

        texts.exit()
            .transition()
            .duration(500)
            .remove();

    };
};
