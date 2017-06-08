/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {logical, spatial, comparison, literal, propertyName, valueReference, distance} = require('./operators');
const {filter, fidFilter} = require('./filter');
const {processOGCGeometry} = require("../GML");
// const isValidXML = (value, {filterNS, gmlNS}) => value.indexOf(`<${filterNS}:` === 0) || value.indexOf(`<${gmlNS}:`) === 0;

module.exports = function({filterNS= "ogc", gmlVersion, wfsVersion = "1.1.0"} = {}) {
    let gmlV = gmlVersion || "3.1.1";

    const getGeom = (geom) => processOGCGeometry(gmlV, geom);
    const getValue = (value) => {
        if (typeof value === "object" && !(value instanceof Date)) {
            // TODO return GML;
        }
        return literal(filterNS, value);
    };
    const propName = wfsVersion.indexOf("2.") === 0 ? valueReference : propertyName;
    return {
        filter: filter.bind(null, filterNS),
        fidFilter: fidFilter.bind(null, filterNS),
        and: logical.and.bind(null, filterNS),
        or: logical.or.bind(null, filterNS),
        not: logical.not.bind(null, filterNS),
        property: function(name) {
            return {
                equalTo: (value) => comparison.equal(filterNS, propName(filterNS, name), getValue(value)),
                greaterThen: (value) => comparison.greater(filterNS, propName(filterNS, name), getValue(value)),
                greaterThenOrEqualTo: (value) => comparison.greaterOrEqual(filterNS, propName(filterNS, name), getValue(value)),
                lessThen: (value) => comparison.less(filterNS, propName(filterNS, name), getValue(value)),
                lessThenOrEqualTo: (value) => comparison.lessOrEqual(filterNS, propName(filterNS, name), getValue(value)),
                notEqualTo: (value) => comparison.notEqual(filterNS, propName(filterNS, name), getValue(value)),
                between: (value1, value2) => comparison.between(filterNS, propName(filterNS, name), getValue(value1), getValue(value2)),
                like: (value, options) => comparison.like(filterNS, propName(filterNS, name), getValue(value), options),
                ilike: (value, options) => comparison.ilike(filterNS, propName(filterNS, name), getValue(value), options),
                isNull: () => comparison.isNull(filterNS, propName(filterNS, name)),
                intersects: (value) => spatial.intersects(filterNS, propName(filterNS, name), getGeom(value)),
                within: (value) => spatial.within(filterNS, propName(filterNS, name), getGeom(value)),
                dwithin: (geom, dist, units="m") => spatial.dwithin(filterNS, propName(filterNS, name), getGeom(geom), distance(filterNS, dist, units)),
                contains: (value) => spatial.contains(filterNS, propName(filterNS, name), getGeom(value))
                // TODO bbox equals, disjoint, touches, overlaps


            };
        }
    };

};
