/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const projUtils = {

    /**
    * function needed in openlayer for adding new projection
    */
    addProjections: function(ol, code, extent, worldExtent, axisOrientation) {
        ol.proj.addProjection(new ol.proj.Projection({
                code,
                extent,
                worldExtent,
                axisOrientation
            })
        );
    }
};

module.exports = projUtils;
