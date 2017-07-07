import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {
    Map, getDefaultMap
} from '../niamoto_base_map';


var map = getDefaultMap();
var features = new ol.Collection();
var source = new ol.source.Vector({features: features});
var vector = new ol.layer.Vector({
    source: source
});
var draw = new ol.interaction.Draw({
    source: source,
    type: "Polygon"
})
var modify = new ol.interaction.Modify({
  features: features,
});
draw.on('drawstart', (event) => {
    source.clear();
})
map.addLayer(vector);
map.addInteraction(draw);
map.addInteraction(modify);


function App() {
    return (
        <Map map={map} target={'map'}/>
    )
}

ReactDOM.render(
  <App />,
  document.getElementById('react')
);
