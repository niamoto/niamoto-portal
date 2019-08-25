import 'd3';

export function initStems() {
    
    const color = ['#ff0000', '#92d050'];

    const height = $("#stems_barv").height();
    const width = $("#stems_barv").width();
    const margin = {
        top: height * 0.08,
        right: width * 0.07,
        bottom: height * 0.19,
        left: width * 0.10
    };
    const mheight = height - margin.top - margin.bottom;
    const mwidth = width - margin.left - margin.right;

    const svg = d3.select("#stems_barv").append("svg")
                  .attr("width", width)
                  .attr("height", height);

    const label = ["tiges mortes", "tiges vivantes"];
    const y_domain = [0, 100];

    const yScale = d3.scaleLinear()
                     .domain(y_domain)
                     .range([mheight, 0])

    // x and y axis
    var yAxis = d3.axisLeft(yScale)
                  .tickFormat(d => d + "%")
                  .tickSizeInner(-mwidth *.6)
                  .tickPadding(10)
                  .ticks(10);

    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(customYAxis);

    const g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // tooltip
    // const tooltip = d3.select("#stems_barv").append("div")
    //     .attr("id", "strates_tooltip")
    //     .attr("class", "tooltip")
    //     .style("left", width*.65 +"px"  )
    //     .style("top", height *.75  + "px")
    //     .style("opacity", 0);

    // x axis label
    svg.append("text")
        .attr("transform", "translate(" +
            (width / 2) + " ," +
            (height - 15) + ")")
        .style("text-anchor", "middle")
        .text("Tige");

    // Legend
    svg.append("g")
           .attr("class", "legend")
           .attr("transform", "translate(" + width *.65 + ", " + height *.15 + ")")


    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data);
    });

    function customYAxis(g) {
        g.attr("class", "yAxis")
        g.call(yAxis);
    }

    function updateData(plot_data) {

        const total_stems = plot_data['plot']['properties']['total_stems'];
        const living_stems = plot_data['plot']['properties']['living_stems']  *100 / total_stems;
        const dead_stems = (total_stems - plot_data['plot']['properties']['living_stems'])  *100 / total_stems;
        
        // Round one decimal
        const tbl_data = [dead_stems.toFixed(1), living_stems.toFixed(1)];
        
        // make table of object for symply use
        var data = [];
        var data_legend = [];
        for (var i = 0; i < tbl_data.length; i++ ){
            data_legend[i] = label[i] + " " + tbl_data[i] + "%"
            data[i] = {"label":label[i],
                       "value":tbl_data[i],
                       "color":color[i]};
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

        // Rectangle

        var rect = g.selectAll("rect")
            .data(data);

        rect.enter().append("rect")
            .attr("class", "rect")
            .style("fill", d => d.color)
            .style("opacity", "1")
            .attr("width", mwidth *.2)
            .attr('x', mwidth *.2)
            .attr("y", function(d, i) {
                if (i != 0){
                    return yScale(d.value);
                }
                else{
                    return 0;
                }
            })
            .attr("height",function(d, i) {
                    return yScale(100-d.value);
            })
            // .on('mouseover', handleMouseOver)
            // .on('mouseout', handleMouseOut)
            .transition()
                .duration(500)

        rect.transition()
            .duration(500)
            .attr("y", function(d, i) {
                if (i != 0){
                    return yScale(d.value);
                }
                else{
                    return 0;
                }
            })
            .attr("height",function(d, i) {
                    return yScale(100-d.value);
            })

        rect.exit()
            .transition()
            .duration(500)
            .remove();

        // function handleMouseOver(d) {
        //     var rect_select = d3.select(this);
        //     rect_select.style("stroke", "#4f4f4f");
        //     rect_select.style("stroke-width", 2);
        //     var html = "<p><strong>" + d.label + "</p><p>"
        //         + parseFloat(d.value) + "%</p>";
        //     tooltip.transition()
        //         .duration(300)
        //         .style("opacity", .9)
        //     tooltip.html(html)
        // };

        // function handleMouseOut(d) {
        //     var rect_select = d3.select(this);
        //     rect_select.style("stroke-width", 0);
        //     tooltip.transition()
        //         .duration(300)
        //         .style("opacity", 0);
        // };


        


    }
 
};