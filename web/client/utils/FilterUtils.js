
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    processOGCGeometry as processOGCGeometryFunction,
    pointElement,
    polygonElement,
    lineStringElement,
    closePolygon
} from './ogc/GML';

import { wfsToGmlVersion } from './ogc/WFS/base';
import { ogcComparisonOperators, ogcLogicalOperators, ogcSpatialOperators } from './ogc/Filter/operators';
import { read } from './ogc/Filter/CQL/parser';
import fromObject from './ogc/Filter/fromObject';
import filterBuilder from './ogc/Filter/FilterBuilder';
import { reprojectGeoJson, reproject } from './CoordinatesUtils';

export const cqlToOgc = (cqlFilter, fOpts) => {
    const fb = filterBuilder(fOpts);
    const toFilter = fromObject(fb);
    return toFilter(read(cqlFilter));
};

import { get, isNil, isUndefined, isArray, find, findIndex, isString, flatten } from 'lodash';
let FilterUtils;

export const escapeCQLStrings = str => str && str.replace ? str.replace(/\'/g, "''") : str;

export const checkOperatorValidity = (value, operator) => {
    return (!isNil(value) && operator !== "isNull" || !isUndefined(value) && operator === "isNull");
};
/**
 * Test if crossLayer filter is valid.
 * @param {object} crossLayerFilter
 * @return {boolean}
 */
export const isCrossLayerFilterValid = (crossLayerFilter) =>
    get(crossLayerFilter, 'operation', false) &&
        get(crossLayerFilter, 'collectGeometries.queryCollection.typeName', false) &&
        get(crossLayerFilter, 'collectGeometries.queryCollection.geometryName', false);
const wrapAttributeWithDoubleQuotes = a => "\"" + a + "\"";

export const setupCrossLayerFilterDefaults = (crossLayerFilter) => {
    if (!crossLayerFilter || !get(crossLayerFilter, 'collectGeometries.queryCollection')) {
        return null;
    }
    if (get(crossLayerFilter, 'collectGeometries.queryCollection')) {
        const filterFields = (get(crossLayerFilter, 'collectGeometries.queryCollection.filterFields') || []).filter(field => checkOperatorValidity(field.value, field.operator));
        const groupFields = get(crossLayerFilter, 'collectGeometries.queryCollection.groupFields')
            || [{
                id: 1,
                index: 0,
                logic: 'OR'
            }];
        return {
            ...crossLayerFilter,
            collectGeometries: {
                ...crossLayerFilter.collectGeometries,
                queryCollection: {
                    ...crossLayerFilter.collectGeometries.queryCollection,
                    filterFields,
                    groupFields
                }
            }
        };
    }
    return null;
};

const normalizeVersion = (version) => {
    if (!version) {
        return "2.0";
    }
    if (version === "1.0") {
        return "1.0.0";
    }
    if (version === "1.1") {
        return "1.1.0";
    }
    return version;
};
const ogcVersion = "2.0";

const propertyTagReference = {
    "ogc": {startTag: "<ogc:PropertyName>", endTag: "</ogc:PropertyName>"},
    "fes": {startTag: "<fes:ValueReference>", endTag: "</fes:ValueReference>"}
};
export const ogcDateField = (attribute, operator, value, nsplaceholder) => {
    let fieldFilter;
    if (operator === "><") {
        if (value.startDate && value.endDate) {
            const startIso = value.startDate.toISOString ? value.startDate.toISOString() : value.startDate; // for Compatibility reasons. We should use ISO string to store data.
            const endIso = value.endDate.toISOString ? value.endDate.toISOString() : value.endDate; // for Compatibility reasons. We should use ISO string to store data.
            fieldFilter =
                        ogcComparisonOperators[operator](nsplaceholder,
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                            "<" + nsplaceholder + ":LowerBoundary>" +
                                "<" + nsplaceholder + ":Literal>" + startIso + "</" + nsplaceholder + ":Literal>" +
                            "</" + nsplaceholder + ":LowerBoundary>" +
                            "<" + nsplaceholder + ":UpperBoundary>" +
                                "<" + nsplaceholder + ":Literal>" + endIso + "</" + nsplaceholder + ":Literal>" +
                            "</" + nsplaceholder + ":UpperBoundary>"
                        );
        }
    } else {
        if (value.startDate) {
            const startIso = value.startDate.toISOString ? value.startDate.toISOString() : value.startDate; // for Compatibility reasons. We should use ISO string to store data.
            fieldFilter =
                        ogcComparisonOperators[operator](nsplaceholder,
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                            "<" + nsplaceholder + ":Literal>" + startIso + "</" + nsplaceholder + ":Literal>"
                        );
        }
    }
    return fieldFilter;
};

export const ogcListField = (attribute, operator, value, nsplaceholder) => {
    let fieldFilter;
    if (!isNil(value)) {
        fieldFilter =
            ogcComparisonOperators[operator](nsplaceholder,
                propertyTagReference[nsplaceholder].startTag +
                    attribute +
                propertyTagReference[nsplaceholder].endTag +
                "<" + nsplaceholder + ":Literal>" + value + "</" + nsplaceholder + ":Literal>"
            );
    }
    return fieldFilter;
};

export const  ogcStringField = (attribute, operator, value, nsplaceholder) => {
    let fieldFilter;
    if (checkOperatorValidity(value, operator)) {
        if (operator === "isNull") {
            fieldFilter =
                ogcComparisonOperators[operator](nsplaceholder,
                    propertyTagReference[nsplaceholder].startTag +
                        attribute +
                    propertyTagReference[nsplaceholder].endTag
                );
        } else if (operator === "=") {
            fieldFilter =
                ogcComparisonOperators[operator](nsplaceholder,
                    propertyTagReference[nsplaceholder].startTag +
                        attribute +
                    propertyTagReference[nsplaceholder].endTag +
                    "<" + nsplaceholder + ":Literal>" + value + "</" + nsplaceholder + ":Literal>"
                );
        } else {
            fieldFilter =
                ogcComparisonOperators[operator](nsplaceholder,
                    propertyTagReference[nsplaceholder].startTag +
                        attribute +
                    propertyTagReference[nsplaceholder].endTag +
                    "<" + nsplaceholder + ":Literal>*" + value + "*</" + nsplaceholder + ":Literal>"
                );
        }
    }
    return fieldFilter;
};
/**
 * it creates a ogc filter for boolean attributes
 * it ignores any operator beside "="
 * it ignores empty or falsy values
 * @param {string} attribute
 * @param {string} operator
 * @param {string|boolean} value can be a value between (t, tr, tru, true, f, fa, fal, fals, false) because geoserver accepts them
 * @return the ogc filter
*/
export const  ogcBooleanField = (attribute, operator, value, nsplaceholder) => {
    let fieldFilter = "";
    if (checkOperatorValidity(value, operator)) {
        if (operator === "=" && value !== "") {
            fieldFilter =
                ogcComparisonOperators[operator](nsplaceholder,
                    propertyTagReference[nsplaceholder].startTag +
                        attribute +
                    propertyTagReference[nsplaceholder].endTag +
                    "<" + nsplaceholder + ":Literal>" + value + "</" + nsplaceholder + ":Literal>"
                );
        }
    }
    return fieldFilter;
};
export const ogcNumberField = (attribute, operator, value, nsplaceholder) => {
    let fieldFilter;
    if (operator === "><") {
        if (!isNil(value) && (value.lowBound !== null && value.lowBound !== undefined) && (value.upBound === null || value.upBound === undefined)) {
            fieldFilter = ogcComparisonOperators[">="](nsplaceholder,
                propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                         "<" + nsplaceholder + ":Literal>" + value.lowBound + "</" + nsplaceholder + ":Literal>"
            );
        } else if (!isNil(value) && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound === null || value.lowBound === undefined)) {
            fieldFilter = ogcComparisonOperators["<="](nsplaceholder,
                propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                         "<" + nsplaceholder + ":Literal>" + value.upBound + "</" + nsplaceholder + ":Literal>"
            );
        } else if (!isNil(value) && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound !== null && value.lowBound !== undefined)) {
            fieldFilter =
                        ogcComparisonOperators[operator](nsplaceholder,
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                            "<" + nsplaceholder + ":LowerBoundary>" +
                                "<" + nsplaceholder + ":Literal>" + value.lowBound + "</" + nsplaceholder + ":Literal>" +
                            "</" + nsplaceholder + ":LowerBoundary>" +
                            "<" + nsplaceholder + ":UpperBoundary>" +
                                "<" + nsplaceholder + ":Literal>" + value.upBound + "</" + nsplaceholder + ":Literal>" +
                            "</" + nsplaceholder + ":UpperBoundary>"
                        );
        }
    } else {
        let val = !isNil(value) && (value.lowBound !== null && value.lowBound !== undefined) ? value.lowBound : value;
        if (!isNil(val)) {
            fieldFilter = ogcComparisonOperators[operator](nsplaceholder,
                propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                         "<" + nsplaceholder + ":Literal>" + val + "</" + nsplaceholder + ":Literal>"
            );
        }
    }
    return fieldFilter;
};
export const processOGCSimpleFilterField = (field, nsplaceholder) => {
    let filter = "";
    switch (field.type) {
    case "date":
        filter = ogcDateField(field.attribute, field.operator, field.values, nsplaceholder);
        break;
    case "number":
        filter = ogcNumberField(field.attribute, field.operator, field.values, nsplaceholder);
        break;
    case "string":
        filter = ogcStringField(field.attribute, field.operator, field.values, nsplaceholder);
        break;
    case "boolean":
        filter = ogcBooleanField(field.attribute, field.operator, field.values, nsplaceholder);
        break;
    case "list": {
        if (field.values && field.values.length > 0 ) {
            const OP = "OR";
            filter = field.values.reduce((ogc, val) => {
                let op = (val === null || val === "null") ? "isNull" : "=";
                return ogc + ogcStringField(field.attribute, op, val, nsplaceholder);
            }, "");
            filter = ogcLogicalOperators[OP](nsplaceholder, filter);
        }
        break;
    }
    default:
        break;
    }
    return filter;
};

