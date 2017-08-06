import React from 'react';
import ReactTable from 'react-table'


export class PivotTable extends React.Component {

    constructor(props) {
        super(props);
    };

    render() {
        return (
            <ReactTable
              data={this.props.data || []}
              columns={this.props.columns || []}
              defaultPageSize={5}/>
        );
    }

}
