/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const bbox = require('@turf/bbox');
const {withHandlers} = require('recompose');

/**
 * Adds a zoomToFeature handler that transforms the `currentFeature` property (array of features) into an extent, cleaning up missing geometries, triggers the callback
 * `zoomToExtent` (action) with the calculated extent and crs found in `currentFeatureCrs`.
 * Used for the identify zoomToFeature functionality.
 */
module.exports = withHandlers({
    zoomToFeature: ({ zoomToExtent = () => {}, currentFeature = [], currentFeatureCrs: crs }) => () => {
        // zoom only to features that has some geometry (featureInfo returns features with no geometry for raster data).
        // layer groups may have both features with no geometry and with geometry.
        const zoomFeatures = currentFeature.filter(({ geometry }) => !!geometry);
        if (zoomFeatures.length > 0) {
            const extent = bbox({
                type: "FeatureCollection",
                features: zoomFeatures
            });
            if (extent) {
                zoomToExtent(extent, crs);
            }
        }
    }
});
