/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const {FormControl, FormGroup, ControlLabel} = require('react-bootstrap');
const CoordinatesUtils = require('../../../utils/CoordinatesUtils');

class CRSSelector extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        label: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.object]),
        availableCRS: PropTypes.object,
        filterAllowedCRS: PropTypes.array,
        projectionDefs: PropTypes.array,
        additionalCRS: PropTypes.object,
        crs: PropTypes.string,
        enabled: PropTypes.bool,
        onCRSChange: PropTypes.func,
        useRawInput: PropTypes.bool
    };

    static defaultProps = {
        id: "mapstore-crsselector",
        availableCRS: CoordinatesUtils.getAvailableCRS(),
        crs: null,
        onCRSChange: function() {},
        enabled: false,
        useRawInput: false
    };

    render() {
        var val;
        var label;
        var list = [];
        let availableCRS = {};
        if (Object.keys(this.props.availableCRS).length) {
            availableCRS = CoordinatesUtils.filterCRSList(this.props.availableCRS, this.props.filterAllowedCRS, this.props.additionalCRS, this.props.projectionDefs );
        }
        for (let crs in availableCRS) {
            if (availableCRS.hasOwnProperty(crs)) {
                val = crs;
                label = availableCRS[crs].label;
                list.push(<option value={val} key={val}>{label}</option>);
            }
        }

        if (this.props.enabled && this.props.useRawInput) {
            return (
                <select
                    id={this.props.id}
                    value={this.props.crs}
                    onChange={this.launchNewCRSAction}
                    bsSize="small"
                >
                    {list}
                </select>);
        } else if (this.props.enabled && !this.props.useRawInput) {
            return (
                <FormGroup>
                    <ControlLabel>{this.props.label}</ControlLabel>
                    <FormControl
                        componentClass="select"
                        id={this.props.id}
                        value={this.props.crs}
                        onChange={this.launchNewCRSAction}
                        bsSize="small"
                    >
                        {list}
                    </FormControl>
                </FormGroup>);
        }
        return null;
    }

    launchNewCRSAction = (ev) => {
        if (this.props.useRawInput) {
            this.props.onCRSChange(ev.target.value);
        } else {
            let element = ReactDOM.findDOMNode(this);
            let selectNode = element.getElementsByTagName('select').item(0);
            this.props.onCRSChange(selectNode.value);
        }
    };
}

module.exports = CRSSelector;
