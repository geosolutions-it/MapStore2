/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {createSelector} = require('reselect');

const {creationError, changeMapView, clickOnMap, mouseMove, mouseOut} = require('../../actions/map');
const {removePopup} = require('../../actions/mapPopups');
const {layerLoading, layerLoad, layerError} = require('../../actions/layers');
const {changeMeasurementState, changeGeometry, resetGeometry, updateMeasures, setTextLabels} = require('../../actions/measurement');
const {measurementSelector} = require('../../selectors/measurement');
const {changeSelectionState} = require('../../actions/selection');
const {changeLocateState, onLocateError} = require('../../actions/locate');
const {changeDrawingStatus, endDrawing, setCurrentStyle, geometryChanged, drawStopped, selectFeatures, drawingFeatures} = require('../../actions/draw');
const {updateHighlighted} = require('../../actions/highlight');
const {warning} = require('../../actions/notifications');
const {connect} = require('react-redux');
const assign = require('object-assign');
const {projectionDefsSelector, isMouseMoveActiveSelector} = require('../../selectors/map');

const Empty = () => { return <span/>; };

module.exports = (mapType, actions) => {

    const components = require('./' + mapType + '/index');

    const LMap = connect((state) => ({
        projectionDefs: projectionDefsSelector(state),
        mousePosition: isMouseMoveActiveSelector(state)
    }), assign({}, {
        onCreationError: creationError,
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
        setTextLabels
    })(components.MeasurementSupport || Empty);

    const Locate = connect((state) => ({
        status: state.locate && state.locate.state,
        messages: state.locale && state.locale.messages ? state.locale.messages.locate : undefined
    }), {
        changeLocateState,
        onLocateError
    })(components.Locate || Empty);

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

    const HighlightSupport = connect((state) =>
        state.highlight || {}, {updateHighlighted})( components.HighlightFeatureSupport || Empty);

    const SelectionSupport = connect((state) => ({
        selection: state.selection || {}
    }), {
        changeSelectionState
    })(components.SelectionSupport || Empty);

    require('../../components/map/' + mapType + '/plugins/index');
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
            locate: Locate,
            overview: components.Overview || Empty,
            scalebar: components.ScaleBar || Empty,
            draw: DrawSupport,
            highlight: HighlightSupport,
            selection: SelectionSupport,
            popup: PopupSupport
        }
    };
};
