import React from 'react';
import 'd3';


var min_elevation = 0,
    max_elevation = 1628,
    min_rainfall = 290,
    max_rainfall = 4820;


function kde(gridPoint, xy_points, h, h2) {
    return d3.mean(
        xy_points,
        function(p) {
            return gaussian(norm(p, gridPoint) / h) ;
        }
    ) / h2;
}


// Norm of 2D arrays/vectors
function norm(v1, v2) {
    return Math.sqrt(
        (v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1])
    );
}


function gaussian(x) {
  // sqrt(2 * PI) is approximately 2.5066
  return Math.exp(-x * x / 2) / 2.5066;
}


export class D3HeatMap extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            height: null,
            width: null,
            svg: null
        };
    };

    componentDidMount() {
        let full_height = $("#d3_heatmap").height();
        let full_width = $("#d3_heatmap").width();

        let margin = {
            top: 10,
            right: 10,
            bottom: 35,
            left: 70
        };

        let height = full_height - margin.top - margin.bottom;
        let width = full_width - margin.left - margin.right;

        let canvas = d3.select("#d3_heatmap").append("canvas")
            .attr("width", width)
            .attr("height", height)
            .style("position", "absolute")
            .style("left", margin.left + "px")
            .style("top", (margin.top + 41) + "px")
            .style("opacity", 0.75);

        let context = canvas.node().getContext("2d");

        let svg = d3.select("#d3_heatmap").append("svg")
            .attr("width", full_width)
            .attr("height", full_height);

        let g = svg.append('g')
            .attr("transform", "translate(" + margin.left +
                  "," + margin.top + ")");

        let x = d3.scaleLinear()
            .domain([min_elevation, max_elevation])
            .range([0, width]);

        let y = d3.scaleLinear()
            .domain([min_rainfall, max_rainfall])
            .range([height, 0]);

        // X Axis
        let xAxis = svg.append('g')
            .attr("transform", "translate(" + margin.left +
                  "," + (height + margin.top) + ")");
        xAxis.call(d3.axisBottom(x));

        // Y Axis
        let yAxis = svg.append('g')
            .attr("transform", "translate(" + margin.left +
                  "," + margin.top + ")");;
        yAxis.call(d3.axisLeft(y));

        // X Axis label
        svg.append("text")
            .attr("transform", "translate("
                + (full_width / 2) + " ,"
                + (full_height) + ")")
            .style("text-anchor", "middle")
            .text("Altitude (m)");

        // Y Axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left - 63)
            .attr("x", 0 - (full_height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Précipitations (mm/an)");

        this.setState({
            height: height,
            width: width,
            margin: margin,
            svg: svg,
            canvas: canvas,
            context: context
        });
        window.addEventListener(
            "process_end_event",
            this.handleProcessEndEvent.bind(this)
        );
    };

    componentWillUnmount() {
        window.removeEventListener(
            "process_end_event",
            this.handleProcessEndEvent.bind(this)
        );
    };

    handleProcessEndEvent(e) {
        return;
        this.updateHeatMap({});
    };

    updateHeatMap(data) {

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
    };

    render() {
        return (
            <div id={"d3_heatmap"}>
            </div>
        );
    }

}
