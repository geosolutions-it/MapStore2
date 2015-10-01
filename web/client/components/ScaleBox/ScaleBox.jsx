/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Input} = require('react-bootstrap');
const mapUtils = require('../../utils/MapUtils');

var ScaleBox = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        scales: React.PropTypes.array,
        currentZoomLvl: React.PropTypes.number,
        onChange: React.PropTypes.func,
        label: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            id: 'mapstore-scalebox',
            scales: mapUtils.getGoogleMercatorScales(0, 21),
            currentZoomLvl: 0,
            onChange() {}
        };
    },
    onComboChange(event) {
        var selectedZoomLvl = parseInt(event.nativeEvent.target.value, 10);
        this.props.onChange(selectedZoomLvl);
    },
    getOptions() {
        return this.props.scales.map((item, index) => {
            return (
                <option value={index} key={index}>
                    {"1 : " + Math.round(item)}
                </option>
            );
        });
    },
    render() {
        return (
            <div id={this.props.id} >
                <Input type="select" label={this.props.label} onChange={this.onComboChange} bsSize="small" value={this.props.currentZoomLvl}>
                    {this.getOptions()}
                </Input>
            </div>
        );
    }
});

module.exports = ScaleBox;
