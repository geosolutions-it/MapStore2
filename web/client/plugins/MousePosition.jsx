/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {connect} = require('react-redux');
const {get} = require('lodash');
const {mapSelector, projectionDefsSelector} = require('../selectors/map');
const Message = require('../components/I18N/Message');
const {Tooltip} = require('react-bootstrap');
const {createSelector} = require('reselect');

const assign = require('object-assign');
const PropTypes = require('prop-types');

const {changeMousePositionCrs} = require('../actions/mousePosition');
const {registerEventListener, unRegisterEventListener} = require('../actions/map');
const {isMouseMoveCoordinatesActiveSelector} = require('../selectors/map');

const getDesiredPosition = (map, mousePosition, mapInfo) => {
    if (mousePosition.showCenter && map) {
        return map.center;
    }
    if (mousePosition.showOnClick) {
        if (mapInfo.clickPoint && mapInfo.clickPoint.latlng) {
            return {
                x: mapInfo.clickPoint.latlng.lng,
                y: mapInfo.clickPoint.latlng.lat,
                crs: "EPSG:4326"
            };
        }
        return {
            crs: "EPSG:4326"
        };
    }
    return mousePosition;
};

const selector = createSelector([
    (state) => state,
    mapSelector,
    (state) => isMouseMoveCoordinatesActiveSelector(state),
    (state) => get(state, 'mousePosition.position') || {},
    (state) => get(state, 'mousePosition.crs', 'EPSG:4326'),
    (state) => state.mapInfo || {}
], (state, map, enabled, mousePosition, crs, mapInfo) => ({
    enabled,
    mousePosition: getDesiredPosition(map, mousePosition, mapInfo),
    projectionDefs: projectionDefsSelector(state),
    crs: crs
}));

const MousePositionButton = connect((state) => ({
    pressed: isMouseMoveCoordinatesActiveSelector(state),
    active: isMouseMoveCoordinatesActiveSelector(state),
    tooltip: <Tooltip id="showMousePositionCoordinates"><Message msgId="showMousePositionCoordinates"/></Tooltip>,
    tooltipPlace: 'left',
    pressedStyle: "success active",
    defaultStyle: "primary",
    glyphicon: "mouse",
    btnConfig: {
        bsSize: "small"}
}), {registerEventListener, unRegisterEventListener}, (stateProps, dispatchProps) => {
    return {...stateProps, onClick: () => stateProps.active ? dispatchProps.unRegisterEventListener('mousemove', 'mouseposition') : dispatchProps.registerEventListener('mousemove', 'mouseposition')};
})(require('../components/buttons/ToggleButton'));

const MousePositionComponent = require('../components/mapcontrols/mouseposition/MousePosition');


class MousePosition extends React.Component {
    static propTypes = {
        degreesTemplate: PropTypes.string,
        projectedTemplate: PropTypes.string
    };

    static defaultProps = {
        degreesTemplate: 'MousePositionLabelDMS',
        projectedTemplate: 'MousePositionLabelYX'
    };

    getTemplate = (template) => {
        return require('../components/mapcontrols/mouseposition/' + template);
    };
    render() {
        const { degreesTemplate, projectedTemplate, ...other} = this.props;
        return (
            <MousePositionComponent
                degreesTemplate={this.getTemplate(degreesTemplate)}
                projectedTemplate={this.getTemplate(projectedTemplate)}
                toggle={<MousePositionButton/>} {...other}/>
        );
    }
}

/**
  * MousePosition Plugin is a plugin that shows the coordinate of the mouse position in a selected crs.
  * it gets displayed into the mapFooter plugin
  * @name MousePosition
  * @memberof plugins
  * @class
  * @prop {boolean} cfg.showElevation shows elevation in addition to planar coordinates (requires a WMS layer with useElevation: true to be configured in the map)
  * @prop {function} cfg.elevationTemplate custom template to show the elevation if showElevation is true (default template shows the elevation number with no formatting)
  * @prop {object[]} projectionDefs list of additional project definitions
  * @prop {string[]} cfg.filterAllowedCRS list of allowed crs in the combobox list to used as filter for the one of retrieved proj4.defs()
  * @prop {object} cfg.additionalCRS additional crs added to the list. The label param is used after in the combobox.
  * @example
  * // If you want to add some crs you need to provide a definition and adding it in the additionalCRS property
  * // Put the following lines at the first level of the localconfig
  * {
  *   "projectionDefs": [{
  *     "code": "EPSG:3003",
  *     "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
  *     "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
  *     "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
  *   }]
  * }
  * @example
  * // And configure the mouse position plugin as below:
  * {
  *   "cfg": {
  *     "additionalCRS": {
  *       "EPSG:3003": { "label": "EPSG:3003" }
  *     },
  *     "filterAllowedCRS": ["EPSG:4326", "EPSG:3857"]
  *   }
  * }
  * @example
  * // to show elevation and (optionally) use a custom template configure the plugin this way:
  * {
  *   "cfg": {
  *     ...
  *     "showElevation": true,
  *     "elevationTemplate": "{(function(elevation) {return 'myelev: ' + (elevation || 0);})}",
  *     ...
  *   }
  * }
*/
const MousePositionPlugin = connect(selector, {
    onCRSChange: changeMousePositionCrs
})(MousePosition);

module.exports = {
    MousePositionPlugin: assign(MousePositionPlugin, {
        MapFooter: {
            name: 'mousePosition',
            position: 2,
            tool: true,
            priority: 1
        }
    }),
    reducers: {mousePosition: require('../reducers/mousePosition')}
};
