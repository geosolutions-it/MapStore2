/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const CoordinatesUtils = require('./CoordinatesUtils');
const { isString, isArray, isObject, head, castArray, slice, sortBy } = require('lodash');

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
        return ((isObject(matrix) && isArray(matrix[srs]) && matrix[srs]) || (isArray(matrix) && matrix) || []);
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
     * If requestEncoding is KVP uses GetTileURL, otherwise (RESTful) uses ResourceURL or GetTileURL
     */
    getGetTileURL: ({ ResourceURL, GetTileURL, requestEncoding } = {}) => {
        if (requestEncoding === "KVP") {
            return GetTileURL;
        }
        return ResourceURL
            // TODO: support for multiple URLs
            && castArray(ResourceURL).map(({ $ = {} }) => $.template || $.value)
            || GetTileURL;
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
    getDefaultFormat: layer => head(castArray(layer.Format)),
    /**
     * This avoid https://openlayers.org/en/v5.3.0/doc/errors/#17 in case the scale tilematrix
     * is not naturally sorted by scale denominator.
     * for instance https://wxs.ign.fr/choisirgeoportail/geoportail/wmts
     */
    sortTileMatrix: (tileMatrixSet, ids)  => {
        if (!tileMatrixSet) {
            return tileMatrixSet;
        }
        return {
            ...tileMatrixSet,
            TileMatrix:
                // sort by scale denominator, decendent
                sortBy(tileMatrixSet?.TileMatrix
                    .map(t => ({ ...t, ScaleDenominator: Number(t.ScaleDenominator) })), "ScaleDenominator"
                )
                    .reverse()
                    // return only the Ids allowed to match array indexes
                    .filter(t => ids ? ids.map(({ identifier } = {}) => identifier).indexOf(t["ows:Identifier"]) >= 0 : true)
        };
    },
    /**
     * Parse layer options to get back the tile matrix sub-set that can be used.
     * This allows to have matrixIds and tileMatrixSet correctly sorted and filtered to match
     */
    getTileMatrix: (options, srs) => {
        const tileMatrixSetName = WMTSUtils.getTileMatrixSet(options.tileMatrixSet, srs, options.allowedSRS, options.matrixIds);
        const ids = options.matrixIds && WMTSUtils.getMatrixIds(options.matrixIds, tileMatrixSetName || srs);
        const tileMatrixSet = WMTSUtils.sortTileMatrix(
            head(options.tileMatrixSet.filter(tM => tM['ows:Identifier'] === tileMatrixSetName)),
            ids);
        // identifiers are in the same order of scales and resolutions

        const identifiers = tileMatrixSet?.TileMatrix.map?.(t => t["ows:Identifier"]);
        // use same order of matrixIds in TileMatrix, if present.
        const matrixIds = identifiers && ids
            ? ids.sort((a, b) => {
                return identifiers.indexOf(a.identifier) - identifiers.indexOf(b.identifier);
            })
            : ids;
        return {
            matrixIds,
            tileMatrixSetName,
            tileMatrixSet: tileMatrixSet
        };
    }
};


module.exports = WMTSUtils;
