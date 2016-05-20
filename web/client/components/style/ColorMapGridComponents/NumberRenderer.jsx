/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const numberLocalizer = require('react-widgets/lib/localizers/simple-number');
numberLocalizer();
const {NumberPicker} = require('react-widgets');
require('./numberpicker.css');

const NumberRenderer = React.createClass({
    propTypes: {
        params: React.PropTypes.object,
        onChangeValue: React.PropTypes.func
    },
    getInitialState() {
        return {
            displayNumberPicker: false,
            onChangeValue: () => {}
        };
    },
    componentDidMount() {
        this.props.params.api.addEventListener('cellClicked', this.cellClicked);
    },
    componentWillUnmount() {
        this.props.params.api.removeEventListener('cellClicked', this.cellClicked);
    },
    getRange() {
        let data = [];
        this.props.params.api.forEachNode((node) => {data.push(node.data); });
        let idx = this.props.params.node.childIndex;
        let min = (data[idx - 1]) ? data[idx - 1].quantity + 0.01 : -Infinity;
        let max = (data[idx + 1]) ? data[idx + 1].quantity - 0.01 : Infinity;
        return {min: min, max: max};
    },
    render() {
        let range = this.getRange();
        return (
            <div onClick={ () => {
                if (!this.state.displayNumberPicker) {
                    this.setState({displayNumberPicker: !this.state.displayNumberPicker});
                }} }
                >
                { this.state.displayNumberPicker ? (
                    <div>
                        <div style={{position: "fixed", top: 0, right: 0, bottom: 0, left: 0}}
                            onClick={this.stopEditing}/>
                    <div className="numberpicker" onClickCapture={ (e) => {e.stopPropagation(); }}>
                        <NumberPicker
                        min={range.min}
                        max={range.max}
                        format="-#,###.##"
                        precision={3}
                        defaultValue={this.state.value || this.props.params.value}
                        onChange={(v)=> this.setState({value: v})}
                        />
                    </div>
                    </div>) :
                <span>{(this.props.params.value.toFixed) ? this.props.params.value.toFixed(2) : this.props.params.value}</span> }
            </div>
        );
    },
    cellClicked(e) {
        if (this.props.params.value !== e.value && this.state.displayNumberPicker) {
            this.stopEditing();
        }
    },
    stopEditing() {
        this.setState({ displayNumberPicker: false});
        if (this.state.value !== this.props.params.value) {
            this.props.onChangeValue(this.props.params.node, this.state.value || this.props.params.value);
        }
    }
});

module.exports = NumberRenderer;
