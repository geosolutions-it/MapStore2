/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withHandlers} = require('recompose');

/**
 * Adapter that transforms toggleConnection callback arguments into the toggleConnection action arguments
 *
 * @param {object} mappings argument for the toggleConnection options
 */
module.exports = (mappings) => withHandlers({
    toggleConnection: ({ toggleConnection = () => { }, editorData = {}}) =>
        (available = []) => toggleConnection(!editorData.mapSync, available, {
            dependenciesMap: editorData.dependenciesMap,
            mappings,
            sourceWidgetType: editorData.widgetType
        })
});
