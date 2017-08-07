import React from 'react';
import 'd3';


export class D3Map extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            height: null,
            width: null,
            svg: null
        };
    };

    componentDidMount() {
        let height = $("#d3_map").height();
        let width = $("#d3_map").width()
        let svg = d3.select("#d3_map").append("svg")
            .attr("width", width)
            .attr("height", height);
        svg.append('path');
        this.setState({
            height: height,
            width: width,
            svg: svg
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
        this.updateMap(e.selected_entity.geojson);
    };

    updateMap(geojson) {
        let data = JSON.parse(geojson);
        let feature = data;
        if (data.features) {
            feature = data.features[0];
        }
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
        svg.selectAll('path')
            .datum(feature)
            .attr("class", "land")
            .attr('d', path);
    };

    render() {
        return (
            <div id={"d3_map"}>
            </div>
        );
    }

}
