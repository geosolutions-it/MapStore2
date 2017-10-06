/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const CoordinatesUtils = require('./CoordinatesUtils');
const {isString, isArray, isObject, head, slice} = require('lodash');

const WMTSUtils = {
    getDefaultMatrixId: (options) => {
        let matrixIds = new Array(30);
        for (let z = 0; z < 30; ++z) {
            // generate matrixIds arrays for this WMTS
            matrixIds[z] = options.tileMatrixPrefix + z;
        }
        return matrixIds;
    },
    getMatrixIds: (matrix, srs) => {
        return ((isObject(matrix) && isArray(matrix[srs]) && matrix[srs]) || (isArray(matrix) && matrix) || []).map((el) => el.identifier);
    },
    limitMatrix: (matrix, len) => {
        if (matrix.length > len) {
            return slice(matrix, 0, len);
        }
        if (matrix.length < len) {
            return matrix.concat(new Array(len - matrix.length));
        }
        return matrix;
    },
    getTileMatrixSet: (tileMatrixSet, srs, allowedSRS, matrixIds = {}, defaultMatrix = srs) => {
        if (tileMatrixSet && isString(tileMatrixSet)) {
            return tileMatrixSet;
        }
        if (tileMatrixSet) {
            return CoordinatesUtils.getEquivalentSRS(srs, allowedSRS).reduce((previous, current) => {
                if (isArray(tileMatrixSet)) {
                    const matching = head(tileMatrixSet.filter((matrix) => ((matrix["ows:Identifier"] === current || CoordinatesUtils.getEPSGCode(matrix["ows:SupportedCRS"]) === current) && matrixIds[matrix["ows:Identifier"]])));
                    return matching && matching["ows:Identifier"] ? matching["ows:Identifier"] : previous;
                } else if (isObject(tileMatrixSet)) {
                    return tileMatrixSet[current] || previous;
                }
                return previous;
            }, defaultMatrix);
        }

        return defaultMatrix;
    }
};


module.exports = WMTSUtils;
