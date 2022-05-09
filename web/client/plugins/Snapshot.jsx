/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { toggleControl } from '../actions/controls';
import {
    changeSnapshotState,
    onCreateSnapshot,
    onRemoveSnapshot,
    onSnapshotError,
    saveImage
} from '../actions/snapshot';
import SnapshotPanelComp from "../components/mapcontrols/Snapshot/SnapshotPanel";
import SnapshotQueueComp from "../components/mapcontrols/Snapshot/SnapshotQueue";
import snapshotReducers from '../reducers/snapshot';
import { layersSelector } from '../selectors/layers';
import { mapSelector } from '../selectors/map';
import { mapTypeSelector } from '../selectors/maptype';
import Message from './locale/Message';

const snapshotSelector = createSelector([
    mapSelector,
    mapTypeSelector,
    layersSelector,
    (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === "snapshot" || state.controls.snapshot && state.controls.snapshot.enabled,
    (state) => state.browser,
    (state) => state.snapshot || {queue: []}
], (map, mapType, layers, active, browser, snapshot) => ({
    map,
    mapType,
    layers,
    active,
    browser,
    snapshot
}));

const SnapshotPanel = connect(snapshotSelector, {
    onCreateSnapshot: onCreateSnapshot,
    onStatusChange: changeSnapshotState,
    downloadImg: saveImage,
    toggleControl: toggleControl.bind(null, 'snapshot', null)
})(SnapshotPanelComp);

const SnapshotPlugin = connect((state) => ({
    queue: state.snapshot && state.snapshot.queue || []
}), {
    downloadImg: saveImage,
    onSnapshotError,
    onRemoveSnapshot
})(SnapshotQueueComp);


export default {
    SnapshotPlugin: assign(SnapshotPlugin, {
        Toolbar: {
            name: 'snapshot',
            position: 8,
            panel: SnapshotPanel,
            help: <Message msgId="helptexts.snapshot"/>,
            tooltip: "snapshot.tooltip",
            icon: <Glyphicon glyph="camera"/>,
            wrap: true,
            title: "snapshot.title",
            exclusive: true,
            priority: 1
        },
        BurgerMenu: {
            name: 'snapshot',
            position: 3,
            panel: SnapshotPanel,
            text: <Message msgId="snapshot.title"/>,
            icon: <Glyphicon glyph="camera"/>,
            action: toggleControl.bind(null, 'snapshot', null),
            tools: [SnapshotPlugin],
            priority: 2
        },
        SidebarMenu: {
            name: 'snapshot',
            position: 3,
            panel: SnapshotPanel,
            text: <Message msgId="snapshot.title"/>,
            icon: <Glyphicon glyph="camera"/>,
            tooltip: "snapshot.tooltip",
            action: toggleControl.bind(null, 'snapshot', null),
            toggle: true,
            priority: 1
        }
    }),
    reducers: {
        snapshot: snapshotReducers
    }
};
