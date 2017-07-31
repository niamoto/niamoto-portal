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
        return "Nombre de taxons observée dans cette zone: "
            + this.props.richness + '.';
    }

    getOccurrenceCountText() {
        if (this.props.occurrenceCount === null) {
            return '';
        }
        return "Nombre d'occurrences observées dans cette zone: "
            + this.props.occurrenceCount + ".";
    }

    getAreaText() {
        if (this.props.area === null) {
            return '';
        }
        return "Superficie de l'emprise selectionnée: "
            + this.props.area + " Km" + String.fromCharCode( "178" ) + ".";
    }

    render() {
        return (
          <Panel>
            <Grid>
              <Row>
                <Col xs={6} md={6}>
                  <Panel header={"Emprise"}>
                    <h4>{this.getRichnessText()}</h4>
                    <h4>{this.getOccurrenceCountText()}</h4>
                  </Panel>
                </Col>
                <Col xs={6} md={6}>
                  <Panel header={"Composition connue"}>
                    <h4>{this.getAreaText()}</h4>
                  </Panel>
                </Col>
              </Row>
            </Grid>
          </Panel>
        );
    }

}
