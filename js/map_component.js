import React from 'react';


export class Map extends React.Component {

    constructor (props) {
        super(props)
        this.map = props.map;
        this.target = props.target;
    }

    componentDidMount () {
        this.map.setTarget(this.target)
    }

    componentWillUnmount () {
        this.map.setTarget(undefined)
    }

    render () {
        return (
            <div id={this.target}>
            </div>
        )
    }

}
