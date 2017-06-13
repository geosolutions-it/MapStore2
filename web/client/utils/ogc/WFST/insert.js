/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const optNameSpaceTag = (ns, key, content) => `<${ns ? ns + ":" + key : key}>${Array.isArray(content) ? content.join("") : content}</${ns ? ns + ":" + key : key}>`;
const attribute = optNameSpaceTag;
const feature = optNameSpaceTag;
const insert = (ns, content) => `<${ns}:Insert>${Array.isArray(content) ? content.join("") : content}</${ns}:Insert>`;

module.exports = {
    insert,
    feature,
    attribute
};
