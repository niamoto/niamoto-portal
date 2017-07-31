import React from 'react';
import ol from 'openlayers';


export class Map extends React.Component {

    constructor (props) {
        super(props)
        this.map = props.map;
        this.target = props.target;
    }

    componentDidMount () {
        this.map.setTarget(this.target)
    }

    componentWillUnmount () {
        this.map.setTarget(undefined)
    }

    render () {
        return (
            <div id={this.target}>
            </div>
        )
    }

}


export function getDefaultMap() {
    /**
     * Return a ol map centered in New-Caledonia with Georep's aerial
     * images as the base layer, and a zoom control.
     */
    var wms_url = 'http://carto.gouv.nc/arcgis/services/fond_imagerie/'
                  + 'MapServer/WMSServer';
    var view = new ol.View({
        projection: 'EPSG:4326',
        center: new ol.proj.transform([165.875, -21.145],
                                      'EPSG:4326',
                                      'EPSG:4326'),
        zoom: 7.5
    });
    var attribution = new ol.control.Attribution({
        collapsible: false
    });
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: wms_url,
                    params: {
                        LAYERS: '0',
                        FORMAT: 'image/png',
                    },
                    serverType: 'mapserver',
                    attributions: [
                        new ol.Attribution({
                            html: '<a href="http://georep.nc/">Géorep</a> '
                                + '- <em>Gouvernement de la '
                                + 'Nouvelle-Calédonie</em>'
                        })
                    ]
                })
            })
        ],
        view: view,
        controls: [
            new ol.control.Zoom(),
            attribution
        ]
    });
    return map;
};


export function getPolygonArea(map, polygon) {
    /**
    * From http://openlayers.org/en/latest/examples/measure.html?q=measure
    */
    var area;
    var wgs84Sphere = new ol.Sphere(6378137);
    var sourceProj = map.getView().getProjection();
    var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(
        sourceProj, 'EPSG:4326')
    );
    var coordinates = geom.getLinearRing(0).getCoordinates();
    area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
    return Math.round(area / 1000000);
};
