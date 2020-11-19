/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { withProps, compose } from 'recompose';

/**
 * Enhancer for MapBuilder to allow connection configuration.
 *
 */
export default compose(
    withProps(({ availableDependencies = [], editorData = {}} = {}) => ({
        availableDependencies: availableDependencies.filter(d => !(editorData.id && d.indexOf(editorData.id) >= 0))
    })),
    withProps(({ editorData = {}, availableDependencies = []}) => ({
        canConnect: availableDependencies.length > 0,
        connected: !!editorData.mapSync
    }))
);
