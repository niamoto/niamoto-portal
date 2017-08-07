import React from 'react';
import {
    Grid, Panel, Row, Col
} from 'react-bootstrap';
import {PivotTable} from './result_pivot_table';
import {D3Map} from './result_d3_map';
import {D3HeatMap} from './result_d3_heatmap';


export class ResultPanel extends React.Component {

    constructor(props) {
        super(props);
    };

    getRichnessText() {
        if (this.props.richness === null) {
            return '';
        }
        return <p>
                 {"Nombre de taxons observés dans cette zone: "}
                 <b>{this.props.richness}</b>{"."}
               </p>
    }

    getOccurrenceCountText() {
        if (this.props.occurrenceCount === null) {
            return '';
        }
        return <p>
                 {"Nombre d'occurrences observées dans cette zone: "}
                 <b>{this.props.occurrenceCount}</b>{"."}
               </p>
    }

    getAreaText() {
        if (this.props.area === null) {
            return '';
        }
        return <p>
                 {"Superficie de la zone selectionnée: "}
                 <b>
                    {this.props.area} {"Km"}
                    {String.fromCharCode( "178" )}
                 </b>
                 {"."}
               </p>
    }

    render() {
        return (
          <Panel>
            <Grid>
              <Row>
                <Col xs={12} md={12} lg={6}>
                  <Panel id={'area_panel'} header={"Emprise"}>
                    {this.getAreaText()}
                  </Panel>
                </Col>
                <Col xs={12} md={12} lg={6}>
                  <Panel id={'known_composition_panel'} header={"Composition connue - Total"}>
                    {this.getRichnessText()}
                    {this.getOccurrenceCountText()}
                  </Panel>
                </Col>
                <Col xs={12} md={12} lg={12}>
                    <Panel id={'pivot_table_panel'} header={"Composition connue - Détail"}>
                        <PivotTable data={this.props.data || {}}/>
                    </Panel>
                </Col>
                <Col xs={12} md={12} lg={12}>
                    <Panel id={'d3_map_panel'} header={"Détail de la zone"}>
                        <D3Map/>
                    </Panel>
                </Col>
                <Col xs={12} md={12} lg={12}>
                    <Panel id={'d3_heatmap_panel'} header={"Profil environnemental de la zone (Altitude / Pluviométrie)"}>
                        <D3HeatMap/>
                    </Panel>
                </Col>
              </Row>
            </Grid>
          </Panel>
        );
    }

}
