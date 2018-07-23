/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withProps, compose} = require('recompose');
const withMapConnect = require('./withMapConnect');
/**
 * Viewport connection configuration support (for widget builders of charts, table, counter)
 *
 */
module.exports = compose(
    withProps(({ editorData = {} }) => ({
        canConnect: editorData.geomProp,
        connected: editorData.mapSync
    })),
    withMapConnect({viewport: "viewport", layers: "layers"})
);
