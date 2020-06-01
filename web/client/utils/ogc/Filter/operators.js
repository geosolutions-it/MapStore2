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
    "NOR": (ns, content) => `<${ns}:Not><${ns}:Or>${content}</${ns}:Or></${ns}:Not>`,
    "NOT": (ns, content) => `<${ns}:Not>${content}</${ns}:Not>`
};

const ogcSpatialOperators = {
    "INTERSECTS": (ns, content) => `<${ns}:Intersects>${content}</${ns}:Intersects>`,
    "BBOX": (ns, content) => `<${ns}:BBOX>${content}</${ns}:BBOX>`,
    "CONTAINS": (ns, content) => `<${ns}:Contains>${content}</${ns}:Contains>`,
    "DWITHIN": (ns, content) => `<${ns}:DWithin>${content}</${ns}:DWithin>`,
    "WITHIN": (ns, content) => `<${ns}:Within>${content}</${ns}:Within>`
};
const propertyName = (ns, name) => `<${ns}:PropertyName>${name}</${ns}:PropertyName>`;
const valueReference = (ns, name) => `<${ns}:ValueReference>${name}</${ns}:ValueReference>`;
const literal = (ns, value) => `<${ns}:Literal>${value}</${ns}:Literal>`;
const lower = (ns, value) => `<${ns}:LowerBoundary>${value}</${ns}:LowerBoundary>`;
const upper = (ns, value) => `<${ns}:UpperBoundary>${value}</${ns}:UpperBoundary>`;
const multiop = (ns, op, content) => op(ns, Array.isArray(content) ? content.join("") : content);
const logical = {
    and: (ns, content, ...other) => other && other.length > 0 ? multiop(ns, ogcLogicalOperators.AND, [content, ...other]) : multiop(ns, ogcLogicalOperators.AND, content),
    or: (ns, content, ...other) => other && other.length > 0 ? multiop(ns, ogcLogicalOperators.OR, [content, ...other]) : multiop(ns, ogcLogicalOperators.OR, content),
    not: (ns, content) => multiop(ns, ogcLogicalOperators.NOT, content),
    nor: (ns, content, ...other) => other && other.length > 0 ? multiop(ns, ogcLogicalOperators.NOR, [content, ...other]) : multiop(ns, ogcLogicalOperators.NOR, content)
};


const spatial = {
    intersects: (ns, ...args) => multiop(ns, ogcSpatialOperators.INTERSECTS, args),
    within: (ns, ...args) => multiop(ns, ogcSpatialOperators.WITHIN, args),
    bbox: (ns, ...args) => multiop(ns, ogcSpatialOperators.BBOX, args),
    dwithin: (ns, ...args) => multiop(ns, ogcSpatialOperators.DWITHIN, args),
    contains: (ns, ...args) => multiop(ns, ogcSpatialOperators.CONTAINS, args)
};
const distance = (ns, content, units = "m") => `<${ns}:Distance units="${units}">${content}</${ns}:Distance>`;
const comparison = {
    equal: (ns, ...args) => multiop(ns, ogcComparisonOperators["="], args),
    greater: (ns, ...args) => multiop(ns, ogcComparisonOperators[">"], args),
    less: (ns, ...args) => multiop(ns, ogcComparisonOperators["<"], args),
    greaterOrEqual: (ns, ...args) => multiop(ns, ogcComparisonOperators[">="], args),
    lessOrEqual: (ns, ...args) => multiop(ns, ogcComparisonOperators["<="], args),
    notEqual: (ns, ...args) => multiop(ns, ogcComparisonOperators["<>"], args),
    between: (ns, ...args) => multiop(ns, ogcComparisonOperators["><"], args),
    like: (ns, ...args) => multiop(ns, ogcComparisonOperators.like, args),
    ilike: (ns, ...args) => multiop(ns, ogcComparisonOperators.ilike, args),
    isNull: (ns, ...args) => multiop(ns, ogcComparisonOperators.isNull, args)
};

module.exports = {
    ogcComparisonOperators,
    ogcLogicalOperators,
    ogcSpatialOperators,
    propertyName,
    valueReference,
    distance,
    literal,
    logical,
    spatial,
    comparison,
    lower,
    upper
};