const cqlQueryCollection = ({typeName, geometryName, cqlFilter = "INCLUDE"} = {}) => `queryCollection('${typeName}', '${geometryName}','${escapeCQLStrings(cqlFilter)}')`;
const cqlCollectGeometries = (content) => `collectGeometries(${content})`;


export const toOGCFilterParts = function(objFilter, versionOGC, nsplaceholder) {
    let filters = [];
    let attributeFilter;
    if (objFilter.filterFields && objFilter.filterFields.length > 0) {
        if (objFilter.groupFields && objFilter.groupFields.length > 0) {
            attributeFilter = FilterUtils.processOGCFilterGroup(objFilter.groupFields[0], objFilter, nsplaceholder);
        } else {
            attributeFilter = FilterUtils.processOGCFilterFields(null, objFilter, nsplaceholder);
        }
        if (attributeFilter !== "") {
            filters.push(attributeFilter);
        }
    } else if (objFilter.simpleFilterFields && objFilter.simpleFilterFields.length > 0) {
        const OP = "AND";
        const ogc = ogcLogicalOperators[OP](nsplaceholder, objFilter.simpleFilterFields.map( (f) => processOGCSimpleFilterField(f, nsplaceholder)).join("") );
        filters.push(ogc);
    }

    let spatialFilter;
    let spatialFields;
    let bboxField;

    if (isArray(objFilter.spatialField)) {
        bboxField = find(objFilter.spatialField, field => field.operation === 'BBOX');
        if (!bboxField) {
            spatialFields = objFilter.spatialField;
        }
    } else if (objFilter.spatialField) {
        if (objFilter.spatialField.operation === 'BBOX') {
            bboxField = objFilter.spatialField;
        } else {
            spatialFields = [objFilter.spatialField];
        }
    }

    if (bboxField) {
        if (isArray(bboxField.geometry && bboxField.geometry.extent[0])) {
            const OP = "OR";
            const bBoxFilter = bboxField.geometry.extent.reduce((a, extent) => {
                let field = Object.assign({}, bboxField);
                bboxField.geometry.extent = extent;
                return a + FilterUtils.processOGCSpatialFilter(versionOGC, field, nsplaceholder);
            }, '');

            spatialFilter = ogcLogicalOperators[OP](nsplaceholder, bBoxFilter);
        }
        filters.push(spatialFilter);
    } else if (spatialFields) {
        spatialFields = spatialFields.filter(field => field && field.geometry && field.operation);
        if (spatialFields.length > 0) {
            const processedSpatialFilters = spatialFields.map(field => {
                return FilterUtils.processOGCSpatialFilter(versionOGC, field, nsplaceholder);
            }).join('');
            spatialFilter = spatialFields.length > 1 ?
                ogcLogicalOperators[objFilter.spatialFieldOperator || "AND"](nsplaceholder, processedSpatialFilters) :
                processedSpatialFilters;
            filters.push(spatialFilter);
        }
    }

    if (objFilter.crossLayerFilter && objFilter.crossLayerFilter.operation) {
        let crossLayerFilter = {
            ...objFilter.crossLayerFilter,
            attribute: objFilter.crossLayerFilter.attribute // || (objFilter.spatialField && objFilter.spatialField.attribute)
        };
        if (Array.isArray()) {
            crossLayerFilter.forEach( f => filters.push(FilterUtils.processOGCCrossLayerFilter(f, nsplaceholder)));
        } else {
            filters.push(FilterUtils.processOGCCrossLayerFilter(crossLayerFilter, nsplaceholder));
        }
    }
    // this is the additional filter from layer, that have to be merged with the one of the query
    if (objFilter.options && objFilter.options.cqlFilter) {
        filters.push(
            cqlToOgc(objFilter.options.cqlFilter, ({
                filterNS: nsplaceholder,
                wfsVersion: versionOGC,
                gmlVersion: wfsToGmlVersion(versionOGC)
            }))
        );
    }

    return filters;
};
export const toOGCFilter = function(ftName, json, version, sortOptions = null, hits = false, format = null, propertyNames = null, srsName = "EPSG:4326") {
    let objFilter;
    try {
        objFilter = json instanceof Object ? json : JSON.parse(json);
    } catch (e) {
        return e;
    }
    const versionOGC = normalizeVersion(version || ogcVersion);
    const nsplaceholder = versionOGC === "2.0" ? "fes" : "ogc";


    let ogcFilter = FilterUtils.getGetFeatureBase(versionOGC, objFilter.pagination, hits, format, json && json.options);

    let filters = FilterUtils.toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
    let filter = "";

    if (filters.length > 0) {
        filter = "<" + nsplaceholder + ":Filter>";
        if (filters.length === 1) {
            filter += filters[0];
        } else {
            filter += "<" + nsplaceholder + ":And>";
            filters.forEach((subFilter) => {
                filter += subFilter;
            });
            filter += "</" + nsplaceholder + ":And>";
        }
        filter += "</" + nsplaceholder + ":Filter>";
    }

    // If srsName === native,  srsName param is omitted!
    ogcFilter += `<wfs:Query ${versionOGC === "2.0" ? "typeNames" : "typeName"}="${ftName}" ${srsName !== 'native' && `srsName="${srsName}"` || ''}>`;

    ogcFilter += filter;
    if (propertyNames) {
        ogcFilter += propertyNames.map( name =>
            propertyTagReference[nsplaceholder].startTag +
            name +
            propertyTagReference[nsplaceholder].endTag ).join("");
    }
    if (sortOptions && sortOptions.sortBy && sortOptions.sortOrder) {
        ogcFilter +=
            "<" + nsplaceholder + ":SortBy>" +
                "<" + nsplaceholder + ":SortProperty>" +
                    propertyTagReference[nsplaceholder].startTag +
                        sortOptions.sortBy +
                    propertyTagReference[nsplaceholder].endTag +
                    "<" + nsplaceholder + ":SortOrder>" +
                        sortOptions.sortOrder +
                    "</" + nsplaceholder + ":SortOrder>" +
                "</" + nsplaceholder + ":SortProperty>" +
            "</" + nsplaceholder + ":SortBy>";
    }

    ogcFilter +=
                '</wfs:Query>' +
        '</wfs:GetFeature>';
    return ogcFilter;
};
export const processOGCFilterGroup = function(root, objFilter, nsplaceholder) {
    let ogc = FilterUtils.processOGCFilterFields(root, objFilter, nsplaceholder);

    let subGroups = FilterUtils.findSubGroups(root, objFilter.groupFields);
    if (subGroups.length > 0) {
        subGroups.forEach((subGroup) => {
            ogc += FilterUtils.processOGCFilterGroup(subGroup, objFilter, nsplaceholder);
        });
    }
    if (ogc !== "") {
        return ogcLogicalOperators[root.logic](nsplaceholder, ogc);
    }
    return "";
};

