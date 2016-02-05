/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var proj4js = require('proj4');
var CoordinatesUtils = require('../../../utils/CoordinatesUtils');
var MousePositionLabelDMS = require('./MousePositionLabelDMS');
var MousePositionLabelYX = require('./MousePositionLabelYX');

require("./mousePosition.css");

let MousePosition = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        mousePosition: React.PropTypes.object,
        crs: React.PropTypes.string,
        enabled: React.PropTypes.bool,
        degreesTemplate: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
        projectedTemplate: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "mapstore-mouseposition",
            mousePosition: null,
            crs: "EPSG:4326",
            enabled: true,
            degreesTemplate: MousePositionLabelDMS,
            projectedTemplate: MousePositionLabelYX,
            style: {}
        };
    },
    getUnits(crs) {
        return proj4js.defs(crs).units;
    },
    getPosition() {
        let {x, y} = (this.props.mousePosition) ? this.props.mousePosition : [null, null];
        if (proj4js.defs(this.props.mousePosition.crs) !== proj4js.defs(this.props.crs)) {
            ({x, y} = CoordinatesUtils.reproject([x, y], this.props.mousePosition.crs, this.props.crs));
        }
        let units = this.getUnits(this.props.crs);
        if (units === "degrees") {
            return {lat: y, lng: x};
        }
        return {x, y};
    },

    getTemplateComponent() {
        return (this.getUnits(this.props.crs) === "degrees") ? this.props.degreesTemplate : this.props.projectedTemplate;
    },
    render() {
        let Template = (this.props.mousePosition) ? this.getTemplateComponent() : null;
        if (this.props.enabled && Template) {
            return (
                    <div id={this.props.id} style={this.props.style}>
                        <Template position={this.getPosition()} />
                    </div>
                );
        }
        return null;
    }
});

module.exports = MousePosition;
