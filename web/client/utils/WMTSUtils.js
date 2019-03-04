/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const CoordinatesUtils = require('./CoordinatesUtils');
const {isString, isArray, isObject, head, castArray, slice } = require('lodash');

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
    },
    /**
     * Returns the first  available requestEncoding from the JSON
     */
    getRequestEncoding: json => {
        const operations = WMTSUtils.getOperations(json);
        return WMTSUtils.getOperation(operations, "GetTile", "KVP") ? "KVP" : WMTSUtils.getOperation(operations, "GetTile", "RESTful") && "RESTful";
    },
    getOperations: (json = {}) => castArray(json.Capabilities["ows:OperationsMetadata"]["ows:Operation"]),
    /**
     * gets the first operation of the type and with the name provided from the 'Operations' array of the WMTS Capabilities json parsed object
     */
    getOperation: (operations, name, type) => {
        return head(
            castArray(head(
                operations
                    .filter((operation) => operation.$.name === name)
                    .map((operation) => castArray(operation["ows:DCP"]["ows:HTTP"]["ows:Get"]))
            ) || [])
            .filter((request) => (request["ows:Constraint"] && request["ows:Constraint"]["ows:AllowedValues"]["ows:Value"]) === type)
            .map((request) => request.$["xlink:href"])
        );
    },
    /**
     * Returns the GetTile Url from the record. This allows to get to get the proper
     * url template.
     * If ResourceURL is not present it uses GetTileURL
     */
    getGetTileURL: (record = {}) => {
        return record.ResourceURL
                // TODO: support for multiple URLs
                && castArray(record.ResourceURL).map(({$ = {}}) => $.template || $.value)
                || record.GetTileURL;
    },
    /**
     * Returns the the original capabilities. if not present, try returns the GetTileURL.
     * This is also a useful identifier for the source.
     */
    getCapabilitiesURL: (record = {}) => {
        return head(castArray(record.capabilitiesURL || record.GetTileURL));
    },
    /**
     * Gets the default style for the WMTS Capabilities Layer entry
     * @param {object} layer the layer object of the WMTSCapabilities
     * @return {string} the identifier of the default style
     */
    getDefaultStyleIdentifier: layer => head(
        castArray(layer.Style)
            // default is identified by XML attribute isDefault
            .filter(({ $ = {} }) => $.isDefault === "true")
            // the identifier content value is needed
            .map(l => l["ows:Identifier"])
    ),
    /**
     * gets the first format available in the list
     */
    getDefaultFormat: layer => head(castArray(layer.Format))
};


module.exports = WMTSUtils;
