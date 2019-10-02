/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {getTypeName} = require("../../WFS/base");

const property = (propName, value) => '<wfs:Property>'
  + `<wfs:Name>${propName}</wfs:Name>`
  + `<wfs:Value>${value}</wfs:Value>`
  + '</wfs:Property>';

/**
 * Generate update XML.
 * @function
 * @param  {string} content                the properties to update and/or features to use (inXML)
 * @param  {object} describeFeatureType describeFeatureType object
 * @return {string}                     the XML for the update
 */
const update = (content, describeFeatureType) => `<wfs:Update typeName="${getTypeName(describeFeatureType)}">${Array.isArray(content) ? content.join("") : content}</wfs:Update>`;
module.exports = {
    update,
    property
};
