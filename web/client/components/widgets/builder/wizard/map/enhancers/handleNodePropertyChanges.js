/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// handle property changes

import { castArray, findIndex } from 'lodash';
import { withHandlers } from 'recompose';

import {belongsToGroup} from '../../../../../../utils/LayersUtils';

/**
 * Add to the TOC or the Node editor some handlers for TOC nodes
 * add to the wrapped component the following methods:
 *  - changeLayerProperty (id, key, value) - calls onChange on map.layers[index].key|maps[mapId].layers[index].key
 *  - changeLayerPropertyGroup (gid, key, value) - calls multiple times onChange
 *  - changeGroupProperty(gid, key, value) - calls onChange on map.groups[index].key|maps[mapId].groups[index].key
 *  - updateMapEntries(object) - calls multiple times onChange
 * These method will call the method `onChange` from props mapping accordingly
 * @prop {function} onChange callback with arguments : (path, value) -> path will be something like: `map.layers[2].title`|`maps[mapId].layers[2].title` or `map.groups[1].title`/`maps[mapId].groups[1].title`, `map[somethingElse]`|maps[mapId][somethingElse]
 */
const getMapPath = (map) => `${map.mapId ? `maps[${map.mapId}]` : 'map'}`;
export default withHandlers({
    /**
     * Changes the layer property
     */
    changeLayerProperty:
        ({ onChange = () => { }, map = {} }) =>
            (id, key, value) => {
                const index = findIndex(map.layers || [], {
                    id
                });
                onChange(`${getMapPath(map)}.layers[${index}].${key}`, value);
            },
    /**
     * Change layer properties by group
     *
     */
    changeLayerPropertyByGroup:
        ({ onChange = () => { }, map = {} }) =>
            (gid, key, value) =>
                map.layers
                    .filter(belongsToGroup(gid))
                    .map(({ id } = {}) => findIndex(map.layers || [], { id }))
                    .filter(i => i >= 0)
                    .map(index => onChange(`${getMapPath(map)}.layers[${index}].${key}`, value)),
    /**
     * Change group properties (expanded...)
     */
    changeGroupProperty:
        ({ onChange = () => { }, map = {} }) =>
            (id, key, value) => {

                const EXPANDED = 'expanded';
                const groups = map.groups ? castArray(map.groups) : [];
                const groupIndex = findIndex(groups, (group) => id === group.id);
                // if no group is found, then we add a new group
                let correctGroupIndex = groupIndex === -1 ? groups.length : groupIndex;

                if (key === EXPANDED && !groups?.[correctGroupIndex]?.id) {
                    // add id if missing
                    onChange(`${getMapPath(map)}.groups[${correctGroupIndex}].id`, id);
                }
                onChange(`${getMapPath(map)}.groups[${correctGroupIndex}].${key}`, value);
            },
    updateMapEntries: ({ onChange = () => { }, map = {} }) => (obj = {}, mode) => Object.keys(obj).map(k => onChange(`${getMapPath(map)}[${k}]`, obj[k], mode))
});
