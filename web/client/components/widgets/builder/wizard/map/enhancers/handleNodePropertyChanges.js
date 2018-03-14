/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// handle property changes
const { withHandlers } = require('recompose');
const { findIndex } = require('lodash');
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
                    .filter(l => (l.group || "Default") === gid || (l.group || "").indexOf(`${gid}.`) === 0)
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
            }
});
