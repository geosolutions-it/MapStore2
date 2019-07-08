/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {addProjection, Projection} from 'ol/proj';
export default {

    /**
    * function needed in openlayer for adding new projection
    */
    addProjections: function(code, extent, worldExtent, axisOrientation) {
        addProjection(new Projection({
                code,
                extent,
                worldExtent,
                axisOrientation
            })
        );
    }
};
