/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const MapInfoUtils = require('../../utils/MapInfoUtils');

const {Input} = require('react-bootstrap');

var FeatureInfoFormatSelector = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        inputProps: React.PropTypes.object,
        availableInfoFormat: React.PropTypes.object,
        infoFormat: React.PropTypes.string,
        onInfoFormatChange: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            id: "mapstore-feature-format-selector",
            availableInfoFormat: MapInfoUtils.getAvailableInfoFormat(),
            infoFormat: MapInfoUtils.getDefaultInfoFormatValue(),
            onInfoFormatChange: function() {}
        };
    },
    render() {
        var list = Object.keys(this.props.availableInfoFormat).map((infoFormat) => {
            let val = this.props.availableInfoFormat[infoFormat];
            let label = infoFormat;
            return <option value={val} key={val}>{label}</option>;
        });

        return (
            <Input
                id={this.props.id}
                value={this.props.infoFormat}
                type="select"
                onChange={this.launchChangeInfoFormatAction}
                bsSize="small"
                {...this.props.inputProps}>
                {list}
            </Input>
        );
    },
    launchChangeInfoFormatAction() {
        var element = React.findDOMNode(this);
        var selectNode = element.getElementsByTagName('select').item(0);
        this.props.onInfoFormatChange(selectNode.value);
    }
});

module.exports = FeatureInfoFormatSelector;