export const processOGCFilterFields = function(group, objFilter, nsplaceholder) {
    let fields = group ? objFilter.filterFields.filter((field) =>
        field.groupId === group.id && (checkOperatorValidity(field.value, field.operator))) :
        objFilter.filterFields.filter(field => checkOperatorValidity(field.value, field.operator));
    let filter = [];

    if (fields.length) {
        filter = fields.reduce((arr, field) => {
            let fieldFilter;
            switch (field.type) {
            case "date":
            case "date-time":
            case "time":
                fieldFilter = ogcDateField(field.attribute, field.operator, field.value, nsplaceholder);
                break;
            case "number":
                fieldFilter = ogcNumberField(field.attribute, field.operator, field.value, nsplaceholder);
                break;
            case "string":
                fieldFilter = ogcStringField(field.attribute, field.operator, field.value, nsplaceholder);
                break;
            case "boolean":
                fieldFilter = ogcBooleanField(field.attribute, field.operator, field.value, nsplaceholder);
                break;
            case "list":
                fieldFilter = ogcListField(field.attribute, field.operator, field.value, nsplaceholder);
                break;
            default:
                break;
            }
            if (field.operator === "isNull") {
                fieldFilter = ogcStringField(field.attribute, field.operator, field.operator, nsplaceholder);
            }
            if (fieldFilter) {
                arr.push(fieldFilter);
            }
            return arr;
        }, []);

        return filter.join("");
    }
    return "";
};


