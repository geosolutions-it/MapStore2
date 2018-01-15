
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {processOGCGeometry, pointElement, polygonElement, lineStringElement, closePolygon } = require("./ogc/GML");
const {wfsToGmlVersion} = require('./ogc/WFS/base');
const {ogcComparisonOperators, ogcLogicalOperators, ogcSpatialOperators} = require("./ogc/Filter/operators");
const {get, isNil, isUndefined, isArray} = require('lodash');
const escapeCQLStrings = str => str && str.replace ? str.replace(/\'/g, "''") : str;

const checkOperatorValidity = (value, operator) => {
    return (!isNil(value) && operator !== "isNull" || !isUndefined(value) && operator === "isNull");
};
const wrapAttributeWithDoubleQuotes = a => "\"" + a + "\"";

const setupCrossLayerFilterDefaults = (crossLayerFilter) => {
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
var ogcVersion = "2.0";

const propertyTagReference = {
    "ogc": {startTag: "<ogc:PropertyName>", endTag: "</ogc:PropertyName>"},
    "fes": {startTag: "<fes:ValueReference>", endTag: "</fes:ValueReference>"}
};
const ogcDateField = (attribute, operator, value, nsplaceholder) => {
    let fieldFilter;
    if (operator === "><") {
        if (value.startDate && value.endDate) {
            const startIso = value.startDate.toISOString ? value.startDate.toISOString() : value.startDate; // for Compatibility reasons. We should use ISO string to store data.
            const endIso = value.startDate.toISOString ? value.startDate.toISOString() : value.startDate; // for Compatibility reasons. We should use ISO string to store data.
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

const ogcListField = (attribute, operator, value, nsplaceholder) => {
    let fieldFilter;
    if (isNil(value)) {
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

const ogcStringField = (attribute, operator, value, nsplaceholder) => {
    let fieldFilter;
    if (checkOperatorValidity(value, operator)) {
        if (operator === "isNull") {
            fieldFilter =
                ogcComparisonOperators[operator](nsplaceholder,
                    propertyTagReference[nsplaceholder].startTag +
                        attribute +
                    propertyTagReference[nsplaceholder].endTag
                );
        }else if (operator === "=") {
            fieldFilter =
                ogcComparisonOperators[operator](nsplaceholder,
                    propertyTagReference[nsplaceholder].startTag +
                        attribute +
                    propertyTagReference[nsplaceholder].endTag +
                    "<" + nsplaceholder + ":Literal>" + value + "</" + nsplaceholder + ":Literal>"
                );
        }else {
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
const ogcBooleanField = (attribute, operator, value, nsplaceholder) => {
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
const ogcNumberField = (attribute, operator, value, nsplaceholder) => {
    let fieldFilter;
    if (operator === "><") {
        if (!isNil(value) && (value.lowBound !== null && value.lowBound !== undefined) && (value.upBound === null || value.upBound === undefined)) {
            fieldFilter = ogcComparisonOperators[">="](nsplaceholder,
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                         "<" + nsplaceholder + ":Literal>" + value.lowBound + "</" + nsplaceholder + ":Literal>"
                        );
        }else if (!isNil(value) && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound === null || value.lowBound === undefined)) {
            fieldFilter = ogcComparisonOperators["<="](nsplaceholder,
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                         "<" + nsplaceholder + ":Literal>" + value.upBound + "</" + nsplaceholder + ":Literal>"
                     );
        }else if (!isNil(value) && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound !== null && value.lowBound !== undefined)) {
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
const processOGCSimpleFilterField = (field, nsplaceholder) => {
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

const cqlQueryCollection = ({typeName, geometryName, cqlFilter= "INCLUDE"} = {}) => `queryCollection('${typeName}', '${geometryName}','${escapeCQLStrings(cqlFilter)}')`;
const cqlCollectGeometries = (content) => `collectGeometries(${content})`;
const FilterUtils = {
    checkOperatorValidity,
    setupCrossLayerFilterDefaults,
    toOGCFilterParts: function(objFilter, versionOGC, nsplaceholder) {
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
        }else if (objFilter.simpleFilterFields && objFilter.simpleFilterFields.length > 0) {
            const OP = "AND";
            const ogc = ogcLogicalOperators[OP](nsplaceholder, objFilter.simpleFilterFields.map( (f) => processOGCSimpleFilterField(f, nsplaceholder)).join("") );
            filters.push(ogc);
        }

        let spatialFilter;
        if (objFilter.spatialField && objFilter.spatialField.geometry && objFilter.spatialField.operation) {
            if (objFilter.spatialField.operation === 'BBOX' && isArray(objFilter.spatialField.geometry && objFilter.spatialField.geometry.extent[0])) {
                const OP = "OR";
                const bBoxFilter = objFilter.spatialField.geometry.extent.reduce((a, extent) => {
                    let filter = Object.assign({}, objFilter);
                    filter.spatialField.geometry.extent = extent;
                    return a + this.processOGCSpatialFilter(versionOGC, filter, nsplaceholder);
                }, '');

                spatialFilter = ogcLogicalOperators[OP](nsplaceholder, bBoxFilter);

            } else {
                spatialFilter = this.processOGCSpatialFilter(versionOGC, objFilter, nsplaceholder);
            }

            filters.push(spatialFilter);
        }
        if (objFilter.crossLayerFilter) {
            let crossLayerFilter = {
                ...objFilter.crossLayerFilter,
                attribute: objFilter.crossLayerFilter.attribute // || (objFilter.spatialField && objFilter.spatialField.attribute)
            };
            if (Array.isArray()) {
                crossLayerFilter.forEach( f => filters.push(this.processOGCCrossLayerFilter(f, nsplaceholder)));
            } else {
                filters.push(this.processOGCCrossLayerFilter(crossLayerFilter, nsplaceholder));
            }
        }

        return filters;
    },
    toOGCFilter: function(ftName, json, version, sortOptions = null, hits = false, format = null, propertyNames = null, srsName = "EPSG:4326") {
        let objFilter;
        try {
            objFilter = json instanceof Object ? json : JSON.parse(json);
        } catch (e) {
            return e;
        }
        const versionOGC = normalizeVersion(version || ogcVersion);
        const nsplaceholder = versionOGC === "2.0" ? "fes" : "ogc";


        let ogcFilter = this.getGetFeatureBase(versionOGC, objFilter.pagination, hits, format);

        let filters = this.toOGCFilterParts(objFilter, versionOGC, nsplaceholder);
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
    },
    processOGCFilterGroup: function(root, objFilter, nsplaceholder) {
        let ogc = this.processOGCFilterFields(root, objFilter, nsplaceholder);

        let subGroups = this.findSubGroups(root, objFilter.groupFields);
        if (subGroups.length > 0) {
            subGroups.forEach((subGroup) => {
                ogc += this.processOGCFilterGroup(subGroup, objFilter, nsplaceholder);
            });
        }
        if (ogc !== "") {
            return ogcLogicalOperators[root.logic](nsplaceholder, ogc);
        }
        return "";
    },

    processOGCFilterFields: function(group, objFilter, nsplaceholder) {
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
    },

    processOGCSimpleFilterField,
    getGmlPointElement: (c, srs, v) => pointElement(c, srs, wfsToGmlVersion(v)),
    getGmlPolygonElement: (c, srs, v) => polygonElement(c, srs, wfsToGmlVersion(v)),
    getGmlLineStringElement: (c, srs, v) => lineStringElement(c, srs, wfsToGmlVersion(v)),
    processOGCGeometry: (v, geom) => processOGCGeometry(wfsToGmlVersion(v), geom),
    processOGCSpatialFilter: function(version, objFilter, nsplaceholder) {
        // collectGeometries has priority on the geometry
        // if it is present in the spatialField
        // the geometry have to be ignored in favor of crossLayer
        if (objFilter.spatialField.collectGeometries) {
            return FilterUtils.processOGCCrossLayerFilter(objFilter.spatialField);
        }
        let ogc =
            propertyTagReference[nsplaceholder].startTag +
                objFilter.spatialField.attribute +
            propertyTagReference[nsplaceholder].endTag;

        switch (objFilter.spatialField.operation) {
            case "INTERSECTS":
            case "DWITHIN":
            case "WITHIN":
            case "CONTAINS": {
                ogc += processOGCGeometry(wfsToGmlVersion(version), objFilter.spatialField.geometry);

                if (objFilter.spatialField.operation === "DWITHIN") {
                    ogc += '<' + nsplaceholder + ':Distance units="m">' + (objFilter.spatialField.geometry.distance || 0) + '</' + nsplaceholder + ':Distance>';
                }

                break;

            }
            case "BBOX": {
                let lowerCorner = objFilter.spatialField.geometry.extent[0] + " " + objFilter.spatialField.geometry.extent[1];
                let upperCorner = objFilter.spatialField.geometry.extent[2] + " " + objFilter.spatialField.geometry.extent[3];

                ogc +=
                        '<gml:Envelope' + ' srsName="' + objFilter.spatialField.geometry.projection + '">' +
                            '<gml:lowerCorner>' + lowerCorner + '</gml:lowerCorner>' +
                            '<gml:upperCorner>' + upperCorner + '</gml:upperCorner>' +
                        '</gml:Envelope>';

                break;
            }
            default:
                break;
        }

        return ogcSpatialOperators[objFilter.spatialField.operation](nsplaceholder, ogc);
    },
    getGetFeatureBase: function(version, pagination, hits, format) {
        let ver = normalizeVersion(version);

        let getFeature = '<wfs:GetFeature ';
        getFeature += format ? 'outputFormat="' + format + '" ' : '';
        getFeature += pagination && (pagination.startIndex || pagination.startIndex === 0) ? 'startIndex="' + pagination.startIndex + '" ' : "";

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
                    'xsi:schemaLocation="http://www.opengis.net/wfs ' +
                        'http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">';
            break;
        case "1.1.0":
            getFeature += pagination && pagination.maxFeatures ? 'maxFeatures="' + pagination.maxFeatures + '" ' : "";

            getFeature = hits ? getFeature + ' resultType="hits"' : getFeature;

            getFeature += 'service="WFS" version="' + ver + '" ' +
                    'xmlns:gml="http://www.opengis.net/gml" ' +
                    'xmlns:wfs="http://www.opengis.net/wfs" ' +
                    'xmlns:ogc="http://www.opengis.net/ogc" ' +
                    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xsi:schemaLocation="http://www.opengis.net/wfs ' +
                        'http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">';
            break;
        default: // default is wfs 2.0
            getFeature += pagination && pagination.maxFeatures ? 'count="' + pagination.maxFeatures + '" ' : "";

            getFeature = hits && !pagination ? getFeature + ' resultType="hits"' : getFeature;

            getFeature += 'service="WFS" version="' + ver + '" ' +
                    'xmlns:wfs="http://www.opengis.net/wfs/2.0" ' +
                    'xmlns:fes="http://www.opengis.net/fes/2.0" ' +
                    'xmlns:gml="http://www.opengis.net/gml/3.2" ' +
                    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xsi:schemaLocation="http://www.opengis.net/wfs/2.0 ' +
                        'http://schemas.opengis.net/wfs/2.0/wfs.xsd ' +
                        'http://www.opengis.net/gml/3.2 ' +
                        'http://schemas.opengis.net/gml/3.2.1/gml.xsd">';
        }

        return getFeature;
    },
    getCrossLayerCqlFilter: crossLayerFilter => get(crossLayerFilter, 'collectGeometries.queryCollection.cqlFilter')
        || (get(crossLayerFilter, 'collectGeometries.queryCollection.filterFields') || []).length > 0
            && (get(crossLayerFilter, 'collectGeometries.queryCollection.groupFields') || []).length > 0
            && FilterUtils.toCQLFilter(crossLayerFilter.collectGeometries.queryCollection)
        || "INCLUDE",
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
    processOGCCrossLayerFilter: function(crossLayerFilter, nsplaceholderparams) {
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
               `<ogc:Literal>${cqlFilter}</ogc:Literal>` +
             `</ogc:Function>` +
         `</ogc:Function>`;
        }
        if (crossLayerFilter.operation === "DWITHIN") {
            ogc += '<' + nsplaceholder + ':Distance units="m">' + (crossLayerFilter.distance || 0) + '</' + nsplaceholder + ':Distance>';
        }
        return ogcSpatialOperators[crossLayerFilter.operation](nsplaceholder, ogc);
    },
    toCQLFilter: function(json) {
        let objFilter;
        try {
            objFilter = json instanceof Object ? json : JSON.parse(json);
        } catch (e) {
            return e;
        }

        let filters = [];

        let attributeFilter;
        if (objFilter.filterFields && objFilter.filterFields.length > 0) {
            attributeFilter = this.processCQLFilterGroup(objFilter.groupFields[0], objFilter);
            if (attributeFilter) {
                filters.push(attributeFilter);
            }
        } else if (objFilter.simpleFilterFields && objFilter.simpleFilterFields.length > 0) {
            let simpleFilter = objFilter.simpleFilterFields.reduce((cql, field) => {
                let tmp = cql;
                let strFilter = this.processCQLSimpleFilterField(field);
                if (strFilter !== false) {
                    tmp = cql.length > 0 ? cql + " AND (" + strFilter + ")" : "(" + strFilter + ")";
                }
                return tmp;
            }, "");
            simpleFilter = simpleFilter.length > 0 ? simpleFilter : "INCLUDE";
            filters.push(simpleFilter);
        }

        let spatialFilter;
        if (objFilter.spatialField && objFilter.spatialField.geometry && objFilter.spatialField.operation) {
            spatialFilter = this.processCQLSpatialFilter(objFilter);
            filters.push(spatialFilter);
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
    },
    processCQLFilterGroup: function(root, objFilter) {
        let cql = this.processCQLFilterFields(root, objFilter);

        let subGroups = this.findSubGroups(root, objFilter.groupFields);
        if (subGroups.length > 0) {
            subGroups.forEach((subGroup) => {
                cql += " " + root.logic + " (" + this.processFilterGroup(subGroup) + ")";
            });
        }

        return cql;
    },

    getCQLGeometryElement: function(coordinates, type) {
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
    },

    processCQLSpatialFilter: function(objFilter) {
        let cql = objFilter.spatialField.operation + "(" +
            objFilter.spatialField.attribute + ", ";
        if (objFilter.spatialField.collectGeometries && objFilter.spatialField.collectGeometries.queryCollection) {
            cql += cqlCollectGeometries(cqlQueryCollection(objFilter.spatialField.collectGeometries.queryCollection));
        } else {
            cql += this.getCQLGeometryElement(objFilter.spatialField.geometry.coordinates, objFilter.spatialField.geometry.type);
        }


        return cql + ")";
    },

    cqlDateField: function(attribute, operator, value) {
        let fieldFilter;
        if (operator === "><") {
            if (value.startDate && value.endDate) {
                const startIso = value.startDate.toISOString ? value.startDate.toISOString() : value.startDate; // for Compatibility reasons. We should use ISO string to store data.
                const endIso = value.startDate.toISOString ? value.startDate.toISOString() : value.startDate; // for Compatibility reasons. We should use ISO string to store data.
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
    },
    escapeCQLStrings,
    cqlStringField: function(attribute, operator, value) {
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
    },
    /**
     * it creates a cql filter for boolean attributes
     * it ignores any operator beside "="
     * it ignores empty or falsy values
     * @param {string} attribute
     * @param {string} operator
     * @param {string|boolean} value can be a value between (t, tr, tru, true, f, fa, fal, fals, false) because geoserver accepts them
     * @return the cql filter in the form "attribute"='value'
    */
    cqlBooleanField: function(attribute, operator, value) {
        let fieldFilter = "";
        if (!isNil(value) && value !== "") {
            if (operator === "=") {
                let val = "'" + value + "'";
                fieldFilter = "\"" + attribute + "\"" + operator + val;
            }
        }
        return fieldFilter;
    },

    cqlNumberField: function(attribute, operator, value) {
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
    },

    findSubGroups: function(root, groups) {
        let subGroups = groups.filter((g) => g.groupId === root.id);
        return subGroups;
    },
    cqlListField: function(attribute, operator, value) {
        return this.cqlStringField(attribute, operator, value);
    },

    processCQLFilterFields: function(group, objFilter) {
        let fields = objFilter.filterFields.filter((field) => field.groupId === group.id);

        let filter = [];
        if (fields) {
            fields.forEach((field) => {
                let fieldFilter;

                switch (field.type) {
                case "date":
                case "time":
                case "date-time":
                    fieldFilter = this.cqlDateField(field.attribute, field.operator, field.value);
                    break;
                case "number":
                    fieldFilter = this.cqlNumberField(field.attribute, field.operator, field.value);
                    break;
                case "string":
                    fieldFilter = this.cqlStringField(field.attribute, field.operator, field.value);
                    break;
                case "boolean":
                    fieldFilter = this.cqlBooleanField(field.attribute, field.operator, field.value);
                    break;
                case "list":
                    fieldFilter = this.cqlListField(field.attribute, field.operator, field.value);
                    break;
                default:
                    break;
                }
                if (fieldFilter) {
                    filter.push(fieldFilter);
                }
            });

            filter = filter.join(" " + group.logic + " ");
        }

        return filter;
    },

    processCQLSimpleFilterField: function(field) {
        let strFilter = false;
        switch (field.type) {
        case "date":
            strFilter = this.cqlDateField(field.attribute, field.operator, field.values);
            break;
        case "number":
            strFilter = this.cqlNumberField(field.attribute, field.operator, field.values);
            break;
        case "string":
            strFilter = this.cqlStringField(field.attribute, field.operator, field.values);
            break;
        case "boolean":
            strFilter = this.cqlBooleanField(field.attribute, field.operator, field.values);
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
    },
    getOgcAllPropertyValue: function(featureTypeName, attribute) {
        return `<wfs:GetPropertyValue service="WFS" valueReference='${attribute}'
                    version="2.0" xmlns:fes="http://www.opengis.net/fes/2.0"
                    xmlns:gml="http://www.opengis.net/gml/3.2"
                    xmlns:wfs="http://www.opengis.net/wfs/2.0"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xsi:schemaLocation="http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd">
                        <wfs:Query typeNames="${featureTypeName}"/>
                </wfs:GetPropertyValue>`;
    },
    getSLD: function(ftName, json, version) {
        let filter = this.toOGCFilter(ftName, json, version);
        let sIdx = filter.search( `<${this.nsplaceholder}:Filter>`);
        if (sIdx !== -1) {
            let eIndx = filter.search( `</wfs:Query>`);
            filter = filter.substr(sIdx, eIndx - sIdx);
        } else {
            filter = '';
        }
        return `<StyledLayerDescriptor version="1.0.0"
                xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gml="http://www.opengis.net/gml" xmlns:gsml="urn:cgi:xmlns:CGI:GeoSciML:2.0" xmlns:sld="http://www.opengis.net/sld" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><NamedLayer><Name>${ftName}</Name><UserStyle><FeatureTypeStyle><Rule >${filter}<PointSymbolizer><Graphic><Mark><WellKnownName>circle</WellKnownName><Fill><CssParameter name="fill">#0000FF</CssParameter></Fill></Mark><Size>20</Size></Graphic></PointSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>`;
    },
    ogcNumberField,
    ogcDateField,
    ogcListField,
    ogcBooleanField,
    ogcStringField,
    isLikeOrIlike: (operator) => operator === "ilike" || operator === "like",
    isFilterValid: (f = {}) =>
        (f.filterFields && f.filterFields.length > 0)
        || (f.simpleFilterFields && f.simpleFilterFields.length > 0)
        || (f.spatialField && f.spatialField.geometry && f.spatialField.operation)
        || (f.crossLayerFilter
            && f.crossLayerFilter.collectGeometries
            && f.crossLayerFilter.collectGeometries.queryCollection
            && f.crossLayerFilter.collectGeometries.queryCollection.geometryName
            && f.crossLayerFilter.collectGeometries.queryCollection.typeName)
};

module.exports = FilterUtils;
