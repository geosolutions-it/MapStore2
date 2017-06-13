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


const WFSVersionNotSupportedException = function(wfsVersion) {
    this.version = wfsVersion;
};
const getTypeName = dft => get(dft, "featureTypes[0].typeName");
const getFullQualifiedTypeName = dft => dft.targetPrefix ? `${dft.targetPrefix}:${getTypeName(dft)}` : getTypeName(dft);
const getGeometryName = (f, describe) => f.geometry_name || findGeometryProperty(describe).name;
/**
 * RequestBuilder for WFS-T. Returns the proper method to create request bodies
 * @augments utils.WFS.RequestBuilder
 * @param  {object} describe  the describeFeatureType object, json format
 * @param  {object} [options] by default wfsVersion="1.1.0" wfsNS="wfs"
 * @return {object}           the RequestBuilder for WFS-T
 */
module.exports = function(describe, {wfsVersion = "1.1.0", wfsNS="wfs", ...other} = {}) {
    if (wfsVersion !== "1.1.0") {
        throw new WFSVersionNotSupportedException(wfsVersion);
    }
    const toFeature = (f) => feature( describe.targetPrefix, getTypeName(describe), Object.keys(f.properties || [])
            .filter(k => getPropertyDesciptor(k, describe))
            .map((key) => attribute(describe.targetPrefix, key, getValue(f.properties[key], key, describe)))
            .concat(attribute(describe.targetPrefix, getGeometryName(f, describe), getValue(f.geometry, getGeometryName(f, describe), describe) ))
            );
    const toFeatures = (f) => f.features ? f.features.map(toFeature) : toFeature(f);
    return {
        ...wfsRequestBuilder({...other, wfsVersion, wfsNS}),
        /**
         * Create an Insert request body for the given features
         * @param  {array|object} features The features to insert
         * @return {string}          the request body
         */
        insert: (features) => insert(wfsNS,
            Array.isArray(features) ? features.map(toFeature) : toFeatures(features)
        ),
        /**
         * Create a delete request body for the given features
         * @param  {array|string} filter The filter to use for delete
         * @return {string}       the request body of the request
         */
        deleteByFilter: (filter) => deleteFeaturesByFilter(wfsNS, filter, getFullQualifiedTypeName(describe)),
        /**
         * Create a delete request for a specific feature using the Id of the feature. It requires the feature id is unique
         * @param  {object} f the feature
         * @return {string}   the body of the request
         */
        deleteFeature: (f) => deleteFeature(wfsNS, f, getFullQualifiedTypeName(describe)),
        /**
         * Wraps the given content into an update
         * @param {string} content the property changes and filter to use
         * @return {string}   the body of the request
         */
        update: update.bind(null, wfsNS, getFullQualifiedTypeName(describe)),
        /**
         * Create a property change entry
         * @type {[type]}
         */
        propertyChange: propertyChange.bind(null, wfsNS),
        /**
         * Wraps the given content into a tranaction object
         * @param  {[type]} content [description]
         * @return {[type]}         [description]
         */
        transaction: (content) => transaction(content, featureTypeSchema(describe), wfsVersion, wfsNS)
    };
};
