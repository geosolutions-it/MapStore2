const PropTypes = require('prop-types');
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const MapInfoUtils = require('../../utils/MapInfoUtils');

const {FormControl, FormGroup, ControlLabel} = require('react-bootstrap');

class FeatureInfoFormatSelector extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.object]),
        availableInfoFormat: PropTypes.object,
        infoFormat: PropTypes.string,
        onInfoFormatChange: PropTypes.func
    };

    static defaultProps = {
        id: "mapstore-feature-format-selector",
        availableInfoFormat: MapInfoUtils.getAvailableInfoFormat(),
        infoFormat: MapInfoUtils.getDefaultInfoFormatValue(),
        onInfoFormatChange: function() {}
    };

    render() {
        var list = Object.keys(this.props.availableInfoFormat).map((infoFormat) => {
            let val = this.props.availableInfoFormat[infoFormat];
            let label = infoFormat;
            return <option value={val} key={val}>{label}</option>;
        });

        return (
            <FormGroup bsSize="small">
                <ControlLabel>{this.props.label}</ControlLabel>
                <FormControl
                    id={this.props.id}
                    value={this.props.infoFormat}
                    componentClass="select"
                    onChange={this.launchChangeInfoFormatAction}>
                    {list}
                </FormControl>
            </FormGroup>
        );
    }

    launchChangeInfoFormatAction = () => {
        var element = ReactDOM.findDOMNode(this);
        var selectNode = element.getElementsByTagName('select').item(0);
        this.props.onInfoFormatChange(selectNode.value);
    };
}

module.exports = FeatureInfoFormatSelector;
