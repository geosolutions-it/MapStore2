/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const React = require('react');

const {creationError, changeMapView, clickOnMap} = require('../../actions/map');
const {layerLoading, layerLoad, layerError} = require('../../actions/layers');
const {changeMousePosition} = require('../../actions/mousePosition');
const {changeMeasurementState} = require('../../actions/measurement');
const {changeSelectionState} = require('../../actions/selection');
const {changeLocateState, onLocateError} = require('../../actions/locate');
const {changeDrawingStatus, endDrawing, setCurrentStyle} = require('../../actions/draw');
const {geometryChanged, drawStopped} = require('../../actions/draw');
const {updateHighlighted} = require('../../actions/highlight');

const {connect} = require('react-redux');
const assign = require('object-assign');
const {projectionDefsSelector} = require('../../selectors/map');

const Empty = () => { return <span/>; };

module.exports = (mapType, actions) => {

    const components = require('./' + mapType + '/index');

    const LMap = connect((state) => ({
        projectionDefs: projectionDefsSelector(state),
        mousePosition: state.mousePosition || {enabled: false}
    }), assign({}, {
        onCreationError: creationError,
        onMapViewChanges: changeMapView,
        onClick: clickOnMap,
        onMouseMove: changeMousePosition,
        onLayerLoading: layerLoading,
        onLayerLoad: layerLoad,
        onLayerError: layerError
    }, actions), (stateProps, dispatchProps, ownProps) => {
        return assign({}, ownProps, stateProps, assign({}, dispatchProps, {
            onMouseMove: stateProps.mousePosition.enabled ? dispatchProps.onMouseMove : () => {}
        }));
    })(components.LMap);

    const MeasurementSupport = connect((state) => ({
        measurement: state.measurement || {}
    }), {
        changeMeasurementState
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

    return {
        Map: LMap,
        Layer: components.Layer || Empty,
        Feature: components.Feature || Empty,
        tools: {
            measurement: MeasurementSupport,
            locate: Locate,
            overview: components.Overview || Empty,
            scalebar: components.ScaleBar || Empty,
            draw: DrawSupport,
            highlight: HighlightSupport,
            selection: SelectionSupport
        }
    };
};
