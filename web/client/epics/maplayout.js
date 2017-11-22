/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');
const {updateMapLayout} = require('../actions/maplayout');
const {TOGGLE_CONTROL, SET_CONTROL_PROPERTY} = require('../actions/controls');
const {MAP_CONFIG_LOADED} = require('../actions/config');
const {SIZE_CHANGE, CLOSE_FEATURE_GRID, OPEN_FEATURE_GRID} = require('../actions/featuregrid');
const {PURGE_MAPINFO_RESULTS} = require('../actions/mapInfo');
const {mapInfoRequestsSelector} = require('../selectors/mapinfo');

/**
 * Epìcs for feature grid
 * @memberof epics
 * @name mapLayout
 */

const {head, get} = require('lodash');
const {isFeatureGridOpen, getDockSize} = require('../selectors/featuregrid');

/**
 * Gets `MAP_CONFIG_LOADED`, `SIZE_CHANGE`, `CLOSE_FEATURE_GRID`, `OPEN_FEATURE_GRID`, `PURGE_MAPINFO_RESULTS`, `TOGGLE_CONTROL`, `SET_CONTROL_PROPERTY` events.
 * Configures a map layout based on state of panels.
 * @param {external:Observable} action$ manages `MAP_CONFIG_LOADED`, `SIZE_CHANGE`, `CLOSE_FEATURE_GRID`, `OPEN_FEATURE_GRID`, `PURGE_MAPINFO_RESULTS`, `TOGGLE_CONTROL`, `SET_CONTROL_PROPERTY`.
 * @memberof epics.mapLayout
 * @return {external:Observable} emitting {@link #actions.map.updateMapLayout} action
 */

const updateMapLayoutEpic = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED, SIZE_CHANGE, CLOSE_FEATURE_GRID, OPEN_FEATURE_GRID, PURGE_MAPINFO_RESULTS, TOGGLE_CONTROL, SET_CONTROL_PROPERTY)
        .switchMap(() => {

            if (get(store.getState(), "browser.mobile")) {
                return Rx.Observable.empty();
            }

            const mapLayout = {left: {sm: 300, md: 500, lg: 600}, right: {md: 658}, bottom: {sm: 30}};

            if (get(store.getState(), "mode") === 'embedded') {
                const height = {height: 'calc(100% - ' + mapLayout.bottom.sm + 'px)'};
                return Rx.Observable.of(updateMapLayout({
                    ...height
                }));
            }

            const leftPanels = head([
                get(store.getState(), "controls.queryPanel.enabled") && {left: mapLayout.left.lg} || null,
                get(store.getState(), "controls.widgetBuilder.enabled") && {left: mapLayout.left.md} || null,
                get(store.getState(), "controls.drawer.enabled") && {left: mapLayout.left.sm} || null
            ].filter(panel => panel)) || {left: 0};

            const rightPanels = head([
                get(store.getState(), "controls.annotations.enabled") && {right: mapLayout.right.md} || null,
                get(store.getState(), "controls.metadataexplorer.enabled") && {right: mapLayout.right.md} || null,
                mapInfoRequestsSelector(store.getState()).length > 0 && {right: mapLayout.right.md} || null
            ].filter(panel => panel)) || {right: 0};

            const footer = isFeatureGridOpen(store.getState()) && {bottom: getDockSize(store.getState()) * 100 + '%'} || {bottom: mapLayout.bottom.sm};

            const transform = isFeatureGridOpen(store.getState()) && {transform: 'translate(0, -' + mapLayout.bottom.sm + 'px)'} || {transform: 'none'};
            const height = {height: 'calc(100% - ' + mapLayout.bottom.sm + 'px)'};

            return Rx.Observable.of(updateMapLayout({
                ...leftPanels,
                ...rightPanels,
                ...footer,
                ...transform,
                ...height
            }));
        });

module.exports = {
    updateMapLayoutEpic
};
