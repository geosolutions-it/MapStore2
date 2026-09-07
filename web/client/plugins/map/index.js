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
import { changeSelectionState } from '../../actions/selection';
import { boxSelectionStatus } from '../../selectors/box';

import {
    changeDrawingStatus,
    endDrawing,
    setCurrentStyle,
    geometryChanged,
    drawStopped,
    selectFeatures,
    drawingFeatures,
    toggleSnappingIsLoading
} from '../../actions/draw';

import { updateHighlighted } from '../../actions/highlight';
import { warning } from '../../actions/notifications';
import { connect } from 'react-redux';
import { projectionDefsSelector, isMouseMoveActiveSelector } from '../../selectors/map';
import {
    snappingLayerSelector
} from "../../selectors/draw";
import { mapPopupsSelector } from '../../selectors/mapPopups';

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
        }), Object.assign({}, {
            onMapViewChanges: changeMapView,
            onClick: clickOnMap,
            onMouseMove: mouseMove,
            onLayerLoading: layerLoading,
            onLayerLoad: layerLoad,
            onLayerError: layerError,
            onWarning: warning,
            onMouseOut: mouseOut
        }, actions), (stateProps, dispatchProps, ownProps) => {
            return Object.assign({}, ownProps, stateProps, Object.assign({}, dispatchProps, {
                onMouseMove: stateProps.mousePosition ? dispatchProps.onMouseMove : () => {}
            }));
        })(components.LMap);

        const DrawSupport = connect((state) =>
            ({
                ...(state.draw ?? {}),
                snappingLayerInstance: snappingLayerSelector(state)
            }), {
            onChangeDrawingStatus: changeDrawingStatus,
            onEndDrawing: endDrawing,
            onGeometryChanged: geometryChanged,
            onSelectFeatures: selectFeatures,
            onDrawingFeatures: drawingFeatures,
            onDrawStopped: drawStopped,
            setCurrentStyle: setCurrentStyle,
            toggleSnappingIsLoading: toggleSnappingIsLoading
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

        const PopupSupport = connect(
            createSelector(
                mapPopupsSelector,
                (popups) => ({popups})
            ), {
                onPopupClose: removePopup
            }
        )(components.PopupSupport || Empty);
        return {
            Map: LMap,
            Layer: LLayer,
            Feature: components.Feature || Empty,
            tools: {
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
