import React from 'react';
import ReactDOM from 'react-dom';
import {
    form, Grid, Row, Col, FormGroup, ControlLabel, FormControl,
    HelpBlock, option, Panel, Button
} from 'react-bootstrap';
import ol from 'openlayers';
import {getDefaultMap, getPolygonArea} from '../map_utils';
import {Map} from '../map_component';
import {FormInvalidModal} from './form_invalid_modal';
import {ResultPanel} from './result_panel';


var host = window.location.host;
var protocol = window.location.protocol;
var api_root = protocol + "//" + host + "/api/1.0";


function showPreloader() {
    document.getElementById('preloader').style.display = 'inline';
}

function hidePreloader() {
    document.getElementById('preloader').style.display = 'none';
};


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

var draw_start_event = new CustomEvent('draw_start_event');
var draw_end_event = new CustomEvent('draw_end_event');

var process_end_event = new CustomEvent('process_end_event');

draw.on('drawstart', (event) => {
    window.dispatchEvent(draw_start_event);
    modify.setActive(false);
})
draw.on('drawend', (event) => {
    source.clear();
    modify.setActive(true);
    window.dispatchEvent(draw_end_event);
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
            province_id: 0,
            commune_id: 0,
            rainfall_filter: null,
            elevation_filter: null,
            selected_entity: null,
            show_form_invalid_modal: false,
            richness: null,
            occurrenceCount: null,
            uniqueTaxa: null,
            area: null,
            data: null,
            buttonDisabled: false
        }
    }

    componentDidMount() {
        window.addEventListener(
            "draw_end_event",
            this.handleDrawEndEvent.bind(this)
        );
        window.addEventListener(
            "draw_start_event",
            this.handleDrawStartEvent.bind(this)
        );
    }

    componentWillUnmount() {
        window.removeEventListener(
            "draw_end_event",
            this.handleDrawEndEvent.bind(this)
        );
        window.removeEventListener(
            "draw_start_event",
            this.handleDrawStartEvent.bind(this)
        );
    }

    handleDrawStartEvent(event) {
        this.setState({
            province_id: 0,
            commune_id: 0,
            selected_entity: null
        });
    }

    handleDrawEndEvent(event) {
        this.setState({
            occurrenceCount: null,
            uniqueTaxa: null,
            richness: null,
            area: null,
            data: null,
            selected_entity: {
                'type': 'draw'
            }
        });
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
            province_id: e.target.value,
            occurrenceCount: null,
            uniqueTaxa: null,
            richness: null,
            area: null,
            data: null
        });
        if (!e.target.value) {
            source.clear();
            this.setState({
                selected_entity: null
            })
            return;
        } else {
            this.setState({
                commune_id: 0,
                selected_entity: {
                    'type': 'provinces',
                    'value': e.target.value
                },
                buttonDisabled: true
            });
        }
        showPreloader();
        let _this = this;
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
                _this.setState({
                    selected_entity: {
                        'type': 'provinces',
                        'value': _this.state.selected_entity.value,
                        'geojson': result
                    },
                    buttonDisabled: false
                });
                hidePreloader();
            },
            error: function(request, error) {
                alert("Une erreur est survenue pendant le chargement des "
                    +"données, veuillez réessayer.\n"
                    + "Si l'erreur persiste, contactez "
                    +"dimitri.justeau@gmail.com");
                _this.setState({
                    province_id: 0,
                    selected_entity: null,
                    buttonDisabled: false
                });
                hidePreloader();
            }
        });
    }

    onCommuneSelected(e) {
        this.setState({
            commune_id: e.target.value,
            occurrenceCount: null,
            uniqueTaxa: null,
            richness: null,
            area: null,
            data: null
        });
        if (!e.target.value) {
            source.clear();
            this.setState({
                selected_entity: null
            })
            return;
        } else {
            this.setState({
                province_id: 0,
                selected_entity: {
                    'type': 'communes',
                    'value': e.target.value
                },
                buttonDisabled: true
            });
        }
        showPreloader();
        let _this = this;
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
                _this.setState({
                selected_entity: {
                    'type': 'communes',
                    'value': _this.state.selected_entity.value,
                    'geojson': result
                },
                buttonDisabled: false
            });
                hidePreloader();
            },
            error: function(request, error) {
                alert("Une erreur est survenue pendant le chargement des "
                    +"données, veuillez réessayer.\n"
                    + "Si l'erreur persiste, contactez "
                    +"dimitri.justeau@gmail.com");
                _this.setState({
                    commune_id: 0,
                    selected_entity: null,
                    buttonDisabled: false
                });
                hidePreloader();
            }
        });
    }

    onRainfallSelected(e) {
        this.setState({
            rainfall_filter: e.target.value,
            occurrenceCount: null,
            uniqueTaxa: null,
            richness: null,
            area: null,
            data: null
        });
    }

    onElevationSelected(e) {
        this.setState({
            elevation_filter: e.target.value,
            occurrenceCount: null,
            uniqueTaxa: null,
            richness: null,
            area: null,
            data: null
        });
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

    fillRainfallSelect() {
        let items = [];
        let rainfall_filters = this.props.rainfall_filters;
        items.push(<option key={''} value={''}>{"Pas de filtre"}</option>);
        for (let i = 0; i < rainfall_filters.length; i++) {
            let v = rainfall_filters[i];
            items.push(<option key={v} value={v}>{v}</option>);
        }
        items.push(<option key={'NS'} value={'NS'}>{"NS"}</option>);
        return items;
    }

    fillElevationSelect() {
        let items = [];
        let elevation_filters = this.props.elevation_filters;
        items.push(<option key={''} value={''}>{"Pas de filtre"}</option>);
        for (let i = 0; i < elevation_filters.length; i++) {
            let v = elevation_filters[i];
            items.push(<option key={v} value={v}>{v}</option>);
        }
        items.push(<option key={'NS'} value={'NS'}>{"NS"}</option>);
        return items;
    }

    process() {
        let csrftoken = $.cookie('csrftoken');
        $.ajaxSetup({
            'beforeSend': function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        });
        let selected_entity = this.state.selected_entity;
        if (selected_entity === null) {
            this.setState({
                show_form_invalid_modal: true
            })
            return;
        }
        if (selected_entity.type == 'draw') {
            let format = new ol.format.WKT();
            let format_geojson = new ol.format.GeoJSON();
            let feature = source.getFeatures()[0];
            let wkt = format.writeFeature(feature);
            let geojson = format_geojson.writeFeature(
                feature,
                {rightHanded: false}
            );
            selected_entity.value = wkt;
            selected_entity.geojson = geojson;
        }
        let this_ = this;
        showPreloader();
        $.ajax({
            type: 'POST',
            data: {
                selected_entity: JSON.stringify({
                    type: selected_entity.type,
                    value: selected_entity.value
                }),
                rainfall_filter: this_.state.rainfall_filter,
                elevation_filter: this_.state.elevation_filter
            },
            url: api_root + "/data_mart/process/",
            success: function(result) {
                let area;
                if (selected_entity['type'] == 'draw') {
                    area = getPolygonArea(
                        map,
                        source.getFeatures()[0].getGeometry()
                    );
                } else {
                    area = result.area;
                }
                let data = {
                    records: result.records,
                    columns: result.columns,
                    totals: result.totals
                };
                this_.setState({
                    occurrenceCount: result.summary.occurrence_sum,
                    uniqueTaxa: result.summary.unique_taxa_in_entity,
                    richness: result.summary.richness,
                    area: area,
                    data: data,
                });
                hidePreloader();
                process_end_event.selected_entity = selected_entity
                window.dispatchEvent(process_end_event);
            },
            error: function(request, error) {
                alert("Une erreur est survenue pendant le chargement des "
                    +"données, veuillez réessayer.\n"
                    + "Si l'erreur persiste, contactez "
                    +"dimitri.justeau@gmail.com");
                this_.setState({
                    occurrenceCount: null,
                    uniqueTaxa: null,
                    richness: null,
                    area: null,
                    data: null,
                    buttonDisabled: false,

                });
                hidePreloader();
            }
        });
    }

    modalClosed() {
        this.setState({
            show_form_invalid_modal: false
        });
    }

    render() {
        return (
            <div>
            <Panel>
              <Grid>
                <Row>
                  <Col xs={12} md={4}>
                    <form>
                      {/*<FieldGroup
                        id="formControlsFile"
                        type="file"
                        label="Charger un shapefile"
                      />*/}
                      {/* Province combobox */}
                      <FormGroup controlId="provinceSelect">
                        <ControlLabel>Sélectionner une province</ControlLabel>
                        <FormControl componentClass="select"
                                     placeholder="select"
                                     onChange={this.onProvinceSelected.bind(this)}
                                     value={this.state.province_id || ''}>
                            {this.fillProvinceSelect()}
                        </FormControl>
                      </FormGroup>
                      {/* Commune combobox */}
                      <FormGroup controlId="communeSelect">
                        <ControlLabel>Sélectionner une commune</ControlLabel>
                        <FormControl componentClass="select"
                                     placeholder="select"
                                     onChange={this.onCommuneSelected.bind(this)}
                                     value={this.state.commune_id || ''}>
                            {this.fillCommuneSelect()}
                        </FormControl>
                      </FormGroup>
                      {/* Rainfall combobox */}
                      <FormGroup controlId="rainfallSelect">
                        <ControlLabel>Filtrer sur la pluviométrie</ControlLabel>
                        <FormControl componentClass="select"
                                     placeholder="select"
                                     onChange={this.onRainfallSelected.bind(this)}
                                     value={this.state.rainfall_filter || ''}>
                            {this.fillRainfallSelect()}
                        </FormControl>
                      </FormGroup>
                      <FormGroup controlId="elevationSelect">
                        <ControlLabel>{"Filtrer sur l'altitude"}</ControlLabel>
                        <FormControl componentClass="select"
                                     placeholder="select"
                                     onChange={this.onElevationSelected.bind(this)}
                                     value={this.state.elevation_filter || ''}>
                            {this.fillElevationSelect()}
                        </FormControl>
                      </FormGroup>
                      <Button id='launch_button'
                              bsStyle='success'
                              onClick={this.process.bind(this)}
                              disabled={this.state.buttonDisabled}>
                        {"Lancer l'analyse"}
                      </Button>
                      <FormInvalidModal show={this.state.show_form_invalid_modal}
                                        onClose={this.modalClosed.bind(this)}/>
                    </form>
                  </Col>
                  <Col xs={6} md={8}>
                    <Map map={map} target={'map'}/>
                  </Col>
                </Row>
              </Grid>
            </Panel>
            <ResultPanel richness={this.state.richness}
                         occurrenceCount={this.state.occurrenceCount}
                         uniqueTaxa={this.state.uniqueTaxa}
                         area={this.state.area}
                         data={this.state.data || {}}/>
            </div>
        );
    }
}

ReactDOM.render(
  React.createElement(App, window.props),
  document.getElementById('react')
);
