/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {logical, spatial, comparison, literal, propertyName, valueReference, distance, lower, upper, func} from './operators';
import {filter, fidFilter} from './filter';
import {processOGCGeometry} from "../GML";
import {castArray} from 'lodash';
// const isValidXML = (value, {filterNS, gmlNS}) => value.indexOf(`<${filterNS}:` === 0) || value.indexOf(`<${gmlNS}:`) === 0;
/**
 * Returns OGC Filter Builder. The FilterBuilder returns the method to compose the filter.
 * The returned element are basically the `filter`, `and`, `or` and `not` functions, plus a `property` object that allows to build the conditions
 * for properties. Other special conditions can be passed as strings.
 * The property object have the methods listed as properies below.
 * The builder provides all the methods to compose the filter (filter, and, or, not, property) to compose the filter.
 * ```
 * import filterBuilder from '.../FilterBuilder';
 * const {filter, property, and, or, not} = filterBuilder({gmlVersion: "3.1.1"});
 *      filter(
 *          and(
 *              property("P1").equals("v1"),
 *              property("the_geom").intersects(geoJSONGeometry)
 *          )
 *      ),
 *      {srsName="EPSG:4326"} // 3rd for query is optional
 *      )
 * {maxFeatures: 10, startIndex: 0, resultType: 'hits', outputFormat: 'application/json'} // 3rd  argument of getFeature is optional, and contains the options for the request.
 * );
 *
 * ```
 * @name FilterBuilder
 * @constructor
 * @memberof utils.ogc.WFS
 * @param {Object} [options] the options to create the request builder
 * @param  {String} [options.wfsVersion="1.1.0"] the version of WFS
 * @param  {String} [options.gmlVersion]         gml Version ()
 * @param  {String} [options.filterNS]           NameSpace to use for filters
 * @return {Object}                      a filter builder.
 * @prop {function} filter creates a filter with the content Parameters can be passed as array or args list.
 * ```
 * filter(...content) //-> <ogc:Filter>...content<ogc:/Filter>
 * ```
 * @prop {function} fidFilter creates a fid condition
 * ```
 * fidFilter("id")` // -> <ogc:FeatureId fid="sc_cities-6.1"/>
 * ```
 * @prop {function} and Creates an and condition. Parameters can be passed as array or args list.
 * ```
 * and( property("a").equalTo("1"), property("b").equalTo("2"), ... )
 * and( [property("a").equalTo("1"), property("b").equalTo("2"), ...] )
 * ```
 * @prop {function} or Creates an or condition. Parameters can be passed as array or args list.
 * ```
 * or( property("a").equalTo("1"), property("b").equalTo("2"), ... )
 * or( [property("a").equalTo("1"), property("b").equalTo("2"), ...] )
 * ```
 * @prop {function} not creates a not condition.
 * ```
 * not( property("a").equalTo("1") )
 * ```
 * @prop {object} property is an utility object that allows to add a condition using the notation
 * ```
 * property("propname").operator(...otherParams)
 * // examples
 * property("p").equalTo("a")
 * ```
 * @prop {function} valueReference `valueReference("P1")` -> `<ogc:PropertyName>P1</ogc:PropertyName>` or `<fes:ValueReference>P1</fes:ValueReference>` depending on the wfs version
 * @prop {function} literal `literal('a')` -> `<ogc:Literal>a</ogc:Literal>`
 * @prop {object} operations all the available operations (logical, spatial, comparison or custom):
 * @prop {function} operations.func creates a function condition. Parameters can be passed as array or args list. E.g. `func("funcName", valueReference("propName"), literal('literal'))` -> `<ogc:Function name="funcName"><ogc:PropertyName>propName</ogc:PropertyName><ogc:Literal>literal</ogc:Literal></ogc:Function>`
 * @prop {function} operations.and logic and. `and(...conditions)` -> `<ogc:And>...conditions</ogc:And>`
 * @prop {function} operations.or logic or. `or(...conditions)` -> `<ogc:Or>...conditions</ogc:Or>`
 * @prop {function} operations.not logic not. `not(condition)` -> `<ogc:Not>condition</ogc:Not>`
 * @prop {function} operations.nor logic nor. `nor(...conditions)` -> `<ogc:Not><ogc:Or>...conditions</ogc:Or></ogc:Not>`
 * @prop {function} operations.intersects spatial intersection. `intersects(valueReference('propName'), valueReference('geometry'))` -> `<ogc:Intersects><ogc:PropertyName>property</ogc:PropertyName>geometry</ogc:Intersects>`
 * @prop {function} operations.within spatial within operation
 * @prop {function} operations.bbox spatial bbox operation
 * @prop {function} operations.dwithin spatial dwithin operation
 * @prop {function} operations.contains spatial contains operation
 * @prop {function} operations.equal comparison equal operation
 * @prop {function} operations.greater comparison greater operation
 * @prop {function} operations.less comparison less operation
 * @prop {function} operations.greaterOrEqual comparison greaterOrEqual operation
 * @prop {function} operations.lessOrEqual comparison lessOrEqual operation
 * @prop {function} operations.notEqual comparison notEqual operation
 * @prop {function} operations.between comparison between operation
 * @prop {function} operations.like comparison like operation
 * @prop {function} operations.ilike comparison ilike operation
 * @prop {function} operations.isNull comparison isNull operation
 * @prop {function} property Property is a function that returns an object with all the available operations for a property. When applied the operation, the final XML is generated. It is a quick shortcut to create filters.
 * @prop {function} property.equalTo `property("P1").equals("v1")`
 * @prop {function} property.greaterThen `property("P1").greaterThen(1)`
 * @prop {function} property.greaterThenOrEqualTo `property("P1").greaterThenOrEqualTo(1)`
 * @prop {function} property.lessThen `property("P1").lessThen(1)`
 * @prop {function} property.lessThenOrEqualTo `property("P1").lessThenOrEqualTo(1)`
 * @prop {function} property.between `property("P1").between(1, 2)`
 * @prop {function} property.like `property("P1").like("*test", {options})`
 * @prop {function} property.ilike `property("P1").ilike("*test", {options})`
 * @prop {function} property.isNull `property("P1").isNull()`
 * @prop {function} property.intersects `property("P1").intersects(geoJSONGeometry)`
 * @prop {function} property.within `property("P1").within(geoJSONGeometry)`
 * @prop {function} property.dwithin `property("P1").dwithin(geoJSONGeometry, 10, "m")` 2nd and 3rd params are optional
 * @prop {function} property.contains `property("P1").contains(geoJSONGeometry)`
 */
