/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {logical, spatial, comparison, literal, propertyName, distance} = require('./operators');
const {processOGCGeometry} = require("../GML");
const {wfsToGmlVersion} = require("../WFS/base");
// const isValidXML = (value, {filterNS, gmlNS}) => value.indexOf(`<${filterNS}:` === 0) || value.indexOf(`<${gmlNS}:`) === 0;

module.exports = function({filterNS= "ogc", gmlVersion, wfsVersion} = {}) {
    let gmlV = gmlVersion;
    if (!gmlV && wfsVersion) {
        gmlV = wfsToGmlVersion(wfsVersion);
    } else if (!gmlV) {
        gmlV = "3.1.1";
    }
    const getGeom = (geom) => processOGCGeometry(gmlV, geom);
    const getValue = (value) => {
        if (typeof value === "object" && !(value instanceof Date)) {
            // TODO return GML;
        }
        return literal(filterNS, value);
    };
    return {
        and: logical.and.bind(null, filterNS),
        or: logical.or.bind(null, filterNS),
        not: logical.not.bind(null, filterNS),
        property: function(name) {
            return {
                equalTo: (value) => comparison.equal(filterNS, propertyName(filterNS, name), getValue(value)),
                greaterThen: (value) => comparison.greater(filterNS, propertyName(filterNS, name), getValue(value)),
                greaterThenOrEqualTo: (value) => comparison.greaterOrEqual(filterNS, propertyName(filterNS, name), getValue(value)),
                lessThen: (value) => comparison.less(filterNS, propertyName(filterNS, name), getValue(value)),
                lessThenOrEqualTo: (value) => comparison.lessOrEqual(filterNS, propertyName(filterNS, name), getValue(value)),
                notEqualTo: (value) => comparison.notEqual(filterNS, propertyName(filterNS, name), getValue(value)),
                between: (value1, value2) => comparison.between(filterNS, propertyName(filterNS, name), getValue(value1), getValue(value2)),
                like: (value, options) => comparison.like(filterNS, propertyName(filterNS, name), getValue(value), options),
                ilike: (value, options) => comparison.ilike(filterNS, propertyName(filterNS, name), getValue(value), options),
                isNull: () => comparison.isNull(filterNS, propertyName(filterNS, name)),
                intersects: (value) => spatial.intersects(filterNS, propertyName(filterNS, name), getGeom(value)),
                within: (value) => spatial.within(filterNS, propertyName(filterNS, name), getGeom(value)),
                dwithin: (geom, dist, units="m") => spatial.dwithin(filterNS, propertyName(filterNS, name), getGeom(geom), distance(filterNS, dist, units)),
                contains: (value) => spatial.contains(filterNS, propertyName(filterNS, name), getGeom(value))
                // TODO bbox equals, disjoint, touches, overlaps


            };
        }
    };

};
