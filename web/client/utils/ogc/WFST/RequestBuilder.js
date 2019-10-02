/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {get} = require('lodash');
const {insert, feature, attribute} = require('./insert');
const {transaction} = require('./transaction');
const {deleteFeaturesByFilter, deleteFeature} = require('./delete');
const {update, propertyChange} = require('./update');
const {getPropertyDesciptor, getValue, findGeometryProperty, featureTypeSchema} = require("../WFS/base");
const wfsRequestBuilder = require('../WFS/RequestBuilder');

const mergeArray = (e, arr2) => arr2 && arr2.length > 0 ? [e, ...arr2] : e;
const WFSVersionNotSupportedException = function(wfsVersion) {
    this.version = wfsVersion;
};
const getTypeName = dft => get(dft, "featureTypes[0].typeName");
const getFullQualifiedTypeName = dft => dft.targetPrefix ? `${dft.targetPrefix}:${getTypeName(dft)}` : getTypeName(dft);
const getGeometryName = (f, describe) => f.geometry_name || findGeometryProperty(describe).name;
const getPropertyName = (name, describe) => name === "geometry" || name === getGeometryName({}, describe) ? getGeometryName({}, describe) : name;
/**
 * RequestBuilder for WFS-T. Returns the proper method to create request bodies
 * @memberof utils.ogc.WFST
 * @name RequestBuilder
 * @augments utils.ogc.WFS.RequestBuilder
 * @param  {object} describe  the describeFeatureType object, json format
 * @param  {object} [options] by default wfsVersion="1.1.0" wfsNS="wfs"
 * @return {object}           the RequestBuilder for WFS-T
 * @example
 * const {transaction, update, insert, filter, property, propertyChange} = requestBuilder(myDescribeFT);
 * transaction(
 *  update([
 *      propertyChange("p1", "v1_new"),
 *      filter(property("p1").equalTo("v1_old"))
 *  ])
 * )
 * @prop {function} insert return the insert operation
 * ```
 * insert(features) // can get both array or FeatureCollection as parameter.
 * insert(f1, f2) // also listing arguments is allowed
 * ```
 * @prop {function} update return the property update. can contain propertyChange or filter (1 only).
 * ```
 * update(propertyChange("a","b"), filter(property("a").equalTo("a"))
 * ```
 * @prop {function} deleteByFilter returns the delete with filter.
 * ```
 * deleteByFilter(filter(property("a").equalTo("a")))
 * ```
 * @prop {function} propertyChange create a propertyChange entry
 * ```
 * propertyChange("p", 2) // <Property><Name>p</Name><Value>2</Value></Property>
 * ```
 */
module.exports = function(describe, {wfsVersion = "1.1.0", wfsNS = "wfs", ...other} = {}) {
    if (wfsVersion !== "1.1.0") {
        throw new WFSVersionNotSupportedException(wfsVersion);
    }
    const toFeature = (f) => feature( describe.targetPrefix, getTypeName(describe), Object.keys(f.properties || [])
        .filter(k => getPropertyDesciptor(k, describe))
        .map((key) => attribute(describe.targetPrefix, key, getValue(f.properties[key], key, describe)))
        .concat(f.geometry ? attribute(describe.targetPrefix, getGeometryName(f, describe), getValue(f.geometry, getGeometryName(f, describe), describe) ) : [])
    );
    const toFeatures = (f) => f.features ? f.features.map(toFeature) : toFeature(f);
    return {
        ...wfsRequestBuilder({...other, wfsVersion, wfsNS}),
        insert: (features, ...rest) => insert(wfsNS,
            Array.isArray(mergeArray(features, rest)) ? mergeArray(features, rest).map(toFeatures) : toFeatures(features)
        ),
        /**
         * Returns the name of the attribute for the name of the geoJSON entry. This means that it translates "geometry" into the correct geometry name
         * @param  {string} name The name of the geoJSON attribute, or "geometry"
         * @return {string}      The original attribute name
         */
        getPropertyName: (name) => getPropertyName(name, describe),
        deleteByFilter: (filter) => deleteFeaturesByFilter(wfsNS, filter, getFullQualifiedTypeName(describe)),
        deleteFeature: (f) => deleteFeature(wfsNS, f, getFullQualifiedTypeName(describe)),
        update: (content, ...rest) => update(wfsNS, getFullQualifiedTypeName(describe), mergeArray(content, rest) ),
        propertyChange: (name, value) => propertyChange(wfsNS, name, getValue(value, name, describe)),
        transaction: (content, ...rest) => transaction(mergeArray(content, rest), featureTypeSchema(describe), wfsVersion, wfsNS)
    };
};
