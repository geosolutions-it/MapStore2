
/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import join from 'lodash/join';
import isEmpty from 'lodash/isEmpty';
import { reprojectBbox, getViewportGeometry } from '../../../utils/CoordinatesUtils';
/**
 * Given an extent it returns a GeoJSON MultiPolygon feature
 * @param {string} extent `minx,miny,maxx,maxy` or `aMinx,aMiny,aMaxx,aMaxy,bMinx,bMiny,bMaxx,bMaxy` incase of split extent (international date line)
 * @return {object} GeoJSON MultiPolygon feature
 */
export const getFeatureFromExtent = (extent = '') => {
    const [
        aMinx, aMiny, aMaxx, aMaxy,
        bMinx, bMiny, bMaxx, bMaxy
    ] = extent
        .split(',')
        .map((val) => parseFloat(val));
    return {
        type: 'Feature',
        geometry: {
            type: 'MultiPolygon',
            coordinates: [
                [
                    [
                        [aMinx, aMiny],
                        [aMinx, aMaxy],
                        [aMaxx, aMaxy],
                        [aMaxx, aMiny],
                        [aMinx, aMiny]
                    ]
                ],

                ...(bMinx !== undefined && bMiny !== undefined && bMaxx !== undefined && bMaxy !== undefined
                    ?

                    [
                        [
                            [
                                [bMinx, bMiny],
                                [bMinx, bMaxy],
                                [bMaxx, bMaxy],
                                [bMaxx, bMiny],
                                [bMinx, bMiny]
                            ]
                        ]
                    ]

                    : [])]

        },
        properties: {}
    };
};

/**
 * Given a bounds { minx, miny, maxx, maxy } and a crs return the extent param as string
 * @param {object} bounds { minx, miny, maxx, maxy }
 * @param {string} fromCrs bound projection
 * @return {string} extent param
 */
export const boundsToExtentString = (bounds, fromCrs) => {
    const { extent } = getViewportGeometry(bounds, fromCrs);
    const extents = extent.length === 2
        ? extent
        : [ extent ];
    const reprojectedExtents = fromCrs === 'EPSG:4326'
        ? extents
        : extents.map(ext => reprojectBbox(ext, fromCrs, 'EPSG:4326'));
    return join(reprojectedExtents.map(ext => join(ext.map((val) => val.toFixed(4)), ',')), ',');
};

/**
 * Get adjusted extent.
 * When max extent [-180, -90, 180, 90] of EPSG:4326 is reprojected to EPSG:3857
 * the result is [0,0,0,0], hence adjusting by minor fraction
 * will give us correct extent when reprojected
 * @param {number[]} bounds
 * @param {string} source projection
 * @param {string} destination projection
 * @returns {number[]} adjusted extent with projections
 */
export const getAdjustedExtent = (bounds, source = "EPSG:4326", dest = "EPSG:3857") => {
    let adjustedExtent = bounds;
    if (!isEmpty(bounds) && source === "EPSG:4326" && dest === "EPSG:3857") {
        let extent = bounds.map(e => Number(e));
        const fractionCorrection = 0.000001;
        if (extent[0] <= -180 && extent[1] <= -90 && extent[2] >= 180 && extent[3] >= 90) {
            adjustedExtent = [extent[0], extent[1] + fractionCorrection, extent[2], extent[3] - fractionCorrection];
        }
    }
    return adjustedExtent;
};
