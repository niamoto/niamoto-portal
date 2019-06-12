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
        this.state = {};
    };


    getColumns(data) {
        if (!data.columns) {
            return [];
        }
        let columns = [];
        for (let i = 0; i < data.columns.length; i++) {
            let col = {
                id: data.columns[i][0],
                accessor: d => d[data.columns[i][0]],
                Header: data.columns[i][1],
                aggregate: (values, rows) => null,
                Aggregated: row => {
                    return <span><b>{row.value}</b></span>;
                },
            };
            if (data.columns[i][0] == 'richness') {
                col.aggregate = function(values, rows) {
                    return values.reduce((a, b) => a + b, 0);
                };
                col.Cell = row => {
                    return <span></span>;
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
            return [
                'taxon_dimension.familia',
                'taxon_dimension.genus'
            ];
        }
        return [];
    };

    render() {

        return (
            <div>
              <ReactTable
                data={this.getRecords(this.props.data) || []}
                columns={this.getColumns(this.props.data) || []}
                pivotBy={this.getPivotBy(this.props.data) || []}
                defaultPageSize={10}/>
            </div>
        );
    }

}
