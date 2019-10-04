/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const {fidFilter} = require('../Filter/base');
/**
 * Generate WFS delete features
 * @function
 * @param  {string} content             The content of the delete request, e.g. the filter to use
 * @param  {object} describeFeatureType describeFeatureType object
 * @return {string}                     the XML for the update
 */
const deleteFeaturesByFilter = (ns, content, typeName) =>
    `<${ns}:Delete typeName="${typeName}">${content}</${ns}:Delete>`;
const deleteById = (ns, fid, typeName) => deleteFeaturesByFilter(ns, fidFilter("ogc", fid), typeName);
const deleteFeature = (ns, feature, typeName) => deleteById(ns, feature.features && feature.features.length === 1 ? feature.features[0].id : feature.id, typeName);
module.exports = {
    deleteFeaturesByFilter,
    deleteById,
    deleteFeature
};
