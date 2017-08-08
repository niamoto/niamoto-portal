import React from 'react';
import ReactTable from 'react-table';
import {
    form, Grid, Row, Col, FormGroup, ControlLabel, FormControl,
    option, Panel
} from 'react-bootstrap';
/* Avoid 'Object.entries is not a function' error in some browsers */
import 'babel-polyfill';


export class PivotTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pivotBy: 'rainfall.category',
        };
    };

    groupByChanged(e) {
        this.setState({
            pivotBy: e.target.value
        });
    };

    getColumns(data) {
        if (!data.columns) {
            return [];
        }
        let columns = [];
        let pivotBy = this.state.pivotBy;
        for (let i = 0; i < data.columns.length; i++) {
            let col = {
                id: data.columns[i][0],
                accessor: d => d[data.columns[i][0]],
                Header: data.columns[i][1],
                aggregate: (values, rows) => null,
                Aggregated: row => {
                    return <span><b>{row.value}</b></span>;
                }
            }
            if (data.columns[i][0] == 'richness') {
                col.aggregate = function(values, rows) {
                    let tot = data.totals[pivotBy];
                    tot = tot[rows[0][pivotBy]]['richness'];
                    return tot;
                };
            }
            if (data.columns[i][0] == 'occurrence_sum') {
                col.aggregate = function(values, rows) {
                    return values.reduce((a, b) => a + b, 0);
                };
            }
            columns.push(col);
        }
        return columns;
    };

    getRecords(data) {
        return data.records || [];
    };

    getPivotBy(data) {
        if (data.columns) {
            return [this.state.pivotBy];
        }
        return [];
    };

    render() {

        return (
            <div>
              <Grid>
                <Row>
                  <Col xs={12} md={12}>
                  <form className={"form-inline"}>
                    <FormGroup controlId="groupBySelect">
                      <ControlLabel>Grouper sur</ControlLabel>
                      <FormControl componentClass="select"
                                   placeholder="select"
                                   onChange={this.groupByChanged.bind(this)}
                                   value={this.state.pivotBy}>
                          <option key={'rainfall.category'} value={'rainfall.category'}>{'Pluviométrie'}</option>
                          <option key={'elevation.category'} value={'elevation.category'}>{'Altitude'}</option>
                      </FormControl>
                    </FormGroup>
                  </form>
                  </Col>
                </Row>
              </Grid>
              <ReactTable
                data={this.getRecords(this.props.data) || []}
                columns={this.getColumns(this.props.data) || []}
                pivotBy={this.getPivotBy(this.props.data) || []}
                defaultPageSize={5}/>
            </div>
        );
    }

}
