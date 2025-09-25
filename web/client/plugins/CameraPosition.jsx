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
        height: '26px',
        width: '26px',
        padding: '0px',
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
                    z: cameraPosition.heightType === 'Ellipsoidal' ? Number(cameraPosition.height.toFixed(2)) :  Number(heightMSL.toFixed(2)),
                    crs: "EPSG:4326"
                });
            });

    }, [cameraPosition]);

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

export default {
    CameraPositionPlugin: Object.assign(CameraPositionPlugin, {
        disablePluginIf: "{state('mapType') !== 'cesium'}"
    },
    {
        MapFooter: { name: 'cameraPosition', position: 2, tool: true, priority: 1 }
    })
};
