/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var proj4js = require('proj4');
var MousePositionLabelDMS = require('./MousePositionLabelDMS');
var MousePositionLabelYX = require('./MousePositionLabelYX');
var CRSSelector = require('./CRSSelector');
require("./mousePosition.css");

let MousePosition = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        mousePosition: React.PropTypes.object,
        origCrs: React.PropTypes.string,
        labelTemplate: React.PropTypes.object,
        degreesTemplate: React.PropTypes.func,
        projectedTemplate: React.PropTypes.func,
        actions: React.PropTypes.shape({
            changeMousePositionCrs: React.PropTypes.func
        }),
        mapProjection: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            id: "mapstore-mouseposition",
            mousePosition: {
                position: {
                    lat: null,
                    lng: null
                },
                crs: null,
                enabled: false
            },
            origCrs: "EPSG:4326",
            degreesTemplate: MousePositionLabelDMS,
            projectedTemplate: MousePositionLabelYX,
            actions: {
                changeMousePositionCrs: () => {}
            },
            mapProjection: null
            };
    },
    componentWillMount() {
        if (!this.props.mousePosition.crs) this.props.actions.changeMousePositionCrs(this.props.mapProjection);
    },
    getUnits(crs) {
        return proj4js.defs(crs).units;
    },
    getPositionValues(mPos) {
        let {lat, lng} = (mPos.position) ? mPos.position : [null, null];
        let [latM, latS, lngM, lngS] = [null, null, null, null];
        if (lat && lng) {
            let units = this.getUnits(this.props.mousePosition.crs);
            if (proj4js.defs(this.props.mousePosition.crs) !== proj4js.defs(this.props.origCrs)) {
                [lng, lat] = proj4js(this.props.mousePosition.crs, [lng, lat]);
            }
            if (units === "degrees") {
                latM = (lat % 1) * 60;
                latS = (latM % 1) * 60;
                lngM = (lng % 1) * 60;
                lngS = (lngM % 1) * 60;
            }
        }
        return {
            lat,
            latM: Math.abs(latM),
            latS: Math.abs(latS),
            lng,
            lngM: Math.abs(lngM),
            lngS: Math.abs(lngS)
        };
    },
    getTemplateComponent() {
        return (this.getUnits(this.props.mousePosition.crs) === "degrees") ? this.props.degreesTemplate : this.props.projectedTemplate;
    },
    render() {
        let Tpl = (this.props.mousePosition.crs) ? this.getTemplateComponent() : null;
        return (
                <div>
                <CRSSelector key="crsSelector"
                     onCRSChange={this.props.actions.changeMousePositionCrs}
                     {...this.props.mousePosition}
                     crs={(this.props.mousePosition.crs) ? this.props.mousePosition.crs : this.props.mapProjection} />
                <div id={this.props.id}>
                { (this.props.mousePosition.enabled && Tpl) ? <Tpl {...this.getPositionValues(this.props.mousePosition)} /> : null }
                </div>
                </div>
            );
    }
});

module.exports = MousePosition;
