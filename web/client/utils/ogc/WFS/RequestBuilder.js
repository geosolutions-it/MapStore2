/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const filterBuilder = require('../Filter/FilterBuilder');
const {castArray} = require('lodash');
const {wfsToGmlVersion} = require("./base");
const getStaticAttributesWFS1 = (ver) => 'service="WFS" version="' + ver + '" ' +
    (ver === "1.0.0" ? 'outputFormat="GML2" ' : "") +
    'xmlns:gml="http://www.opengis.net/gml" ' +
    'xmlns:wfs="http://www.opengis.net/wfs" ' +
    'xmlns:ogc="http://www.opengis.net/ogc" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xsi:schemaLocation="http://www.opengis.net/wfs ' +
    (ver === "1.0.0" ? `http://schemas.opengis.net/wfs/${ver}/WFS-basic.xsd"` : `http://schemas.opengis.net/wfs/${ver}/wfs.xsd"`);
const getStaticAttributesWFS2 = (ver) => 'service="WFS" version="' + ver + '" ' +
    'xmlns:wfs="http://www.opengis.net/wfs/2.0" ' +
    'xmlns:fes="http://www.opengis.net/fes/2.0" ' +
    'xmlns:gml="http://www.opengis.net/gml/3.2" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xsi:schemaLocation="http://www.opengis.net/wfs/2.0 ' +
        'http://schemas.opengis.net/wfs/2.0/wfs.xsd ' +
        'http://www.opengis.net/gml/3.2 ' +
        'http://schemas.opengis.net/gml/3.2.1/gml.xsd"';

/**
 * Returns WFS Request Builder to allow the creation of WFS requests.
 * It gets all the functionalities of `FilterBuilder`, plus adds `getFeature`, `query` ...
 * @see utils.ogc.Filter.FilterBuilder
 * @name RequestBuilder
 * @augments utils.ogc.Filter.FilterBuilder
 * @memberof utils.ogc.WFS
 * @constuctor
 * @param {Object} [options] the options to create the request builder
 * @param  {String} [options.wfsVersion="1.1.0"] the version of WFS
 * @param  {String} [options.gmlVersion]         gml Version ()
 * @param  {String} [options.filterNS]           NameSpace to use for filters
*  @param  {String} [options.wfsNS="wfs"]        namespace to use for WFS tags
 * @return {Object} A request builder. it contains all the `FilterBuilder` methods, plus the getFeature, query... methods
 * The request builder provides all the methods to compose the request (query, filter...).
 * @example
 * const requestBuilder = require('.../RequestBuilder');
 * const {getFeature, query, filter, property} = requestBuilder({wfsVersion: "1.0.0"});
 * const reqBody = getFeature(query(
 *      "workspace:layer",
 *      filter(
 *          and(
 *              property("P1").equals("v1"),
 *              proprety("the_geom").intersects(geoJSONGeometry)
 *          )
 *      ),
 *      {srsName="EPSG:4326"} // 3rd for query is optional
 *      )
 * {maxFeatures: 10, startIndex: 0, resultType: 'hits', outputFormat: 'application/json'} // 3rd  argument of getFeature is optional, and contains the options for the request.
 * );
 * @prop {function} getFeature generates the getFeatureRequest, with the contained query
 * ```
 * getFeature(query("topp:states', filter(...)))
 * ```
 * @prop {function} query returns the query element
 * ```
 * query("layerName", filter..., {options})
 * ```
 */
module.exports = function({wfsVersion = "1.1.0", gmlVersion, filterNS, wfsNS = "wfs"} = {}) {
    let gmlV = gmlVersion;
    if (!gmlV && wfsVersion) {
        gmlV = wfsToGmlVersion(wfsVersion);
    } else if (!gmlV) {
        gmlV = "3.1.1";
    }
    const requestAttributes = ({
        viewParams,
        resultType,
        outputFormat,
        startIndex,
        maxFeatures
    } = {}) => {
        const getMaxFeatures = (mf) => wfsVersion.indexOf("2.") === 0 ? `count="${mf}"` : `maxFeatures="${mf}"`;
        return (wfsVersion.indexOf("1.") === 0 ? getStaticAttributesWFS1(wfsVersion) : getStaticAttributesWFS2(wfsVersion))
            + (resultType ? ` resultType="${resultType}"` : "")
            + (outputFormat ? ` outputFormat="${outputFormat}"` : ``)
            + ((startIndex || startIndex === 0) ? ` startIndex="${startIndex}"` : "")
            + ((maxFeatures || maxFeatures === 0) ? ` ${getMaxFeatures(maxFeatures)}` : "")
            + (viewParams ? ` viewParams="${viewParams}"` : "");
    };
    const propertyName = (property) =>
        castArray(property)
            .map(p => `<${wfsVersion === "2.0" ? "fes" : "ogc"}:PropertyName>${p}</${wfsVersion === "2.0" ? "fes" : "ogc"}:PropertyName>`)
            .join("");
    return {
        propertyName,
        ...filterBuilder({gmlVersion: gmlV, wfsVersion, filterNS: filterNS || wfsVersion === "2.0" ? "fes" : "ogc"}),
        getFeature: (content, opts) => `<${wfsNS}:GetFeature ${requestAttributes(opts)}>${Array.isArray(content) ? content.join("") : content}</${wfsNS}:GetFeature>`,
        sortBy: (property, order = "ASC") =>
            `<${wfsNS}:SortBy><${wfsNS}:SortProperty>${propertyName(property)}<${wfsNS}:SortOrder>${order}</${wfsNS}:SortOrder></${wfsNS}:SortProperty></${wfsNS}:SortBy>`,
        query: (featureName, content, {srsName = "EPSG:4326"} = {}) =>
            `<${wfsNS}:Query ${wfsVersion === "2.0" ? "typeNames" : "typeName"}="${featureName}" srsName="${srsName}">`
            + `${Array.isArray(content) ? content.join("") : content}`
            + `</${wfsNS}:Query>`
    };

};
