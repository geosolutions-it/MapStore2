/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const propertyChange = (ns, propName, value) => `<${ns}:Property>`
  + `<${ns}:Name>${propName}</${ns}:Name>`
  + `<${ns}:Value>${value}</${ns}:Value>`
  + `</${ns}:Property>`;

/**
 * Generate update XML.
 * @function
 * @param  {string} content                the properties to update and/or features to use (inXML)
 * @param  {object} describeFeatureType describeFeatureType object
 * @return {string}                     the XML for the update
 */
const update = (wfsNs, typeName, content) => `<${wfsNs}:Update typeName="${typeName}">${Array.isArray(content) ? content.join("") : content}</wfs:Update>`;
module.exports = {
    update,
    propertyChange
};
