import 'd3';

export function initBarh() {
    
    const color = ['#306f64', '#5ebaa8', '#00b050', '#00ff00'];

    const height = $("#strate_barh").height();
    const width = $("#strate_barh").width();
    const margin = {
        top: height * 0.08,
        right: width * 0.07,
        bottom: height * 0.19,
        left: width * 0.10
    };
    const mheight = height - margin.top - margin.bottom;
    const mwidth = width - margin.left - margin.right;

    const svg = d3.select("#strate_barh").append("svg")
                  .attr("width", width)
                  .attr("height", height);

    const x_domain = [0, 100];
    const y_domain = ['Sous-bois','Sous-canopée','Canopée','Emergent'];

    const xScale = d3.scaleLinear()
                     .domain(x_domain)
                     .range([0, mwidth]);
    const yScale = d3.scaleBand()
                     .domain(y_domain)
                     .range([mheight, 0])
                     .padding(.1);

    // x and y axis
    var xAxis = d3.axisBottom(xScale)
                  .ticks(10);
    var yAxis = d3.axisLeft(yScale)
                  .tickSize(0);

    const g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g")
       .attr("transform", "translate(" + margin.left + "," + (mheight + margin.top) + ")")
       .attr("class", "xAxis")
       .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(customYAxis);

    const tooltip = d3.select("#page-wrapper").append("div")
        .attr("id", "strates_tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // x axis label
    svg.append("text")
        .attr("transform", "translate(" +
            (width / 2) + " ," +
            (height - 15) + ")")
        .style("text-anchor", "middle")
        .text("Pourcentage du peuplement (%)");

    // Update Data for trigger
    $('#plot_select').on('plotSelected', function (event, data) {
        updateData(data);
    });

    function customYAxis(g) {
        g.attr("class", "yAxis")
        g.call(yAxis);
        g.select(".domain").remove();
        g.selectAll(".tick text").remove();
    }

    function updateData(plot_data) {

        const total_living = plot_data['plot']['properties']['living_stems'];
        const emergent     = plot_data['plot']['properties']['emergent']/total_living*100;
        const canopy       = plot_data['plot']['properties']['canopy']/total_living*100;
        const under_canopy = plot_data['plot']['properties']['undercanopy']/total_living*100;
        const under_storey = plot_data['plot']['properties']['understorey']/total_living*100;

        const tbl_data = [under_storey,under_canopy, canopy, emergent];
        
        // make table of object for symply use
        var data = [];
        for (var i = 0; i < tbl_data.length; i++ ){
            data[i] = {"label":y_domain[i],
                       "value":tbl_data[i],
                       "color":color[i]};
        }



        var rect = g.selectAll("rect")
                    .data(data);
        var texts = g.selectAll("text")
                    .data(data);


        rect.enter().append("rect")
            .attr("class", "rect")
            .style("fill", d => d.color)
            .style("opacity", "0.8")
            .attr("width", d => xScale(d.value))
            .attr("y", d => yScale(d.label))
            .attr("height", yScale.bandwidth())
            .attr("rx", 2)
            .attr("ry", 2)
            .transition()
                .duration(500);

        rect.transition()
            .duration(500)
            .attr("y", d => yScale(d.label))
            .attr("width", d => xScale(d.value))
            .attr("height", yScale.bandwidth());

        rect.exit()
            .transition()
            .duration(500)
            .remove();


        
        texts.enter().append("text")
            .attr("class", "label")
            .attr("x", function(d) {
            if (d.value > 70) {
                return xScale(d.value) *.5;
            }
            else {
                return xScale(d.value) + 10;
            }
            })
            .attr("y", d => yScale(d.label) + yScale.bandwidth() *.5)
            .attr("dy", ".5em")
            .attr("dx", ".5em")
            .style("text-anchor", "start")
            .text( d => d.label)
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", function(d) {
                if (d.value > 70) {
                    return "white";
                }
            })
            .transition()
            .duration(500);

        texts.transition().duration(500)
        .attr("x", function(d) {
            if (d.value > 70) {
                return xScale(d.value) *.5;
            }
            else {
                return xScale(d.value) + 10;
            }
        })
        .attr("y", d => yScale(d.label) + yScale.bandwidth() *.5)
        .text( d => d.label)
        .attr("fill", function(d) {
            if (d.value > 70) {
                return "white";
            }
        });

        texts.exit()
            .transition()
            .duration(500)
            .remove();
    };  
};