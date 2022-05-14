/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import Rx from 'rxjs';

import { updateMapLayout } from '../actions/maplayout';
import { TOGGLE_CONTROL, SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES } from '../actions/controls';
import { MAP_CONFIG_LOADED } from '../actions/config';
import { SIZE_CHANGE, CLOSE_FEATURE_GRID, OPEN_FEATURE_GRID } from '../actions/featuregrid';

import {
    CLOSE_IDENTIFY,
    ERROR_FEATURE_INFO,
    TOGGLE_MAPINFO_STATE,
    LOAD_FEATURE_INFO,
    EXCEPTIONS_FEATURE_INFO,
    NO_QUERYABLE_LAYERS
} from '../actions/mapInfo';

import { SHOW_SETTINGS, HIDE_SETTINGS } from '../actions/layers';
import {isMapInfoOpen, mapInfoEnabledSelector} from '../selectors/mapInfo';
import { showCoordinateEditorSelector } from '../selectors/controls';
import ConfigUtils from '../utils/ConfigUtils';
import { mapInfoDetailsSettingsFromIdSelector, isMouseMoveIdentifyActiveSelector } from '../selectors/map';

/**
 * Epìcs for feature grid
 * @memberof epics
 * @name mapLayout
 */

import { head, get } from 'lodash';

import { isFeatureGridOpen, getDockSize } from '../selectors/featuregrid';
import {DEFAULT_MAP_LAYOUT} from "../utils/MapUtils";

/**
 * Capture that cause layout change to update the proper object.
 * Configures a map layout based on state of panels.
 * @param {external:Observable} action$ manages `MAP_CONFIG_LOADED`, `SIZE_CHANGE`, `CLOSE_FEATURE_GRID`, `OPEN_FEATURE_GRID`, `CLOSE_IDENTIFY`, `NO_QUERYABLE_LAYERS`, `LOAD_FEATURE_INFO`, `TOGGLE_MAPINFO_STATE`, `TOGGLE_CONTROL`, `SET_CONTROL_PROPERTY`.
 * @memberof epics.mapLayout
 * @return {external:Observable} emitting {@link #actions.map.updateMapLayout} action
 */

export const updateMapLayoutEpic = (action$, store) =>

    action$.ofType(
        MAP_CONFIG_LOADED,
        SIZE_CHANGE,
        CLOSE_FEATURE_GRID,
        OPEN_FEATURE_GRID,
        CLOSE_IDENTIFY,
        NO_QUERYABLE_LAYERS,
        TOGGLE_MAPINFO_STATE,
        LOAD_FEATURE_INFO,
        EXCEPTIONS_FEATURE_INFO,
        TOGGLE_CONTROL,
        SET_CONTROL_PROPERTY,
        SET_CONTROL_PROPERTIES,
        SHOW_SETTINGS,
        HIDE_SETTINGS,
        ERROR_FEATURE_INFO)
        .switchMap(() => {
            const state = store.getState();

            if (get(state, "browser.mobile")) {
                const bottom = isMapInfoOpen(store.getState()) ? {bottom: '50%'} : {bottom: undefined};

                const boundingMapRect = {
                    ...bottom
                };
                return Rx.Observable.of(updateMapLayout({
                    boundingMapRect
                }));
            }

            // Calculating sidebar's rectangle to be used by dock panels
            const rightSidebars = head([
                get(state, "controls.sidebarMenu.enabled") && {right: 40} || null
            ]) || {right: 0};
            const leftSidebars = head([
                null
            ]) || {left: 0};

            const boundingSidebarRect = {
                ...rightSidebars,
                ...leftSidebars,
                bottom: 0
            };
            /* ---------------------- */

            const mapLayout = ConfigUtils.getConfigProp("mapLayout") || DEFAULT_MAP_LAYOUT;

            if (get(state, "mode") === 'embedded') {
                const height = {height: 'calc(100% - ' + mapLayout.bottom.sm + 'px)'};
                const bottom = isMapInfoOpen(state) ? {bottom: '50%'} : {bottom: undefined};
                const boundingMapRect = {
                    ...bottom
                };
                return Rx.Observable.of(updateMapLayout({
                    ...height,
                    boundingMapRect
                }));
            }

            const resizedDrawer = get(state, "controls.drawer.resizedWidth");

            const leftPanels = head([
                get(state, "controls.queryPanel.enabled") && {left: mapLayout.left.lg} || null,
                get(state, "controls.annotations.enabled") && {left: mapLayout.left.sm} || null,
                get(state, "controls.widgetBuilder.enabled") && {left: mapLayout.left.md} || null,
                get(state, "layers.settings.expanded") && {left: mapLayout.left.md} || null,
                get(state, "controls.drawer.enabled") && { left: resizedDrawer || mapLayout.left.sm} || null
            ].filter(panel => panel)) || {left: 0};

            const rightPanels = head([
                get(state, "controls.details.enabled") && !mapInfoDetailsSettingsFromIdSelector(state)?.showAsModal && {right: mapLayout.right.md} || null,
                get(state, "controls.metadataexplorer.enabled") && {right: mapLayout.right.md} || null,
                get(state, "controls.measure.enabled") && showCoordinateEditorSelector(state) && {right: mapLayout.right.md} || null,
                get(state, "controls.userExtensions.enabled") && { right: mapLayout.right.md } || null,
                get(state, "controls.mapTemplates.enabled") && { right: mapLayout.right.md } || null,
                get(state, "controls.mapCatalog.enabled") && { right: mapLayout.right.md } || null,
                mapInfoEnabledSelector(state) && isMapInfoOpen(state) && !isMouseMoveIdentifyActiveSelector(state) && {right: mapLayout.right.md} || null
            ].filter(panel => panel)) || {right: 0};

            const dockSize = getDockSize(state) * 100;
            const bottom = isFeatureGridOpen(state) && {bottom: dockSize + '%', dockSize}
                || {bottom: 0}; // To avoid map from de-centering when performing scale zoom

            const transform = isFeatureGridOpen(state) && {transform: 'translate(0, -' + mapLayout.bottom.sm + 'px)'} || {transform: 'none'};
            const height = {height: 'calc(100% - ' + mapLayout.bottom.sm + 'px)'};

            const boundingMapRect = {
                ...bottom,
                ...leftPanels,
                ...rightPanels
            };

            Object.keys(boundingMapRect).forEach(key => {
                if (['left', 'right', 'dockSize'].includes(key)) {
                    boundingMapRect[key] = boundingMapRect[key] + (boundingSidebarRect[key] ?? 0);
                } else {
                    const totalOffset = (parseFloat(boundingMapRect[key]) + parseFloat(boundingSidebarRect[key] ?? 0));
                    boundingMapRect[key] = totalOffset ? totalOffset + '%' : 0;
                }
            });

            return Rx.Observable.of(updateMapLayout({
                ...boundingMapRect,
                ...transform,
                ...height,
                boundingMapRect,
                boundingSidebarRect,
                rightPanel: rightPanels.right > 0,
                leftPanel: leftPanels.left > 0
            }));
        });

export default {
    updateMapLayoutEpic
};
