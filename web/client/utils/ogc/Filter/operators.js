/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ogcComparisonOperators = {
        "=": (ns, content) => `<${ns}:PropertyIsEqualTo>${content}</${ns}:PropertyIsEqualTo>`,
        ">": (ns, content) => `<${ns}:PropertyIsGreaterThan>${content}</${ns}:PropertyIsGreaterThan>`,
        "<": (ns, content) => `<${ns}:PropertyIsLessThan>${content}</${ns}:PropertyIsLessThan>`,
        ">=": (ns, content) => `<${ns}:PropertyIsGreaterThanOrEqualTo>${content}</${ns}:PropertyIsGreaterThanOrEqualTo>`,
        "<=": (ns, content) => `<${ns}:PropertyIsLessThanOrEqualTo>${content}</${ns}:PropertyIsLessThanOrEqualTo>`,
        "<>": (ns, content) => `<${ns}:PropertyIsNotEqualTo>${content}</${ns}:PropertyIsNotEqualTo>`,
        "><": (ns, content) => `<${ns}:PropertyIsBetween>${content}</${ns}:PropertyIsBetween>`,
        "like": (ns, content) => `<${ns}:PropertyIsLike matchCase="true" wildCard="*" singleChar="." escapeChar="!">${content}</${ns}:PropertyIsLike>`,
        "ilike": (ns, content) => `<${ns}:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!">${content}</${ns}:PropertyIsLike>`,
        "isNull": (ns, content) => `<${ns}:PropertyIsNull>${content}</${ns}:PropertyIsNull>`
    };
const ogcLogicalOperators = {
        "AND": (ns, content) => `<${ns}:And>${content}</${ns}:And>`,
        "OR": (ns, content) => `<${ns}:Or>${content}</${ns}:Or>`,
        "AND NOT": (ns, content) => `<${ns}:Not>${content}</${ns}:Not>`
};

var ogcSpatialOperators = {
    "INTERSECTS": (ns, content) => `<${ns}:Intersects>${content}</${ns}:Intersects>`,
    "BBOX": (ns, content) => `<${ns}:BBOX>${content}</${ns}:BBOX>`,
    "CONTAINS": (ns, content) => `<${ns}:Contains>${content}</${ns}:Contains>`,
    "DWITHIN": (ns, content) => `<${ns}:DWithin>${content}</${ns}:DWithin>`,
    "WITHIN": (ns, content) => `<${ns}:Within>${content}</${ns}:Within`
};
module.exports = {
    ogcComparisonOperators,
    ogcLogicalOperators,
    ogcSpatialOperators
};
