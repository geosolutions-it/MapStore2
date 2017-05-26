/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {head, get} = require('lodash');
const {processOGCGeometry} = require("../GML");
/**
 * Retrives the descriptor for a property in the describeFeatureType (supports single featureTypes)
 * @memberof utils.ogc.WFS
 * @param  {string} propName            the name of the property to get
 * @param  {object} describeFeatureType the describeFeatureType object
 * @return {object}                     the property descriptor
 */
const getPropertyDesciptor = (propName, describeFeatureType) =>
    head(
        get(describeFeatureType, "featureTypes[0].properties").filter(d => d.name === propName)
    );
/**
 * @name schemaLocation
 * @memberof utils.ogc.WFS
 * @param  {object} describeFeatureType schemaLocation
 * @return {string}   url of the schemaLocation
 */
const schemaLocation = (d) => d.targetNamespace;

/**
 * Base utilities for WFS.
 * @name WFS
 * @memberof utils.ogc
 */
module.exports = {
    schemaLocation,
    /**
     * retrieves the featureTypeSchema entry for XML from describeFeatureType
     * @param  {object} d describeFeatureType
     * @return {string}   the attribute. e.g. xmlns:topp="http://example.com/topp"
     */
    featureTypeSchema: (d) => `xmlns:${d.targetPrefix}="${schemaLocation(d)}"`,
    /**
     * Retrieve the value of the feature in GeoJSON to output the Geometry
     * @param  {object|number|string} value               the value
     * @param  {string} key                 the attribute name
     * @param  {object} describeFeatureType the describeFeatureType object
     * @return {string}                     the attribute value or a gml geometry
     */
    getValue: (value, key, describeFeatureType, version = "1.1.0") => {
        // TODO implement normal attributes;
        const isGeometryType = getPropertyDesciptor(key, describeFeatureType).type.indexOf("gml:") === 0;
        if (isGeometryType) {
            return processOGCGeometry(version, {
                    type: value.type,
                    coordinates: value.coordinates
              });
        }
        return value;
    },
    getPropertyDesciptor,
    /**
     * retrives the featureTypeName from the describeFeatureType json object.
     * It prepends the targetPrefix to the first typename found in the featureTypes array.
     * Doesn't support multiple feature types
     * @param  {object} describeFeatureType the json object for describeFeatureType
     * @return {string} the prefixed typenName
     * @example
     * getTypeName({targetPrefix: "topp",featureTypes: [{typeName: "states"}]); // --> topp:states
     */
    getTypeName: (dft) => dft.targetPrefix ? dft.targetPrefix + ":" + dft.featureTypes[0].typeName : dft.featureTypes[0].typeName,
    processOGCGeometry
};
