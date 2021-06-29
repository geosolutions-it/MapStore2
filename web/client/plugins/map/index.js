/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import { createSelector } from 'reselect';
import { changeMapView, clickOnMap, mouseMove, mouseOut } from '../../actions/map';
import { boxEnd } from '../../actions/box';
import { removePopup } from '../../actions/mapPopups';
import { layerLoading, layerLoad, layerError } from '../../actions/layers';

import {
    changeMeasurementState,
    changeGeometry,
    resetGeometry,
    updateMeasures,
    setTextLabels,
    changeMeasurement
} from '../../actions/measurement';

import { measurementSelector } from '../../selectors/measurement';
import { changeSelectionState } from '../../actions/selection';
import { boxSelectionStatus } from '../../selectors/box';

import {
    changeDrawingStatus,
    endDrawing,
    setCurrentStyle,
    geometryChanged,
    drawStopped,
    selectFeatures,
    drawingFeatures
} from '../../actions/draw';

import { updateHighlighted } from '../../actions/highlight';
import { warning } from '../../actions/notifications';
import { connect } from 'react-redux';
import assign from 'object-assign';
import { projectionDefsSelector, isMouseMoveActiveSelector } from '../../selectors/map';

const Empty = () => { return <span/>; };

const pluginsCreator = (mapType, actions) => {

    return Promise.all([
        import('./' + mapType + '/index'),
        // wait until the layer registration is complete
        // to ensure the layer can create the layer based on type
        import('../../components/map/' + mapType + '/plugins/index')
    ]).then(([ module ]) => {
        const components = module.default;
        const LMap = connect((state) => ({
            projectionDefs: projectionDefsSelector(state),
            mousePosition: isMouseMoveActiveSelector(state)
        }), assign({}, {
            onMapViewChanges: changeMapView,
            onClick: clickOnMap,
            onMouseMove: mouseMove,
            onLayerLoading: layerLoading,
            onLayerLoad: layerLoad,
            onLayerError: layerError,
            onWarning: warning,
            onMouseOut: mouseOut
        }, actions), (stateProps, dispatchProps, ownProps) => {
            return assign({}, ownProps, stateProps, assign({}, dispatchProps, {
                onMouseMove: stateProps.mousePosition ? dispatchProps.onMouseMove : () => {}
            }));
        })(components.LMap);

        const MeasurementSupport = connect((state) => ({
            enabled: state.controls && state.controls.measure && state.controls.measure.enabled || false,
            // TODO TEST selector to validate the feature: filter the coords, if length >= minValue return ft validated (close the polygon) else empty ft
            measurement: measurementSelector(state),
            useTreshold: state.measurement && state.measurement.useTreshold || null,
            uom: state.measurement && state.measurement.uom || {
                length: {unit: 'm', label: 'm'},
                area: {unit: 'sqm', label: 'm²'}
            }
        }), {
            changeMeasurementState,
            updateMeasures,
            resetGeometry,
            changeGeometry,
            setTextLabels,
            changeMeasurement
        })(components.MeasurementSupport || Empty);

        const DrawSupport = connect((state) =>
            state.draw || {}, {
            onChangeDrawingStatus: changeDrawingStatus,
            onEndDrawing: endDrawing,
            onGeometryChanged: geometryChanged,
            onSelectFeatures: selectFeatures,
            onDrawingFeatures: drawingFeatures,
            onDrawStopped: drawStopped,
            setCurrentStyle: setCurrentStyle
        })( components.DrawSupport || Empty);

        const BoxSelectionSupport = connect(
            createSelector(
                (state) => boxSelectionStatus(state),
                (status) => ({
                    status
                })), {
                onBoxEnd: boxEnd
            }
        )(components.BoxSelectionSupport || Empty);

        const HighlightSupport = connect((state) =>
            state.highlight || {}, {updateHighlighted})( components.HighlightFeatureSupport || Empty);

        const SelectionSupport = connect((state) => ({
            selection: state.selection || {}
        }), {
            changeSelectionState
        })(components.SelectionSupport || Empty);

        const LLayer = connect(null, {onWarning: warning})( components.Layer || Empty);

        const EMPTY_POPUPS = [];
        const PopupSupport = connect(
            createSelector(
                (state) => state.mapPopups && state.mapPopups.popups || EMPTY_POPUPS,
                (popups) => ({
                    popups
                })), {
                onPopupClose: removePopup
            }
        )(components.PopupSupport || Empty);
        return {
            Map: LMap,
            Layer: LLayer,
            Feature: components.Feature || Empty,
            tools: {
                measurement: MeasurementSupport,
                overview: components.Overview || Empty,
                scalebar: components.ScaleBar || Empty,
                draw: DrawSupport,
                highlight: HighlightSupport,
                selection: SelectionSupport,
                popup: PopupSupport,
                box: BoxSelectionSupport
            },
            mapType
        };
    });


};

export default pluginsCreator;
