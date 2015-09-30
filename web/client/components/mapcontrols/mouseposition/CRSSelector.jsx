/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var BootstrapReact = require('react-bootstrap');
var {Input} = BootstrapReact;
var CoordinatesUtils = require('../../../utils/CoordinatesUtils');

let CRSSelector = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
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
            <div id={this.props.id}>
              { (this.props.enabled) ? <Input
                    value={this.props.crs}
                    type="select"
                    onChange={this.launchNewCRSAction}
                    bsSize="small">
                    {list}
                </Input> : null}
            </div>
        );
    },
    launchNewCRSAction() {
        var element = React.findDOMNode(this);
        var selectNode = element.getElementsByTagName('select').item(0);
        this.props.onCRSChange(selectNode.value);
    }
});

module.exports = CRSSelector;
