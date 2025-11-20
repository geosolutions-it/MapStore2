/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Tooltip } from 'react-bootstrap';
import PropTypes from 'prop-types';

import ToggleButton from '../components/buttons/ToggleButton';
import Message from '../components/I18N/Message';
import MousePositionComponent from '../components/mapcontrols/mouseposition/MousePosition';
import { getTemplate } from '../components/mapcontrols/mouseposition/templates';
import { parsePGM } from '@math.gl/geoid';
import { changeCameraPositionCrs, changeCameraPositionHeightType, registerEventListener, unRegisterEventListener } from '../actions/map';
import { isMouseLeftDragCoordinatesActiveSelector, mapSelector, projectionDefsSelector, cameraPositionCrsSelector, cameraPositionHeightTypeSelector } from '../selectors/map';

const selector = createSelector([
    (state) => state,
    mapSelector,
    (state) => isMouseLeftDragCoordinatesActiveSelector(state),
    (state) => cameraPositionCrsSelector(state),
    (state) => cameraPositionHeightTypeSelector(state)
], (state, map, enabled, crs, heightType) => ({
    enabled,
    cameraPosition: map?.viewerOptions?.cameraPosition,
    projectionDefs: projectionDefsSelector(state),
    crs: crs,
    heightType: heightType
}));

const CameraPositionButton = connect((state) => ({
    pressed: isMouseLeftDragCoordinatesActiveSelector(state),
    active: isMouseLeftDragCoordinatesActiveSelector(state),
    tooltip: <Tooltip id="showMousePositionCoordinates"><Message msgId="showMousePositionCoordinates"/></Tooltip>,
    tooltipPlace: 'left',
    pressedStyle: "success active",
    defaultStyle: "primary",
    glyphicon: "camera",
    btnConfig: { className: 'square-button-md'},
    style: {
        height: '25px',
        width: '25px',
        marginTop: '2px'
    }
}), {registerEventListener, unRegisterEventListener}, (stateProps, dispatchProps) => {
    return {...stateProps, onClick: () => stateProps.active ? dispatchProps.unRegisterEventListener('leftdrag', 'cameraposition') : dispatchProps.registerEventListener('leftdrag', 'cameraposition')};
})(ToggleButton);


const CameraPosition = (props) => {
    const { degreesTemplate = 'MousePositionLabelDMS', projectedTemplate = 'MousePositionLabelYX', ...other } = props;
    const { cameraPosition = {} } = props;
    const [mousePosition, setMousePosition] = useState(null);

    useEffect(() => {
        if (!cameraPosition || Object.keys(cameraPosition).length === 0) {
            return;
        }

        if (cameraPosition.heightType === 'MSL') {
            fetch('../product/assets/img/egm96-15.pgm')
                .then(response => response.arrayBuffer())
                .then(data => {
                    const geoid = parsePGM(new Uint8Array(data), {
                        cubic: false
                    });
                    const heightMSL = cameraPosition.height - geoid.getHeight(cameraPosition.latitude, cameraPosition.longitude);
                    setMousePosition({
                        x: cameraPosition.longitude,
                        y: cameraPosition.latitude,
                        z: Number(heightMSL.toFixed(2)),
                        crs: "EPSG:4326"
                    });
                })
                .catch(error => {
                    console.error('Error fetching or parsing the geoid model:', error);
                    setMousePosition({
                        x: cameraPosition.longitude,
                        y: cameraPosition.latitude,
                        z: Number(cameraPosition.height?.toFixed(2) || 0),
                        crs: "EPSG:4326"
                    });
                });
        } else {
            setMousePosition({
                x: cameraPosition.longitude,
                y: cameraPosition.latitude,
                z: Number(cameraPosition.height?.toFixed(2) || 0),
                crs: "EPSG:4326"
            });
        }
    }, [
        cameraPosition?.longitude,
        cameraPosition?.latitude,
        cameraPosition?.height,
        cameraPosition?.heightType
    ]);

    return (
        <MousePositionComponent
            crsId="mapstore-crsselector-cameraposition"
            heightId="mapstore-heightselector-cameraposition"
            id="mapstore-cameraposition"
            degreesTemplate={getTemplate(degreesTemplate)}
            projectedTemplate={getTemplate(projectedTemplate)}
            toggle={<CameraPositionButton/>}
            mousePosition={mousePosition}
            {...other}
        />
    );
};

CameraPosition.propTypes = {
    degreesTemplate: PropTypes.string,
    projectedTemplate: PropTypes.string
};

const CameraPositionPlugin = connect(selector, {
    onCRSChange: changeCameraPositionCrs,
    onHeightTypeChange: changeCameraPositionHeightType
})(CameraPosition);

/**
  * CameraPosition Plugin is a plugin that shows the coordinate of the camera position in a selected crs along with the height above ellipsoid or mean sea level.
  * it gets displayed into the mapFooter plugin
  * @name CameraPosition
  * @memberof plugins
  * @class
  * @prop {string} cfg.editCRS if true shows a combobox to select the crs of the camera position.
  * @prop {string} cfg.showLabels if true shows the labels of the coordinates.
  * @prop {string} cfg.showToggle if true shows a toggle button to enable/disable the plugin.
  * @prop {boolean} cfg.showElevation shows elevation in Ellipsoidal or MSL in 3D map.
  * @prop {function} cfg.elevationTemplate custom template to show the elevation if showElevation is true (default template shows the elevation number with no formatting)
  * @prop {object[]} projectionDefs list of additional project definitions
  * @prop {string[]} cfg.filterAllowedCRS list of allowed crs in the combobox list to used as filter for the one of retrieved proj4.defs()
  * @prop {string[]} cfg.filterAllowedHeight list of allowed height type in the combobox list. Accepted values are "Ellipsoidal" and "MSL"
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
  * @example
  * // to filter the height type list configure the plugin this way:
  * {
  *   "cfg": {
  *     ...
  *     "filterAllowedHeight": ["Ellipsoidal", "MSL"],
  *     ...
  *   }
  * }
  * @example
  * // to show the crs and height type labels configure the plugin this way:
  * {
  *   "cfg": {
  *     ...
  *     "showLabels": true,
  *     ...
  *   }
  * }
  * @example
  * // to show the toggle button configure the plugin this way:
  * {
  *   "cfg": {
  *     ...
  *     "showToggle": true,
  *     ...
  *   }
  * }
  * @example
  * // to show the crs selector configure the plugin this way:
  * {
  *   "cfg": {
  *     ...
  *     "editCRS": true,
  *     ...
  *   }
  * }
*/

export default {
    CameraPositionPlugin: Object.assign(CameraPositionPlugin, {
        disablePluginIf: "{state('mapType') !== 'cesium'}"
    },
    {
        MapFooter: { name: 'cameraPosition', position: 3, target: 'right-footer',
            priority: 1}
    })
};
