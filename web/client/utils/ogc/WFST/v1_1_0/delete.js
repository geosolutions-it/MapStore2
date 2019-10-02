/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const {fidFilter} = require('../../Filter/base');
const {getTypeName} = require('../../WFS/base');
/**
 * Generate WFS delete features
 * @function
 * @param  {string} content             The content of the delete request, e.g. the filter to use
 * @param  {object} describeFeatureType describeFeatureType object
 * @return {string}                     the XML for the update
 */
const deleteFeaturesByFilter = (content, typeName) =>
    `<wfs:Delete typeName="${typeName}">${content}</wfs:Delete>`;
const deleteById = (fid, typeName) => deleteFeaturesByFilter(fidFilter("ogc", fid), typeName);
const deleteFeature = (feature, describe) => deleteById(feature.features && feature.features.length === 1 ? feature.features[0].id : feature.id, getTypeName(describe));
module.exports = {
    deleteFeaturesByFilter,
    deleteById,
    deleteFeature
};
