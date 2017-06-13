/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const filter = (ns = "ogc", content) => `<${ns}:Filter>${Array.isArray(content) ? content.join("") : content}</${ns}:Filter>`;
const fidFilter = (ns = "ogc", fid ) =>
    filter(ns, `<${ns}:FeatureId fid="${fid}"/>`);

module.exports = {
    fidFilter,
    filter
};
