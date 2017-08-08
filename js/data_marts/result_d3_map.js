import React from 'react';
import {
    form, Grid, Row, Col, Checkbox, Panel
} from 'react-bootstrap';
import 'd3';


var host = window.location.host;
var protocol = window.location.protocol;
var api_root = protocol + "//" + host + "/api/1.0";

var rainfall_low = "#a6bddb";
var rainfall_medium = "#3690c0";
var rainfall_high = "#023858";

var elevation_low = "#1a9850";
var elevation_medium = "#fdae61";
var elevation_high = "#d73027";

var current_rainfall_request = null;
var current_elevation_request = null;


function showPreloader() {
    document.getElementById('d3_map_preloader').style.display = 'inline';
}

function hidePreloader() {
    document.getElementById('d3_map_preloader').style.display = 'none';
};


export class D3Map extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            height: null,
            width: null,
            svg: null,
            projection: null,
            rainfall_checked: true,
            elevation_checked: false
        };
    };

    componentDidMount() {
        let height = $("#d3_map").height();
        let width = $("#d3_map").width()
        let svg = d3.select("#d3_map").append("svg")
            .attr("width", width)
            .attr("height", height);
        svg.append('path').attr("class", "polygon");
        this.setState({
            height: height,
            width: width,
            svg: svg
        });
        window.addEventListener(
            "process_end_event",
            this.handleProcessEndEvent.bind(this)
        );
        this.addRainfallLegend();
        this.addElevationLegend();
    };

    componentWillUnmount() {
        window.removeEventListener(
            "process_end_event",
            this.handleProcessEndEvent.bind(this)
        );
    };

    addRainfallLegend() {
        let height = $("#d3_rainfall_legend").height();
        let width = $("#d3_rainfall_legend").width()
        let svg = d3.select("#d3_rainfall_legend").append("svg")
            .attr("width", width)
            .attr("height", height);
        let scale = d3.scaleOrdinal()
            .domain([
                "Basse (< 1000 mm/an)",
                "Moyenne (>= 1000 mm/an et < 3000 mm/an)",
                "Haute (>= 3000 mm/an)"
            ])
            .range([rainfall_low, rainfall_medium, rainfall_high]);
        svg.append("g")
            .attr("class", "legendRainfall")
            .attr("opacity", 0.7)
            .attr("transform", "translate(0, 0)");
        let legend = d3.legendColor()
            .shapeWidth(30)
            .cells(3)
            .orient("vertical")
            .scale(scale);
        svg.select(".legendRainfall")
            .call(legend);
    }

    addElevationLegend() {
        let height = $("#d3_elevation_legend").height();
        let width = $("#d3_elevation_legend").width()
        let svg = d3.select("#d3_elevation_legend").append("svg")
            .attr("width", width)
            .attr("height", height);
        let scale = d3.scaleOrdinal()
            .domain([
                "Basse (< 500 m)",
                "Moyenne (>= 500 m et < 1000 m)",
                "Haute (>= 1000 m)"
            ])
            .range([elevation_low, elevation_medium, elevation_high]);
        svg.append("g")
            .attr("class", "legendElevation")
            .attr("opacity", 0.7)
            .attr("transform", "translate(0, 0)");
        let legend = d3.legendColor()
            .shapeWidth(30)
            .cells(3)
            .orient("vertical")
            .scale(scale);
        svg.select(".legendElevation")
            .call(legend);
    }

    handleProcessEndEvent(e) {
        showPreloader();
        let csrftoken = $.cookie('csrftoken');
        $.ajaxSetup({
            'beforeSend': function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        });
        let data = JSON.parse(e.selected_entity.geojson);
        let feature = data;
        if (data.features) {
            feature = data.features[0];
        }
        this.state.svg.selectAll('.rainfall_classes').remove();
        this.state.svg.selectAll('.elevation_classes').remove();
        this.updateMap(feature);
        let this_ = this;
        if(current_rainfall_request != null) {
            current_rainfall_request.abort();
        }
        current_rainfall_request = new window.XMLHttpRequest();
        current_rainfall_request = $.ajax({
            type: 'POST',
            data: {
                geojson: JSON.stringify(feature.geometry),
            },
            xhr : function(){
               return current_rainfall_request;
            },
            url: api_root + "/data_mart/rainfall_vector_classes/",
            success: function(result) {
                this_.addRainfallClasses(JSON.parse(result.geojson));
            }
        });
        if(current_elevation_request != null) {
            current_elevation_request.abort();
        }
        current_elevation_request = new window.XMLHttpRequest();
        $.ajax({
            type: 'POST',
            data: {
                geojson: JSON.stringify(feature.geometry),
            },
            xhr : function(){
               return current_elevation_request;
            },
            url: api_root + "/data_mart/elevation_vector_classes/",
            success: function(result) {
                this_.addElevationClasses(JSON.parse(result.geojson));
                hidePreloader();
            }
        });
    };

    updateMap(feature) {
        let bbox = d3.geoBounds(feature);
        let center = [
            bbox[0][0] + (bbox[1][0] - bbox[0][0]) / 2,
            bbox[0][1] + (bbox[1][1] - bbox[0][1]) / 2
        ]
        let height = this.state.height;
        let width = this.state.width;
        let svg = this.state.svg;
        let projection = d3.geoMercator();
        let scale = 150;
        let offset = [width / 2, height / 2];
        projection = d3.geoMercator()
            .scale(scale)
            .center(center)
            .translate(offset);
        let path = d3.geoPath()
            .projection(projection);
        let bounds = path.bounds(feature);
        let hscale = scale * width  / (bounds[1][0] - bounds[0][0]);
        let vscale = scale * height / (bounds[1][1] - bounds[0][1]);
        scale = (hscale < vscale) ? hscale : vscale;
        offset = [
            width / 2,
            height / 2
        ];
        // new projection
        projection = d3.geoMercator()
            .center(center)
            .scale(0.9 * scale)
            .translate(offset);
        path = path.projection(projection);
        this.setState({
            path: path
        });
        svg.selectAll('.polygon')
            .datum(feature)
            .attr('d', path);
    };

    addRainfallClasses(geojson) {
        let svg = this.state.svg;
        let path = this.state.path;
        let features = geojson.features;
        let this_ = this;
        svg.selectAll('.rainfall_classes').remove();
        svg.selectAll('.rainfall_classes')
            .data(features)
            .enter()
            .append("path")
            .attr("class", "rainfall_classes")
            .attr('d', path)
            .attr('fill', function(d) {
                let color = 'white';
                switch(d.properties.min_value) {
                    case 0:
                        color = rainfall_low;
                        break;
                    case 1000:
                        color = rainfall_medium;
                        break;
                    case 3000:
                        color = rainfall_high;
                        break;
                    default:
                        color = 'white';
                        break;
                }
                return color;
            });
        if (this.state.rainfall_checked) {
            svg.selectAll('.rainfall_classes')
                .attr('opacity', 0.6);
        } else {
            svg.selectAll('.rainfall_classes')
                .attr('opacity', 0);
        };
    };

    addElevationClasses(geojson) {
        let svg = this.state.svg;
        let path = this.state.path;
        let features = geojson.features;
        let this_ = this;
        svg.selectAll('.elevation_classes').remove();
        svg.selectAll('.elevation_classes')
            .data(features)
            .enter()
            .append("path")
            .attr("class", "elevation_classes")
            .attr('d', path)
            .attr('fill', function(d) {
                let color = 'white';
                switch(d.properties.min_value) {
                    case 0:
                        color = elevation_low;
                        break;
                    case 500:
                        color = elevation_medium;
                        break;
                    case 1000:
                        color = elevation_high;
                        break;
                    default:
                        color = 'white';
                        break;
                }
                return color;
            });
        if (this.state.elevation_checked) {
            svg.selectAll('.elevation_classes')
                .attr('opacity', 0.7);
        } else {
            svg.selectAll('.elevation_classes')
                .attr('opacity', 0);
        };
    };

    handleRainfallCheckboxChanged(e) {
        let svg = this.state.svg;
        if (e.target.checked) {
            svg.selectAll('.rainfall_classes')
                .attr('opacity', 0.6);
        } else {
            svg.selectAll('.rainfall_classes')
                .attr('opacity', 0);
        };
        this.setState({
            rainfall_checked: e.target.checked
        })
    }

    handleElevationCheckboxChanged(e) {
        let svg = this.state.svg;
        if (e.target.checked) {
            svg.selectAll('.elevation_classes')
                .attr('opacity', 0.7);
        } else {
            svg.selectAll('.elevation_classes')
                .attr('opacity', 0);
        };
        this.setState({
            elevation_checked: e.target.checked
        })
    }

    render() {
        return (
          <Grid>
            <img id={"d3_map_preloader"} src={window.preloader_url}/>
            <Row>
              <Col xs={5} md={3}>
                <Checkbox checked={this.state.rainfall_checked}
                          onChange={this.handleRainfallCheckboxChanged.bind(this)}>
                  Pluviométrie
                </Checkbox>
                <div id={"d3_rainfall_legend"}>
                </div>
                <Checkbox checked={this.state.elevation_checked}
                          onChange={this.handleElevationCheckboxChanged.bind(this)}>
                  Altitude
                </Checkbox>
                <div id={"d3_elevation_legend"}>
                </div>
              </Col>
              <Col xs={7} md={9}>
                <div id={"d3_map"}>
                </div>
              </Col>
            </Row>
          </Grid>
        );
    }

}
