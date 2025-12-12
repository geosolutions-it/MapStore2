/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import head from 'lodash/head';
import get  from 'lodash/get';
export {processOGCGeometry} from "../GML";
import {processOGCGeometry} from "../GML";
import { notPrimaryGeometryFields } from '../../FeatureTypeUtils';
/**
 * Base utilities for WFS.
 * @name WFS
 * @memberof utils.ogc
 * @module
 */


// TODO missing escape of cdata entries (you should split the ]]> and put the two parts of it in adjacent CDATA sections).
// e.g.
// <![CDATA[Certain tokens like ]]> can be difficult and <invalid>]]>
// should be written as
// <![CDATA[Certain tokens like ]]]]><![CDATA[> can be difficult and <valid>]]>
const toCData = (value) => /[<>&'"]/.test(value) ? `<![CDATA[${value}]]>` : value;

const WFS_TO_GML = {
    "1.0.0": "2.0",
    "1.1.0": "3.1.1",
    "2.0": "3.2",
    "2.0.0": "3.2"
};
/**
 * retrieve default GML version from WFS version
 * @param  {string} v WFS version
 * @return {string}   GML version
 */
export const wfsToGmlVersion = (v = "1.1.0") => WFS_TO_GML[v];
/**
 * Provides the array of featureType properties
 * @param  {object} describeFeatureType the describeFeatureType object
 * @return {object[]}                     The array of featuretypes properties
 */
export const getFeatureTypeProperties = (describeFeatureType) => get(describeFeatureType, "featureTypes[0].properties");

export const isGeometryType = (pd) => pd.type.indexOf("gml:") === 0 || pd.type === "xsd:Geometry" || !!(notPrimaryGeometryFields[pd.type]);
/**
 * Provides the first geometry type found
 * @param  {object} describeFeatureType the describeFeatureType object
 * @return {object}                     the featureType property
 */
export const findGeometryProperty = (describeFeatureType) => head((getFeatureTypeProperties(describeFeatureType) || []).filter( isGeometryType ));
/**
 * Retrives the descriptor for a property in the describeFeatureType (supports single featureTypes)
 * @memberof utils.ogc.WFS
 * @param  {string} propName            the name of the property to get
 * @param  {object} describeFeatureType the describeFeatureType object
 * @return {object}                     the property descriptor
 */
export const getPropertyDescriptor = (propName, describeFeatureType) =>
    head(
        (getFeatureTypeProperties(describeFeatureType) || []).filter(d => d.name === propName)
    );
/**
 * @name schemaLocation
 * @memberof utils.ogc.WFS
 * @param  {object} describeFeatureType schemaLocation
 * @return {string}   url of the schemaLocation
 */
export const schemaLocation = (d) => d.targetNamespace;
export const isValidValue = (v, pd) =>
    pd === undefined
    || pd === null
    || pd && pd.nillable === true
    || pd && pd.nillable === false && v !== undefined && v !== null; // TODO validate type
export const isValidProperty = ({geom, properties} = {}, pd) => isValidValue(isGeometryType(pd) ? geom : properties[pd.name], pd);

/**
 * retrieves the featureTypeSchema entry for XML from describeFeatureType
 * @param  {object} d describeFeatureType
 * @return {string}   the attribute. e.g. xmlns:topp="http://example.com/topp"
 */
export const featureTypeSchema = (d) => `xmlns:${d.targetPrefix}="${schemaLocation(d)}"`;
/**
 * Retrieve the value of the feature in GeoJSON to output the Geometry
 * @param  {object|number|string} value               the value
 * @param  {string} key                 the attribute name
 * @param  {object} describeFeatureType the describeFeatureType object
 * @return {string}                     the attribute value or a gml geometry
 */
export const getValue = (value, key, describeFeatureType, version = "1.1.0") => {
    // TODO implement normal attributes;
    const isGeom = isGeometryType(getPropertyDescriptor(key, describeFeatureType));
    if (isGeom) {
        return value ? processOGCGeometry(version, {
            type: value.type,
            coordinates: value.coordinates
        }) : "";
    }
    if (value === null || value === undefined) {
        return "";
    } if (typeof value === 'string') {
        return toCData(value);
    }
    return value;
};

/**
 * retrieves the featureTypeName from the describeFeatureType json object.
 * It prepends the targetPrefix to the first typename found in the featureTypes array.
 * Doesn't support multiple feature types
 * @param  {object} describeFeatureType the json object for describeFeatureType
 * @return {string} the prefixed typenName
 * @example
 * getTypeName({targetPrefix: "topp",featureTypes: [{typeName: "states"}]}); // --> topp:states
 */
export const getTypeName = (dft) => dft.targetPrefix ? dft.targetPrefix + ":" + dft.featureTypes[0].typeName : dft.featureTypes[0].typeName;

export const isValid = (f, describe) => getFeatureTypeProperties(describe).map( pd => isValidProperty(f, pd));
export const isValidValueForPropertyName = (v, name, desc) => isValidValue(v, getPropertyDescriptor(name, desc));


/**
 * Gets all properties that are not a geometry
 * @param {object} describeFeatureType the describeFeatureType object
 * @return {object[]} the featureType properties
 * @example
 * describeFeatureType: {
 *   featureTypes: [{
 *     properties:[{
 *       localType: "string",
 *       maxOccurs: 1,
 *       minOccurs: 0,
 *       name: "id",
 *       nillable: true,
 *       type: "xsd:string"
 *     }]
 * }]
 */
export const findNonGeometryProperty = (describeFeatureType) => (getFeatureTypeProperties(describeFeatureType) || []).filter( d => !isGeometryType(d));
