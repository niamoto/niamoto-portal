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
        return "Richesse observée dans cette zone: "
            + this.props.richness + '.';
    }

    getOccurrenceCountText() {
        if (this.props.occurrenceCount === null) {
            return '';
        }
        return "Nombre d'occurrence observées dans cette zone: "
            + this.props.occurrenceCount + ".";
    }

    render() {
        return (
          <Panel>
            <Grid>
              <Row>
                <Col xs={12} md={12}>
                  <h4>{this.getRichnessText()}</h4>
                  <h4>{this.getOccurrenceCountText()}</h4>
                </Col>
              </Row>
            </Grid>
          </Panel>
        );
    }

}
