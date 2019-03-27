/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const getAttributeName = (k, d) => d.targetPrefix ? d.targetPrefix + ":" + k : k;
const {getValue, getTypeName, getPropertyDesciptor, findGeometryProperty} = require("../../WFS/base");

const attribute = (key, value) => `<${key}>${value}</${key}>`;
const attributes = (f, describeFeatureType) =>
    Object.keys(f.properties || [])
        .filter(k => getPropertyDesciptor(k, describeFeatureType))
        .map((key) => attribute(getAttributeName(key, describeFeatureType), getValue(f.properties[key], key, describeFeatureType)));
const geometryAttribute = (f, describeFeatureType) =>
    attribute(getAttributeName(f.geometry_name || findGeometryProperty(describeFeatureType).name, describeFeatureType), getValue(f.geometry, f.geometry_name, describeFeatureType));

const feature = (f, describeFeatureType) => `<${getTypeName(describeFeatureType)}>`
    + (attributes(f, describeFeatureType)
        .concat(geometryAttribute(f, describeFeatureType))
    ).join("")
    + `</${getTypeName(describeFeatureType)}>`;
const features = (fs, describeFeatureType) => fs.map(f => feature(f, describeFeatureType)).join("");

const insert = (fs, describeFeatureType) => '<wfs:Insert>'
    + `${features(fs.features || fs, describeFeatureType)}`
    + '</wfs:Insert>';

module.exports = {
    insert,
    feature
};
