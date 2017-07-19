import React from 'react';
import ReactDOM from 'react-dom';
import {
    form, Grid, Row, Col, FormGroup, ControlLabel, FormControl,
    HelpBlock, option, Panel
} from 'react-bootstrap';
import ol from 'openlayers';
import {
    Map, getDefaultMap
} from '../niamoto_base_map';


var host = window.location.host;
var protocol = window.location.protocol;
var api_root = protocol + "//" + host + "/api/1.0";


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
draw.on('drawend', (event) => {
    source.clear();
    modify.setActive(true);
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

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            massif_id: 0,
            province_id: 0,
            commune_id: 0
        }
    }

    fillProvinceSelect() {
        let items = [];
        items.push(<option key={null} value={null}>{null}</option>);
        let provinces = this.props.provinces;
        for (let i = 0; i < provinces.length; i++) {
            let v = provinces[i];
            items.push(<option key={v[1]} value={v[0]}>{v[1]}</option>);
        }
        return items;
    }

    onProvinceSelected(e) {
        this.setState({
            province_id: e.target.value
        });
        if (!e.target.value) {
            return;
        } else {
            this.setState({
                massif_id: 0,
                commune_id: 0
            });
        }
        $.ajax({
            type: 'GET',
            data: {},
            url: api_root + "/data_mart/province_dimension/" + e.target.value,
            success: function(result) {
                source.clear();
                source.addFeatures(
                    (new ol.format.GeoJSON()).readFeatures(result)
                );
                modify.setActive(false);
            }
        });
    }

    onCommuneSelected(e) {
        this.setState({
            commune_id: e.target.value
        });
        if (!e.target.value) {
            return;
        } else {
            this.setState({
                massif_id: 0,
                province_id: 0
            });
        }
        $.ajax({
            type: 'GET',
            data: {},
            url: api_root + "/data_mart/commune_dimension/" + e.target.value,
            success: function(result) {
                source.clear();
                source.addFeatures(
                    (new ol.format.GeoJSON()).readFeatures(result)
                );
                modify.setActive(false);
            }
        });
    }

    fillMassifSelect() {
        let items = [];
        let massifs = this.props.massifs;
        for (let i = 0; i < massifs.length; i++) {
            let v = massifs[i];
            items.push(<option key={v} value={v}>{v}</option>);
        }
        return items;
    }

    fillCommuneSelect() {
        let items = [];
        let communes = this.props.communes;
        items.push(<option key={null} value={null}>{null}</option>);
        for (let i = 0; i < communes.length; i++) {
            let v = communes[i];
            items.push(<option key={v[1]} value={v[0]}>{v[1]}</option>);
        }
        return items;
    }

    render() {
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
                            {this.fillMassifSelect()}
                        </FormControl>
                      </FormGroup>
                      <FormGroup controlId="formControlsSelect">
                        <ControlLabel>Sélectionner une province</ControlLabel>
                        <FormControl componentClass="select"
                                     placeholder="select"
                                     onChange={this.onProvinceSelected.bind(this)}
                                     value={this.state.province_id}>
                            {this.fillProvinceSelect()}
                        </FormControl>
                      </FormGroup>
                      <FormGroup controlId="formControlsSelect">
                        <ControlLabel>Sélectionner une commune</ControlLabel>
                        <FormControl componentClass="select"
                                     placeholder="select"
                                     onChange={this.onCommuneSelected.bind(this)}
                                     value={this.state.commune_id}>
                            {this.fillCommuneSelect()}
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
}

ReactDOM.render(
  React.createElement(App, window.props),
  document.getElementById('react')
);
