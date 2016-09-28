/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var CoordinatesUtils = require('../../../utils/CoordinatesUtils');

let CRSSelector = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        inputProps: React.PropTypes.object,
        availableCRS: React.PropTypes.object,
        crs: React.PropTypes.string,
        enabled: React.PropTypes.bool,
        onCRSChange: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            id: "mapstore-crsselector",
            availableCRS: CoordinatesUtils.getAvailableCRS(),
            crs: null,
            onCRSChange: function() {},
            enabled: false
        };
    },
    render() {
        var val;
        var label;
        var list = [];
        for (let crs in this.props.availableCRS) {
            if (this.props.availableCRS.hasOwnProperty(crs)) {
                val = crs;
                label = this.props.availableCRS[crs].label;
                list.push(<option value={val} key={val}>{label}</option>);
            }
        }
        return (
              (this.props.enabled) ? (<select
                    id={this.props.id}
                    value={this.props.crs}
                    onChange={this.launchNewCRSAction}
                    bsSize="small"
                    {...this.props.inputProps}>
                    {list}
                </select>) : null

        );
    },
    launchNewCRSAction(ev) {
        this.props.onCRSChange(ev.target.value);
    }
});

module.exports = CRSSelector;
