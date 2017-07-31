import React from 'react';
import {
    Grid, Panel, Row, Col
} from 'react-bootstrap';


export class ResultPanel extends React.Component {

    constructor(props) {
        super(props);
    };

    getRichnessText() {
        if (this.props.richness === null) {
            return '';
        }
        return <p>
                 {"Nombre de taxons observée dans cette zone: "}
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
                 {"Superficie de l'emprise selectionnée: "}
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
                <Col xs={6} md={6}>
                  <Panel header={"Emprise"}>
                    {this.getRichnessText()}
                    {this.getOccurrenceCountText()}
                  </Panel>
                </Col>
                <Col xs={6} md={6}>
                  <Panel header={"Composition connue"}>
                    {this.getAreaText()}
                  </Panel>
                </Col>
              </Row>
            </Grid>
          </Panel>
        );
    }

}
