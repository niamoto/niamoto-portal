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
                 {"Nombre d'espèces observés dans cette zone: "}
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

    getUniqueTaxaCountText() {
        if (this.props.uniqueTaxa === null) {
            return '';
        }
        return <p>
                 {"Nombre d'espèces observées uniquement dans cette zone: "}
                 <b>{this.props.uniqueTaxa}</b>{"."}
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
            <Row className={'data_mart_row'}>
              <Col xs={12} md={12} lg={6} className={'result_container'}>
                <Panel id={'area_panel'} header={"Emprise"}>
                  {this.getAreaText()}
                </Panel>
              </Col>
              <Col xs={12} md={12} lg={6} className={'result_container'}>
                <Panel id={'known_composition_panel'} header={"Composition connue - Total"}>
                  {this.getOccurrenceCountText()}
                  {this.getRichnessText()}
                  {this.getUniqueTaxaCountText()}
                </Panel>
              </Col>
              <Col xs={12} md={12} lg={12} className={'result_container'}>
                  <Panel id={'pivot_table_panel'} header={"Composition connue - Détail"}>
                      <PivotTable data={this.props.data || {}}/>
                  </Panel>
              </Col>
            </Row>
        );
    }

}