export const getGmlPointElement = (c, srs, v) => pointElement(c, srs, wfsToGmlVersion(v));
export const getGmlPolygonElement = (c, srs, v) => polygonElement(c, srs, wfsToGmlVersion(v));
export const getGmlLineStringElement = (c, srs, v) => lineStringElement(c, srs, wfsToGmlVersion(v));
export const processOGCGeometry = (v, geom) => processOGCGeometryFunction(wfsToGmlVersion(v), geom);

export const processOGCSpatialFilter = function(version, spatialField, nsplaceholder) {
    // collectGeometries has priority on the geometry
    // if it is present in the spatialField
    // the geometry have to be ignored in favor of crossLayer
    if (spatialField.collectGeometries) {
        return FilterUtils.processOGCCrossLayerFilter(spatialField);
    }
    let ogc =
        propertyTagReference[nsplaceholder].startTag +
            spatialField.attribute +
        propertyTagReference[nsplaceholder].endTag;

    switch (spatialField.operation) {
    case "INTERSECTS":
    case "DWITHIN":
    case "WITHIN":
    case "CONTAINS": {
        ogc += processOGCGeometryFunction(wfsToGmlVersion(version), spatialField.geometry);

        if (spatialField.operation === "DWITHIN") {
            ogc += '<' + nsplaceholder + ':Distance units="m">' + (spatialField.geometry.distance || 0) + '</' + nsplaceholder + ':Distance>';
        }

        break;

    }
    case "BBOX": {
        let lowerCorner = spatialField.geometry.extent[0] + " " + spatialField.geometry.extent[1];
        let upperCorner = spatialField.geometry.extent[2] + " " + spatialField.geometry.extent[3];

        ogc +=
                    '<gml:Envelope' + ' srsName="' + spatialField.geometry.projection + '">' +
                        '<gml:lowerCorner>' + lowerCorner + '</gml:lowerCorner>' +
                        '<gml:upperCorner>' + upperCorner + '</gml:upperCorner>' +
                    '</gml:Envelope>';

        break;
    }
    default:
        break;
    }

    return ogcSpatialOperators[spatialField.operation](nsplaceholder, ogc);
};
export const getGetFeatureBase = function(version, pagination, hits, format, options = {}) {
    let ver = normalizeVersion(version);

    let getFeature = '<wfs:GetFeature ';
    getFeature += format ? 'outputFormat="' + format + '" ' : '';
    getFeature += pagination && (pagination.startIndex || pagination.startIndex === 0) ? 'startIndex="' + pagination.startIndex + '" ' : "";
    getFeature += options.viewParams ? ` viewParams="${options.viewParams}" ` : "";
    switch (ver) {
    case "1.0.0":
        getFeature += pagination && pagination.maxFeatures ? 'maxFeatures="' + pagination.maxFeatures + '" ' : "";

        getFeature = hits ? getFeature + ' resultType="hits"' : getFeature;

        getFeature += 'service="WFS" version="' + ver + '" ' +
                'outputFormat="GML2" ' +
                'xmlns:gml="http://www.opengis.net/gml" ' +
                'xmlns:wfs="http://www.opengis.net/wfs" ' +
                'xmlns:ogc="http://www.opengis.net/ogc" ' +
                'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                (options.noSchemaLocation ? "" : 'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"') +
            '>';
        break;
    case "1.1.0":
        getFeature += pagination && pagination.maxFeatures ? 'maxFeatures="' + pagination.maxFeatures + '" ' : "";

        getFeature = hits ? getFeature + ' resultType="hits"' : getFeature;

        getFeature += 'service="WFS" version="' + ver + '" ' +
                'xmlns:gml="http://www.opengis.net/gml" ' +
                'xmlns:wfs="http://www.opengis.net/wfs" ' +
                'xmlns:ogc="http://www.opengis.net/ogc" ' +
                'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                (options.noSchemaLocation ? "" : 'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"') +
                '>';
        break;
    default: // default is wfs 2.0
        getFeature += pagination && pagination.maxFeatures ? 'count="' + pagination.maxFeatures + '" ' : "";

        getFeature = hits && !pagination ? getFeature + ' resultType="hits"' : getFeature;

        getFeature += 'service="WFS" version="' + ver + '" ' +
                'xmlns:wfs="http://www.opengis.net/wfs/2.0" ' +
                'xmlns:fes="http://www.opengis.net/fes/2.0" ' +
                'xmlns:gml="http://www.opengis.net/gml/3.2" ' +
                'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                (options.noSchemaLocation ? "" : ('xsi:schemaLocation="http://www.opengis.net/wfs/2.0 ' +
                    'http://schemas.opengis.net/wfs/2.0/wfs.xsd ' +
                    'http://www.opengis.net/gml/3.2 ' +
                    'http://schemas.opengis.net/gml/3.2.1/gml.xsd"')) +
                '>';
    }

    return getFeature;
};
export const getCrossLayerCqlFilter = crossLayerFilter => get(crossLayerFilter, 'collectGeometries.queryCollection.cqlFilter')
    || (get(crossLayerFilter, 'collectGeometries.queryCollection.filterFields') || []).length > 0
        && (get(crossLayerFilter, 'collectGeometries.queryCollection.groupFields') || []).length > 0
        && FilterUtils.toCQLFilter(crossLayerFilter.collectGeometries.queryCollection)
    || "INCLUDE";
