import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {
    Map, getDefaultMap
} from '../niamoto_base_map';
import {
    form, Grid, Row, Col, FormGroup, ControlLabel, FormControl,
    HelpBlock, option, Panel
} from 'react-bootstrap';

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


function FieldGroup({ id, label, help, ...props }) {
    return (
        <FormGroup controlId={id}>
          <ControlLabel>{label}</ControlLabel>
          <FormControl {...props} />
          {help && <HelpBlock>{help}</HelpBlock>}
        </FormGroup>
    );
}


function App() {
    return (
        <Grid>
          <Panel>
            <Row>
              <Col xs={6} md={4}>
                <p>
                  Sélectionnez une zone à analyser. Vous pouvez la
                  dessiner sur la carte, charger un shapefile, ou bien
                  sélectionner une entité dans les listes déroulantes.
                </p><br/>
                <form>
                  <FieldGroup
                    id="formControlsFile"
                    type="file"
                    label="Charger un shapefile"
                  />
                  <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Sélectionner un massif</ControlLabel>
                    <FormControl componentClass="select" placeholder="select">
                    </FormControl>
                  </FormGroup>
                  <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Sélectionner une province</ControlLabel>
                    <FormControl componentClass="select" placeholder="select">
                    </FormControl>
                  </FormGroup>
                  <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Sélectionner une commune</ControlLabel>
                    <FormControl componentClass="select" placeholder="select">
                    </FormControl>
                  </FormGroup>
                </form>
              </Col>
              <Col xs={6} md={8}>
                <Map map={map} target={'map'}/>
              </Col>
            </Row>
          </Panel>
        </Grid>
    )
}

ReactDOM.render(
  <App />,
  document.getElementById('react')
);
