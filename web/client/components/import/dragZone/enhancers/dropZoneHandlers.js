/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {compose, withHandlers} = require('recompose');
/**
 * Enhancer that provides a method to open file system browser of the dropzone.
 * @memberof components.import.dragZone.enhancers
 * @function
 *
 */
module.exports = compose(
    withHandlers( () => {
        let dropZone = null;
        return {
            onRef: () => (ref) => (dropZone = ref),
            openFileDialog: () => () => dropZone.open()
        };
    })
);