/**
*  processOGCCrossLayerFilter(object)
*  object should be in this form :
*    {
*    operation: "FILTER_OPERATION_TO_DO_WITH_GEOMETRY",
*       attribute: "GEOMETRY_NAME_OF_THE_FEATURE_TYPE_TO_FILTER",
*       collectGeometries: {queryCollection: {
*           typeName: "TYPE_NAME_TO_QUERY",
*           geometryName: "GEOMETRY_NAME_OF_THE_FEATURE_TYPE_TO_QUERY",
*           cqlFilter: "CQL_FITER_TO_APPLY_TO_THE_FEATURE_TYPE"
*       }
* }}
* Example: if I want to filter the featureType "roads", with the geometryName = "roads_geom"
* that intersect the polygons from the featureType "regions, with geometryName "regions_geom"
* where the attribute "area" of the region is >= 10 You will have the following
*    {
*   operation: "INTERSECTS"
*   attribute: "roads_geom",
*    collectGeometries: {queryCollection: {
*       typeName: "regions",
*       geometryName: "regions_geom",
*       cqlFilter: "area > 10"
*   }}
*   }
*/
export const processOGCCrossLayerFilter = function(crossLayerFilter, nsplaceholderparams) {
    let nsplaceholder = nsplaceholderparams || "ogc";
    let ogc =
        propertyTagReference[nsplaceholder].startTag +
            crossLayerFilter.attribute +
        propertyTagReference[nsplaceholder].endTag;
    // only collectGeometries is supported now
    if (crossLayerFilter.collectGeometries) {
        const cqlFilter = FilterUtils.getCrossLayerCqlFilter(crossLayerFilter);
        ogc += `<ogc:Function name="collectGeometries">` +
            `<ogc:Function name="queryCollection">` +
            `<ogc:Literal>${crossLayerFilter.collectGeometries.queryCollection.typeName}</ogc:Literal>` +
            `<ogc:Literal>${crossLayerFilter.collectGeometries.queryCollection.geometryName}</ogc:Literal>` +
            `<ogc:Literal><![CDATA[${cqlFilter}]]></ogc:Literal>` +
            `</ogc:Function>` +
        `</ogc:Function>`;
    }
    if (crossLayerFilter.operation === "DWITHIN") {
        ogc += '<' + nsplaceholder + ':Distance units="m">' + (crossLayerFilter.distance || 0) + '</' + nsplaceholder + ':Distance>';
    }
    return ogcSpatialOperators[crossLayerFilter.operation](nsplaceholder, ogc);
};
export const toCQLFilter = function(json) {
    let objFilter;
    try {
        objFilter = json instanceof Object ? json : JSON.parse(json);
    } catch (e) {
        return e;
    }

    let filters = [];

    let attributeFilter;
    if (objFilter.filterFields && objFilter.filterFields.length > 0) {
        attributeFilter = FilterUtils.processCQLFilterGroup(objFilter.groupFields[0], objFilter);
        if (attributeFilter) {
            filters.push(attributeFilter);
        }
    } else if (objFilter.simpleFilterFields && objFilter.simpleFilterFields.length > 0) {
        let simpleFilter = objFilter.simpleFilterFields.reduce((cql, field) => {
            let tmp = cql;
            let strFilter = FilterUtils.processCQLSimpleFilterField(field);
            if (strFilter !== false) {
                tmp = cql.length > 0 ? cql + " AND (" + strFilter + ")" : "(" + strFilter + ")";
            }
            return tmp;
        }, "");
        simpleFilter = simpleFilter.length > 0 ? simpleFilter : "INCLUDE";
        filters.push(simpleFilter);
    }

    let spatialFilter;
    if (objFilter.spatialField) {
        spatialFilter = FilterUtils.processCQLSpatialFilter(objFilter);
        if (spatialFilter) {
            filters.push(spatialFilter);
        }
    }
    if (objFilter.crossLayerFilter) {
        const {crossLayerFilter} = objFilter;
        const {operation} = crossLayerFilter;
        const attribute = crossLayerFilter.attribute; // || (objFilter.spatialField && objFilter.spatialField.attribute)
        const queryCollection = crossLayerFilter.collectGeometries && crossLayerFilter.collectGeometries.queryCollection;
        // Something like CONTAINS(the_geom, collectGeometries(queryCollection('sf:roads','the_geom','INCLUDE')))
        if (operation && attribute && queryCollection) {
            const {typeName, geometryName} = queryCollection;
            const cqlFilter =
                FilterUtils.getCrossLayerCqlFilter(crossLayerFilter)
                    ; // escape single quotes to make the CQL a valid string.
            // TODO DWITHIN needs also distance and unit
            const cg = cqlCollectGeometries(cqlQueryCollection({typeName, geometryName, cqlFilter}));
            filters.push(`${operation}(${attribute},${cg})`);
        }
    }
    if (filters.length) {
        return "(" + (filters.length > 1 ? filters.join(") AND (") : filters[0]) + ")";
    }
    return null;
};
export const processCQLFilterGroup = function(root, objFilter) {
    const fixedRoot = root.logic === 'NOR' ? {...root, logic: 'AND', negateAll: true} : root;
    let cql = FilterUtils.processCQLFilterFields(fixedRoot, objFilter);

    let subGroups = FilterUtils.findSubGroups(fixedRoot, objFilter.groupFields);
    if (subGroups.length > 0) {
        const subGroupCql = subGroups
            .map((subGroup) => (fixedRoot.negateAll ? "NOT (" : "(") + FilterUtils.processCQLFilterGroup(subGroup, objFilter) + ")")
            .join(" " + fixedRoot.logic + " ");
        return cql ? [cql, subGroupCql].join(" " + fixedRoot.logic + " ") : subGroupCql;
    }

    return cql;
};

