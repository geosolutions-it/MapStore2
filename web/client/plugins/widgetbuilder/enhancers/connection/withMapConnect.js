/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withHandlers, withProps, compose} = require('recompose');

/**
 * Provides proper handlers and variables to connect a widget from a builder. Requires:
 *  - editorData object
 *  - toggleConnection
 * @param {object} mappings argument for the toggleConnection options
 */
module.exports = (mappings) => withHandlers({
    toggleConnection: ({ toggleConnection = () => { }, editorData = {}}) =>
        (available = []) => toggleConnection(!editorData.mapSync, available, {
            dependenciesMap: editorData.dependenciesMap,
            mappings
        })
});