export default function({filterNS = "ogc", gmlVersion, wfsVersion = "1.1.0"} = {}) {
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

        operations: Object.entries({
            ...spatial,
            ...comparison,
            ...logical,
            // override between to avoid to explicit lower and upper boundaries as arguments
            between: (ns, prop, ...args) => comparison.between(ns, prop, lower(ns, args[0]), upper(ns, args[1])),
            func
        }).reduce((acc, [key, fun]) => {
            acc[key] = fun.bind(null, filterNS);
            return acc;
        }, {}),
        geometry: getGeom,
        filter: filter.bind(null, filterNS),
        fidFilter: fidFilter.bind(null, filterNS),
        and: logical.and.bind(null, filterNS),
        or: logical.or.bind(null, filterNS),
        not: logical.not.bind(null, filterNS),
        nor: logical.nor.bind(null, filterNS),
        func: func.bind(null, filterNS),
        literal: getValue,
        // note: use valueReference method for filters and SortBy conditions. PropertyName is used in WFS 2.0 only for listing required attributes, while the rest uses ValueReference.
        // this function already uses PropertyName or ValueReference depending of the wfsVersion passed.
        valueReference: (property) =>
            castArray(property)
                .map(p => propName(filterNS, p))
                .join(""),
        property: function(name) {
            return {
                equalTo: (value) => comparison.equal(filterNS, propName(filterNS, name), getValue(value)),
                greaterThen: (value) => comparison.greater(filterNS, propName(filterNS, name), getValue(value)),
                greaterThenOrEqualTo: (value) => comparison.greaterOrEqual(filterNS, propName(filterNS, name), getValue(value)),
                lessThen: (value) => comparison.less(filterNS, propName(filterNS, name), getValue(value)),
                lessThenOrEqualTo: (value) => comparison.lessOrEqual(filterNS, propName(filterNS, name), getValue(value)),
                notEqualTo: (value) => comparison.notEqual(filterNS, propName(filterNS, name), getValue(value)),
                between: (value1, value2) => comparison.between(filterNS, propName(filterNS, name), lower(filterNS, getValue(value1)), upper(filterNS, getValue(value2))),
                like: (value, options) => comparison.like(filterNS, propName(filterNS, name), getValue(value), options),
                ilike: (value, options) => comparison.ilike(filterNS, propName(filterNS, name), getValue(value), options),
                isNull: () => comparison.isNull(filterNS, propName(filterNS, name)),
                intersects: (value) => spatial.intersects(filterNS, propName(filterNS, name), getGeom(value)),
                within: (value) => spatial.within(filterNS, propName(filterNS, name), getGeom(value)),
                dwithin: (geom, dist, units = "m") => spatial.dwithin(filterNS, propName(filterNS, name), getGeom(geom), distance(filterNS, dist, units)),
                contains: (value) => spatial.contains(filterNS, propName(filterNS, name), getGeom(value))
                // TODO bbox equals, disjoint, touches, overlaps
            };
        }
    };

}