export const getCQLGeometryElement = function(coordinates, type) {
    let geometry = type + "(";

    switch (type) {
    case "Point":
        geometry += coordinates.join(" ");
        break;
    case "MultiPoint":
        coordinates.forEach((position, index) => {
            geometry += position.join(" ");
            geometry += index < coordinates.length - 1 ? ", " : "";
        });
        break;
    case "Polygon":
        coordinates.forEach((element, index) => {
            geometry += "(";
            let coords = closePolygon(element).map((coordinate) => {
                return coordinate[0] + " " + coordinate[1];
            });
            geometry += coords.join(", ");
            geometry += ")";

            geometry += index < coordinates.length - 1 ? ", " : "";
        });
        break;
    case "MultiPolygon":
        coordinates.forEach((polygon, idx) => {
            geometry += "(";
            polygon.forEach((element, index) => {
                geometry += "(";
                let coords = closePolygon(element).map((coordinate) => {
                    return coordinate[0] + " " + coordinate[1];
                });

                geometry += coords.join(", ");
                geometry += ")";

                geometry += index < polygon.length - 1 ? ", " : "";
            });
            geometry += ")";
            geometry += idx < coordinates.length - 1 ? ", " : "";
        });
        break;
    default:
        break;
    }

    geometry += ")";
    return geometry;
};

export const processCQLSpatialFilter = function(objFilter) {
    let spatialFields = (isArray(objFilter.spatialField) ? objFilter.spatialField : [objFilter.spatialField])
        .filter(f => f && f.geometry && f.operation);
    let cql = '';

    spatialFields.forEach((field, index) => {
        cql += field.operation + "(\"" + field.attribute + "\",";
        if (field.collectGeometries && field.collectGeometries.queryCollection) {
            cql += cqlCollectGeometries(cqlQueryCollection(field.collectGeometries.queryCollection));
        } else {
            let crs = field.geometry.projection || "";
            crs = crs.split(":").length === 2 ? "SRID=" + crs.split(":")[1] + ";" : "";
            cql += crs + FilterUtils.getCQLGeometryElement(field.geometry.coordinates, field.geometry.type);
        }
        cql += ")";

        if (index < spatialFields.length - 1) {
            cql += ` ${objFilter.spatialFieldOperator || "AND"} `;
        }
    });

    return cql;
};

export const cqlDateField = function(attribute, operator, value) {
    let fieldFilter;
    if (operator === "><") {
        if (value.startDate && value.endDate) {
            const startIso = value.startDate.toISOString ? value.startDate.toISOString() : value.startDate; // for Compatibility reasons. We should use ISO string to store data.
            const endIso = value.endDate.toISOString ? value.endDate.toISOString() : value.endDate; // for Compatibility reasons. We should use ISO string to store data.
            fieldFilter = "(" + attribute + ">='" + startIso +
                "' AND " + attribute + "<='" + endIso + "')";
        }
    } else {
        if (value.startDate) {
            const startIso = value.startDate.toISOString ? value.startDate.toISOString() : value.startDate; // for Compatibility reasons. We should use ISO string to store data.
            fieldFilter = attribute + operator + "'" + startIso + "'";
        }
    }
    return fieldFilter;
};

export const cqlStringField = function(attribute, operator, value) {
    let fieldFilter;
    const wrappedAttr = wrapAttributeWithDoubleQuotes(attribute);
    if (!isNil(value)) {
        if (operator === "isNull") {
            fieldFilter = "isNull(" + wrappedAttr + ")=true";
        } else if (operator === "=") {
            let val = "'" + escapeCQLStrings(value) + "'";
            fieldFilter = wrappedAttr + operator + val;
        } else if (operator === "ilike") {
            let val = "'%" + escapeCQLStrings(value).toLowerCase() + "%'";
            fieldFilter = "strToLowerCase(" + wrappedAttr + ") LIKE " + val;
        } else {
            let val = "'%" + escapeCQLStrings(value) + "%'";
            fieldFilter = wrappedAttr + " LIKE " + val;
        }
    }
    return fieldFilter;
};
/**
 * it creates a cql filter for boolean attributes
 * it ignores any operator beside "="
 * it ignores empty or falsy values
 * @param {string} attribute
 * @param {string} operator
 * @param {string|boolean} value can be a value between (t, tr, tru, true, f, fa, fal, fals, false) because geoserver accepts them
 * @return the cql filter in the form "attribute"='value'
*/
export const cqlBooleanField = function(attribute, operator, value) {
    let fieldFilter = "";
    if (!isNil(value) && value !== "") {
        if (operator === "=") {
            let val = "'" + value + "'";
            fieldFilter = "\"" + attribute + "\"" + operator + val;
        }
    }
    return fieldFilter;
};

