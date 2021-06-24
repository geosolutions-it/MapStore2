/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { connect } from 'react-redux';
import mapType from '../../map/enhancers/mapType';
import autoResize from '../../map/enhancers/autoResize';
import getProjectionDefs from '../../map/enhancers/getProjectionDefs';
import onMapViewChanges from '../../map/enhancers/onMapViewChanges';
import withDraw from '../../map/enhancers/withDraw';
import {
    changeDrawingStatus as onChangeDrawingStatus,
    endDrawing as onEndDrawing,
    setCurrentStyle,
    geometryChanged as onGeometryChanged,
    drawStopped as onDrawStopped,
    selectFeatures as onSelectFeatures
} from '../../../actions/draw';
import { drawingFeatures as onDrawingFeatures } from '../../../actions/geostory';
import {compose} from 'recompose';
import { handlingUnsupportedProjection } from '../../map/enhancers/handlingUnsupportedProjection';
import { withOnClick } from '../../common/enhancers/withIdentifyPopup';
import withPopupSupport from '../common/enhancers/withPopupSupport';
import BaseMap from '../../map/BaseMap';

const drawConnect = connect((state) =>
    state.draw || {}, {
    onChangeDrawingStatus,
    onEndDrawing,
    onSelectFeatures,
    onDrawingFeatures,
    onGeometryChanged,
    onDrawStopped,
    setCurrentStyle
});

export default compose(
    onMapViewChanges,
    autoResize(0),
    mapType,
    withDraw(drawConnect),
    withPopupSupport,
    withOnClick,
    getProjectionDefs,
    handlingUnsupportedProjection
)(BaseMap);
