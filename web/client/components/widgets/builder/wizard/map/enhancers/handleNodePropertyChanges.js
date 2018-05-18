/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// handle property changes
const { withHandlers } = require('recompose');
const {belongsToGroup} = require('../../../../../../utils/LayersUtils');
const { findIndex } = require('lodash');
/**
 * Add to the TOC or the Node editor some handlers for TOC nodes
 * add to the wrapped component the following methods:
 *  - changeLayerProperty (id, key, value) - calls onChange on map.layers[index].key
 *  - changeLayerPropertyGroup (gid, key, value) - calls multiple times onChange
 *  - changeGroupProperty(gid, key, value) - calls onChange on map.groups[index].key
 *  - updateMapEntries(object) - calls multiple times onChange
 * These method will call the method `onChange` from props mapping accordingly
 * @prop {function} onChange callback with arguments : (path, value) -> path will be something like: `map.layers[2].title` or `map.groups[1].title`, `map[somethingElse]`
 */
module.exports = withHandlers({
    /**
     * Changes the layer property
     */
    changeLayerProperty:
        ({ onChange = () => { }, map = {} }) =>
            (id, key, value) => {
                const index = findIndex(map.layers || [], {
                    id
                });
                onChange(`map.layers[${index}].${key}`, value);
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
                    .map(index => onChange(`map.layers[${index}].${key}`, value)),
    /**
     * Change group properties (expanded...)
     */
    changeGroupProperty:
        ({ onChange = () => { }, map = [] }) =>
            (id, key, value) => {
                const index = findIndex(map.groups || [], {
                    id
                });
                onChange(`map.groups[${index}].${key}`, value);
            },
    updateMapEntries: ({ onChange = () => { } }) => (obj = {}) => Object.keys(obj).map(k => onChange(`map[${k}]`, obj[k]))
});