export const cqlNumberField = function(attribute, operator, value) {
    let fieldFilter;
    const wrappedAttr = wrapAttributeWithDoubleQuotes(attribute);
    if (operator === "><") {
        if (!isNil(value) && (value.lowBound !== null && value.lowBound !== undefined) && (value.upBound === null || value.upBound === undefined)) {
            fieldFilter = "(" + wrappedAttr + ">='" + value.lowBound + "')";
        } else if (!isNil(value) && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound === null || value.lowBound === undefined)) {
            fieldFilter = "(" + wrappedAttr + "<='" + value.upBound + "')";
        } else if (!isNil(value) && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound !== null && value.lowBound !== undefined)) {
            fieldFilter = "(" + wrappedAttr + ">='" + value.lowBound +
                "' AND " + wrappedAttr + "<='" + value.upBound + "')";
        }
    } else {
        let val = (!isNil(value)) && (value.lowBound !== null && value.lowBound !== undefined) ? value.lowBound : value;
        if (!isNil(val)) {
            // TODO fix this
            fieldFilter = wrappedAttr + " " + operator + " '" + val + "'";
        }
    }
    return fieldFilter;
};

export const findSubGroups = function(root, groups) {
    let subGroups = groups.filter((g) => g.groupId === root.id);
    return subGroups;
};
export const cqlListField = function(attribute, operator, value) {
    return FilterUtils.cqlStringField(attribute, operator, value);
};

export const processCQLFilterFields = function(group, objFilter) {
    let fields = objFilter.filterFields.filter((field) => field.groupId === group.id);

    let filter = [];
    if (fields) {
        fields.forEach((field) => {
            let fieldFilter;

            switch (field.type) {
            case "date":
            case "time":
            case "date-time":
                fieldFilter = FilterUtils.cqlDateField(field.attribute, field.operator, field.value);
                break;
            case "number":
                fieldFilter = FilterUtils.cqlNumberField(field.attribute, field.operator, field.value);
                break;
            case "string":
                fieldFilter = FilterUtils.cqlStringField(field.attribute, field.operator, field.value);
                break;
            case "boolean":
                fieldFilter = FilterUtils.cqlBooleanField(field.attribute, field.operator, field.value);
                break;
            case "list":
                fieldFilter = FilterUtils.cqlListField(field.attribute, field.operator, field.value);
                break;
            default:
                break;
            }
            if (fieldFilter) {
                filter.push(group.negateAll ? 'NOT (' + fieldFilter + ')' : fieldFilter);
            }
        });

        filter = filter.join(" " + group.logic + " ");
    }

    return filter;
};

export const processCQLSimpleFilterField = function(field) {
    let strFilter = false;
    switch (field.type) {
    case "date":
        strFilter = FilterUtils.cqlDateField(field.attribute, field.operator, field.values);
        break;
    case "number":
        strFilter = FilterUtils.cqlNumberField(field.attribute, field.operator, field.values);
        break;
    case "string":
        strFilter = FilterUtils.cqlStringField(field.attribute, field.operator, field.values);
        break;
    case "boolean":
        strFilter = FilterUtils.cqlBooleanField(field.attribute, field.operator, field.values);
        break;
    case "list": {
        if (field.values.length !== field.optionsValues.length) {
            let addNull = false;
            let filter = field.values.reduce((arr, value) => {
                if (value === null || value === "null") {
                    addNull = true;
                } else {
                    arr.push( "'" + value + "'");
                }
                return arr;
            }, []);
            strFilter = filter.length > 0 ? field.attribute + " IN(" + filter.join(",") + ")" : strFilter;
            if (addNull) {
                strFilter = strFilter ? strFilter + " OR isNull(" + field.attribute + ")=true" : "isNull(" + field.attribute + ")=true";
            }
        }
        break;
    }
    default:
        break;
    }

    return strFilter && strFilter.length > 0 ? strFilter : false;
};
export const getOgcAllPropertyValue = function(featureTypeName, attribute) {
    return `<wfs:GetPropertyValue service="WFS" valueReference='${attribute}'
                version="2.0" xmlns:fes="http://www.opengis.net/fes/2.0"
                xmlns:gml="http://www.opengis.net/gml/3.2"
                xmlns:wfs="http://www.opengis.net/wfs/2.0"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd">
                    <wfs:Query typeNames="${featureTypeName}"/>
            </wfs:GetPropertyValue>`;
};
export const getSLD = function(ftName, json, version) {
    let filter = FilterUtils.toOGCFilter(ftName, json, version);
    let sIdx = filter.search( `<${FilterUtils.nsplaceholder}:Filter>`);
    if (sIdx !== -1) {
        let eIndx = filter.search( `</wfs:Query>`);
        filter = filter.substr(sIdx, eIndx - sIdx);
    } else {
        filter = '';
    }
    return `<StyledLayerDescriptor version="1.0.0"
            xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gml="http://www.opengis.net/gml" xmlns:gsml="urn:cgi:xmlns:CGI:GeoSciML:2.0" xmlns:sld="http://www.opengis.net/sld" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><NamedLayer><Name>${ftName}</Name><UserStyle><FeatureTypeStyle><Rule >${filter}<PointSymbolizer><Graphic><Mark><WellKnownName>circle</WellKnownName><Fill><CssParameter name="fill">#0000FF</CssParameter></Fill></Mark><Size>20</Size></Graphic></PointSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>`;
};
export const getWFSFilterData = (filterObj, options) => {
    let data;
    if (typeof filterObj === 'string') {
        data = filterObj;
    } else {
        data = filterObj.filterType === "OGC"
            ? FilterUtils.toOGCFilter(filterObj.featureTypeName, {...filterObj, options}, filterObj.ogcVersion, filterObj.sortOptions, filterObj.hits)
            : FilterUtils.toCQLFilter(filterObj);
    }
    return data;
};
export const isLikeOrIlike = (operator) => operator === "ilike" || operator === "like";
export const isFilterEmpty = ({ filterFields = [], spatialField = {}, crossLayerFilter = {} } = {}) =>
    !(filterFields.filter((field) => field.value || field.value === 0).length > 0)
    && !spatialField.geometry
    && !(crossLayerFilter && crossLayerFilter.attribute && crossLayerFilter.operation);
export const isFilterValid = (f = {}) =>
    (f.filterFields && f.filterFields.length > 0)
    || (f.simpleFilterFields && f.simpleFilterFields.length > 0)
    || (f.spatialField && f.spatialField.geometry && f.spatialField.operation ||
        isArray(f.spatialField) && findIndex(f.spatialField, field => field.operation && field.geometry) > -1)
    || (f.crossLayerFilter
        && f.crossLayerFilter.collectGeometries
        && f.crossLayerFilter.collectGeometries.queryCollection
        && f.crossLayerFilter.collectGeometries.queryCollection.geometryName
        && f.crossLayerFilter.collectGeometries.queryCollection.typeName);
const composeSpatialFields = (...spatialFields) => {
    return flatten(spatialFields.filter(v => !!v));
};
export const composeAttributeFilters = (filters, logic = "AND", spatialFieldOperator = "AND") => {
    const rootGroup = {
        id: new Date().getTime(),
        index: 0,
        logic
    };
    return filters.reduce((filter, {filterFields = [], groupFields = [], spatialField} = {}, idx) => {
        return ({
            groupFields: filter.groupFields.concat(filterFields.length > 0 && groupFields.map(g => ({groupId: g.index === 0 && rootGroup.id || `${g.groupId}_${idx}`, logic: g.logic, id: `${g.id}_${idx}`, index: 1 + g.index })) || []),
            filterFields: filter.filterFields.concat(filterFields.map(f => ({...f, groupId: `${f.groupId}_${idx}`}))),
            spatialField: composeSpatialFields(filter.spatialField, spatialField),
            spatialFieldOperator
        });
    }, {groupFields: [rootGroup], filterFields: [], spatialField: []});
};
/**
 @return a spatial filter with coordinates reprojected to nativeCrs
*/
export const reprojectFilterInNativeCrs = (filter, nativeCrs) => {
    const srcProjection = filter.spatialField.geometry.projection;
    const center = filter.spatialField.geometry.center;
    const radius = filter.spatialField.geometry.radius;
    const newCoords = reprojectGeoJson(filter.spatialField.geometry, filter.spatialField.geometry.projection || "EPSG:3857", nativeCrs).coordinates;
    const newCenter = center && (({x, y}) => [x, y])(reproject(center, srcProjection, nativeCrs));
    const newRadius = radius && reproject([radius, 0.0], srcProjection, nativeCrs).x;
    return {
        ...filter,
        spatialField: {
            ...filter.spatialField,
            geometry: {
                ...filter.spatialField.geometry,
                center: newCenter,
                radius: newRadius,
                coordinates: newCoords,
                projection: nativeCrs
            }
        }
    };
};
/**
 @return a filterObject ready to be stringified in a cql filter (Cql filter needs spatial filter in layer nativeCrs). If the filter has a spatialFilter this will be reprojected
            in native otherwise it will be stripped.
*/
export const normalizeFilterCQL = (filter, nativeCrs) => {
    if (filter && filter.spatialField && filter.spatialField.geometry && filter.spatialField.geometry.coordinates && filter.spatialField.geometry.coordinates[0] && (filter.spatialField.projection || "EPSG:3857") !== nativeCrs) {
        if (!nativeCrs) {
            return {...filter, spatialField: undefined};
        }
        return FilterUtils.reprojectFilterInNativeCrs(filter, nativeCrs);
    }
    return filter;
};

/**
 * Merges cql filter strings, with mapstore filter objects to make a single OGC filter string
 * @param {string} opts.ogcVersion ogc version string of final ogc filter
 * @param {string} opts.nsPlaceholder xlmns placeholder to use
 * @param {boolean} opts.addXmlnsToRoot add xmlns information to root ogc:Filter element
 * @param {string[]} opts.xmlnsToAdd xmlns strings to add to root ogc:Filter element if addXmlnsToRoot is true
 * @param {...string|object} filters filters to merge
 */
export const mergeFiltersToOGC = (opts = {}, ...filters) =>  {
    const {
        nsPlaceholder = 'ogc',
        ogcVersion: ogcVersionOpt = '2.0',
        addXmlnsToRoot = false,
        xmlnsToAdd = []
    } = opts;
    const fb = filterBuilder({
        filterNS: nsPlaceholder,
        wfsVersion: ogcVersionOpt,
        gmlVersion: wfsToGmlVersion(ogcVersionOpt)
    });
    const toFilter = fromObject(fb);

    const filterString = fb.filter(fb.and(
        ...flatten(filters
            .filter(filter => !!filter && (isString(filter) || isFilterValid(filter) && !filter.disabled))
            .map(filter => isString(filter) ? [toFilter(read(filter))] : toOGCFilterParts(filter, ogcVersionOpt, nsPlaceholder)))
    ));

    if (addXmlnsToRoot) {
        const filterTagEnd = filterString.indexOf('>');
        return `${filterString.slice(0, filterTagEnd)}${xmlnsToAdd.length > 0 ? ` ${xmlnsToAdd.join(' ')}` : ''}${filterString.slice(filterTagEnd)}`;
    }

    return filterString;
};

FilterUtils = {
    processOGCFilterGroup,
    processOGCFilterFields,
    processOGCCrossLayerFilter,
    getGetFeatureBase,
    toOGCFilterParts,
    findSubGroups,
    toCQLFilter,
    getCrossLayerCqlFilter,
    processCQLFilterGroup,
    processCQLSimpleFilterField,
    processCQLSpatialFilter,
    processCQLFilterFields,
    getCQLGeometryElement,
    cqlStringField,
    cqlDateField,
    cqlNumberField,
    cqlBooleanField,
    cqlListField,
    toOGCFilter,
    reprojectFilterInNativeCrs,
    processOGCSpatialFilter,
    mergeFiltersToOGC
};
