
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
var ogcComparisonOperators = {
    "=": {startTag: "<{namespace}:PropertyIsEqualTo>", endTag: "</{namespace}:PropertyIsEqualTo>"},
    ">": {startTag: "<{namespace}:PropertyIsGreaterThan>", endTag: "</{namespace}:PropertyIsGreaterThan>"},
    "<": {startTag: "<{namespace}:PropertyIsLessThan>", endTag: "</{namespace}:PropertyIsLessThan>"},
    ">=": {startTag: "<{namespace}:PropertyIsGreaterThanOrEqualTo>", endTag: "</{namespace}:PropertyIsGreaterThanOrEqualTo>"},
    "<=": {startTag: "<{namespace}:PropertyIsLessThanOrEqualTo>", endTag: "</{namespace}:PropertyIsLessThanOrEqualTo>"},
    "<>": {startTag: "<{namespace}:PropertyIsNotEqualTo>", endTag: "</{namespace}:PropertyIsNotEqualTo>"},
    "><": {startTag: "<{namespace}:PropertyIsBetween>", endTag: "</{namespace}:PropertyIsBetween>"},
    "like": {startTag: "<{namespace}:PropertyIsLike matchCase=\"true\" wildCard=\"*\" singleChar=\".\" escapeChar=\"!\">", endTag: "</{namespace}:PropertyIsLike>"},
    "ilike": {startTag: "<{namespace}:PropertyIsLike matchCase=\"false\" wildCard=\"*\" singleChar=\".\" escapeChar=\"!\">  ", endTag: "</{namespace}:PropertyIsLike>"},
    "isNull": {startTag: "<{namespace}:PropertyIsNull>", endTag: "</{namespace}:PropertyIsNull>"}
};
var ogcLogicalOperator = {
    "AND": {startTag: "<{namespace}:And>", endTag: "</{namespace}:And>"},
    "OR": {startTag: "<{namespace}:Or>", endTag: "</{namespace}:Or>"},
    "AND NOT": {startTag: "<{namespace}:Not>", endTag: "</{namespace}:Not>"}
};
var ogcSpatialOperator = {
    "INTERSECTS": {startTag: "<{namespace}:Intersects>", endTag: "</{namespace}:Intersects>"},
    "BBOX": {startTag: "<{namespace}:BBOX>", endTag: "</{namespace}:BBOX>"},
    "CONTAINS": {startTag: "<{namespace}:Contains>", endTag: "</{namespace}:Contains>"},
    "DWITHIN": {startTag: "<{namespace}:DWithin>", endTag: "</{namespace}:DWithin>"},
    "WITHIN": {startTag: "<{namespace}:Within>", endTag: "</{namespace}:Within>"}
};
var propertyTagReference = {
    "ogc": {startTag: "<ogc:PropertyName>", endTag: "</ogc:PropertyName>"},
    "fes": {startTag: "<fes:ValueReference>", endTag: "</fes:ValueReference>"}
};
var getCQLGeometryElement = function(coordinates, type) {
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
                let coords = element.map((coordinate) => {
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
                    let coords = element.map((coordinate) => {
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
var processCQLSpatialFilter = function(json) {
    let cql = json.spatialField.operation + "(" +
        json.spatialField.attribute + ", ";

    cql += getCQLGeometryElement(json.spatialField.geometry.coordinates, json.spatialField.geometry.type);

    return cql + ")";
};
var cqlDateField = function(attribute, operator, value) {
    let fieldFilter;
    if (operator === "><") {
        if (value.startDate && value.endDate) {
            fieldFilter = "(" + attribute + ">='" + value.startDate.toISOString() +
                "' AND " + attribute + "<='" + value.endDate.toISOString() + "')";
        }
    } else {
        if (value.startDate) {
            fieldFilter = attribute + operator + "'" + value.startDate.toISOString() + "'";
        }
    }
    return fieldFilter;
};
var cqlStringField = function(attribute, operator, value) {
    let fieldFilter;
    if (value) {
        if (operator === "isNull") {
            fieldFilter = "isNull(" + attribute + ")=true";
        } else if (operator === "=") {
            let val = "'" + value + "'";
            fieldFilter = attribute + operator + val;
        } else if (operator === "ilike") {
            let val = "'%" + value.toLowerCase() + "%'";
            fieldFilter = "strToLowerCase(" + attribute + ") LIKE " + val;
        } else {
            let val = "'%" + value + "%'";
            fieldFilter = attribute + "LIKE " + val;
        }
    }
    return fieldFilter;
};
var cqlNumberField = function(attribute, operator, value) {
    let fieldFilter;
    if (operator === "><") {
        if (value && (value.lowBound !== null && value.lowBound !== undefined) && (value.upBound === null || value.upBound === undefined)) {
            fieldFilter = "(" + attribute + ">='" + value.lowBound + "')";
        }else if (value && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound === null || value.lowBound === undefined)) {
            fieldFilter = "(" + attribute + "<='" + value.upBound + "')";
        } else if (value && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound !== null && value.lowBound !== undefined)) {
            fieldFilter = "(" + attribute + ">='" + value.lowBound +
                "' AND " + attribute + "<='" + value.upBound + "')";
        }
    } else {
        let val = value && (value.lowBound !== null && value.lowBound !== undefined) ? value.lowBound : value;
        if (val ) {
            fieldFilter = attribute + operator + "'" + val + "'";
        }
    }
    return fieldFilter;
};
var findSubGroups = function(root, groups) {
    let subGroups = groups.filter((g) => g.groupId === root.id);
    return subGroups;
};
var cqlListField = function(attribute, operator, value) {
    return cqlStringField(attribute, operator, value);
};
var processCQLSimpleFilterField = function(field) {
    let strFilter = false;
    switch (field.type) {
        case "date":
            strFilter = cqlDateField(field.attribute, field.operator, field.values);
            break;
        case "number":
            strFilter = cqlNumberField(field.attribute, field.operator, field.values);
            break;
        case "string":
            strFilter = cqlStringField(field.attribute, field.operator, field.values);
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
                    strFilter = (strFilter) ? strFilter + " OR isNull(" + field.attribute + ")=true" : "isNull(" + field.attribute + ")=true";
                }
            }
            break;
        }
        default:
            break;
    }

    return (strFilter && strFilter.length > 0) ? strFilter : false;
};
var processCQLFilterFields = function(group, json) {
    let fields = json.filterFields.filter((field) => field.groupId === group.id);

    let filter = [];
    if (fields) {
        fields.forEach((field) => {
            let fieldFilter;

            switch (field.type) {
                case "date":
                    fieldFilter = cqlDateField(field.attribute, field.operator, field.value);
                    break;
                case "number":
                    fieldFilter = cqlNumberField(field.attribute, field.operator, field.value);
                    break;
                case "string":
                    fieldFilter = cqlStringField(field.attribute, field.operator, field.value);
                    break;
                case "list":
                    fieldFilter = cqlListField(field.attribute, field.operator, field.value);
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
};
var getGmlPolygonElement = function(coordinates, srsName, version) {
    let gmlPolygon = '<gml:Polygon';

    gmlPolygon += srsName ? ' srsName="' + srsName + '">' : '>';

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // Array of LinearRing coordinate array. The first element in the array represents the exterior ring.
    // Any subsequent elements represent interior rings (or holes).
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    coordinates.forEach((element, index) => {
        let coords = element.map((coordinate) => {
            return coordinate[0] + (version === "1.0.0" ? "," : " ") + coordinate[1];
        });
        const exterior = (version === "1.0.0" ? "outerBoundaryIs" : "exterior");
        const interior = (version === "1.0.0" ? "innerBoundaryIs" : "exterior");
        gmlPolygon +=
            (index < 1 ? '<gml:' + exterior + '>' : '<gml:' + interior + '>') +
                    '<gml:LinearRing>' +
                    (version === "1.0.0" ? '<gml:coordinates>' : '<gml:posList>') +
                            coords.join(" ") +
                    (version === "1.0.0" ? '</gml:coordinates>' : '</gml:posList>') +
                    '</gml:LinearRing>' +
            (index < 1 ? '</gml:' + exterior + '>' : '</gml:' + interior + '>');
    });

    gmlPolygon += '</gml:Polygon>';
    return gmlPolygon;
};
var getGmlPointElement = function(coordinates, srsName, version) {
    let gmlPoint = '<gml:Point srsDimension="2"';

    gmlPoint += srsName ? ' srsName="' + srsName + '">' : '>';

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // Array of LinearRing coordinate array. The first element in the array represents the exterior ring.
    // Any subsequent elements represent interior rings (or holes).
    // ///////////////////////////////////////////////////////////////////////////////////////////////////////
    coordinates.forEach((element) => {
        let coords = element.map((coordinate) => {
            return coordinate[0] + " " + coordinate[1];
        });
        if (version === "1.0.0") {
            gmlPoint += '<gml:coord><X>' + element[0][0] + '</X><Y>' + element[0][1] + '</Y></gml:coord>';
        } else {
            gmlPoint += '<gml:pos>' + coords.join(" ") + '</gml:pos>';
        }
    });

    gmlPoint += '</gml:Point>';
    return gmlPoint;
};
var getGetFeatureBase = function(version, pagination, hits, format) {
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
};

var processCQLFilterGroup = function(root, json) {
    let cql = processCQLFilterFields(root, json);

    let subGroups = findSubGroups(root, json.groupFields);
    if (subGroups.length > 0) {
        subGroups.forEach((subGroup) => {
            cql += " " + root.logic + " (" + this.processFilterGroup(subGroup) + ")";
        });
    }

    return cql;
};

var ogcDateField = function(attribute, operator, value, nsplaceholder) {
    let fieldFilter;
    if (operator === "><") {
        if (value.startDate && value.endDate) {
            fieldFilter =
                        ogcComparisonOperators[operator].startTag +
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                            "<" + nsplaceholder + ":LowerBoundary>" +
                                "<" + nsplaceholder + ":Literal>" + value.startDate.toISOString() + "</" + nsplaceholder + ":Literal>" +
                            "</" + nsplaceholder + ":LowerBoundary>" +
                            "<" + nsplaceholder + ":UpperBoundary>" +
                                "<" + nsplaceholder + ":Literal>" + value.endDate.toISOString() + "</" + nsplaceholder + ":Literal>" +
                            "</" + nsplaceholder + ":UpperBoundary>" +
                        ogcComparisonOperators[operator].endTag;
        }
    } else {
        if (value.startDate) {
            fieldFilter =
                        ogcComparisonOperators[operator].startTag +
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                            "<" + nsplaceholder + ":Literal>" + value.startDate.toISOString() + "</" + nsplaceholder + ":Literal>" +
                        ogcComparisonOperators[operator].endTag;
        }
    }
    return fieldFilter;
};

var ogcListField = function(attribute, operator, value, nsplaceholder) {
    let fieldFilter;
    if (value) {
        fieldFilter =
            ogcComparisonOperators[operator].startTag +
                propertyTagReference[nsplaceholder].startTag +
                    attribute +
                propertyTagReference[nsplaceholder].endTag +
                "<" + nsplaceholder + ":Literal>" + value + "</" + nsplaceholder + ":Literal>" +
            ogcComparisonOperators[operator].endTag;
    }
    return fieldFilter;
};

var ogcStringField = function(attribute, operator, value, nsplaceholder) {
    let fieldFilter;
    if (value) {
        if (operator === "isNull") {
            fieldFilter =
                ogcComparisonOperators[operator].startTag +
                    propertyTagReference[nsplaceholder].startTag +
                        attribute +
                    propertyTagReference[nsplaceholder].endTag +
                ogcComparisonOperators[operator].endTag;
        }else if (operator === "=") {
            fieldFilter =
                ogcComparisonOperators[operator].startTag +
                    propertyTagReference[nsplaceholder].startTag +
                        attribute +
                    propertyTagReference[nsplaceholder].endTag +
                    "<" + nsplaceholder + ":Literal>" + value + "</" + nsplaceholder + ":Literal>" +
                ogcComparisonOperators[operator].endTag;
        }else {
            fieldFilter =
                ogcComparisonOperators[operator].startTag +
                    propertyTagReference[nsplaceholder].startTag +
                        attribute +
                    propertyTagReference[nsplaceholder].endTag +
                    "<" + nsplaceholder + ":Literal>*" + value + "*</" + nsplaceholder + ":Literal>" +
                ogcComparisonOperators[operator].endTag;
        }
    }
    return fieldFilter;
};

var ogcNumberField = function(attribute, operator, value, nsplaceholder) {
    let fieldFilter;
    if (operator === "><") {
        if (value && (value.lowBound !== null && value.lowBound !== undefined) && (value.upBound === null || value.upBound === undefined)) {
            fieldFilter = ogcComparisonOperators[">="].startTag +
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                         "<" + nsplaceholder + ":Literal>" + value.lowBound + "</" + nsplaceholder + ":Literal>" +
                                    ogcComparisonOperators[">="].endTag;
        }else if (value && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound === null || value.lowBound === undefined)) {
            fieldFilter = ogcComparisonOperators["<="].startTag +
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                         "<" + nsplaceholder + ":Literal>" + value.upBound + "</" + nsplaceholder + ":Literal>" +
                                    ogcComparisonOperators["<="].endTag;
        }else if (value && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound !== null && value.lowBound !== undefined)) {
            fieldFilter =
                        ogcComparisonOperators[operator].startTag +
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                            "<" + nsplaceholder + ":LowerBoundary>" +
                                "<" + nsplaceholder + ":Literal>" + value.lowBound + "</" + nsplaceholder + ":Literal>" +
                            "</" + nsplaceholder + ":LowerBoundary>" +
                            "<" + nsplaceholder + ":UpperBoundary>" +
                                "<" + nsplaceholder + ":Literal>" + value.upBound + "</" + nsplaceholder + ":Literal>" +
                            "</" + nsplaceholder + ":UpperBoundary>" +
                        ogcComparisonOperators[operator].endTag;
        }
    } else {
        let val = value && (value.lowBound !== null && value.lowBound !== undefined) ? value.lowBound : value;
        if (val) {
            fieldFilter = ogcComparisonOperators[operator].startTag +
                            propertyTagReference[nsplaceholder].startTag +
                                attribute +
                            propertyTagReference[nsplaceholder].endTag +
                         "<" + nsplaceholder + ":Literal>" + val + "</" + nsplaceholder + ":Literal>" +
                                    ogcComparisonOperators[operator].endTag;
        }
    }
    return fieldFilter;
};


var processOGCFilterFields = function(group, json, nsplaceholder) {
    let fields = group ? json.filterFields.filter((field) => field.groupId === group.id) : json.filterFields;
    let filter = [];

    if (fields) {
        filter = fields.reduce((arr, field) => {
            let fieldFilter;
            switch (field.type) {
                case "date":
                    fieldFilter = ogcDateField(field.attribute, field.operator, field.value, nsplaceholder);
                    break;
                case "number":
                    fieldFilter = ogcNumberField(field.attribute, field.operator, field.value, nsplaceholder);
                    break;
                case "string":
                    fieldFilter = ogcStringField(field.attribute, field.operator, field.value, nsplaceholder);
                    break;
                case "list":
                    fieldFilter = ogcListField(field.attribute, field.operator, field.value, nsplaceholder);
                    break;
                default:
                    break;
            }
            if (fieldFilter) {
                arr.push(fieldFilter);
            }
            return arr;
        }, []);

        filter = filter.join("");
    }

    return filter;
};

var processOGCSimpleFilterField = function(field, nsplaceholder) {
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
        case "list": {
            if (field.values && field.values.length > 0 ) {
                filter = field.values.reduce((ogc, val) => {
                    let op = (val === null || val === "null") ? "isNull" : "=";
                    return ogc + ogcStringField(field.attribute, op, val, nsplaceholder);
                }, ogcLogicalOperator.OR.startTag);
                filter += ogcLogicalOperator.OR.endTag;
            }
            break;
        }
        default:
            break;
    }
    return filter;
};

var processOGCFilterGroup = function(root, json, nsplaceholder) {
    let ogc =
        ogcLogicalOperator[root.logic].startTag +
        processOGCFilterFields(root, json, nsplaceholder);

    let subGroups = findSubGroups(root, json.groupFields);
    if (subGroups.length > 0) {
        subGroups.forEach((subGroup) => {
            ogc += processOGCFilterGroup(subGroup, nsplaceholder);
        });
    }

    ogc += ogcLogicalOperator[root.logic].endTag;

    return ogc;
};

var processOGCSpatialFilter = function(version, json, nsplaceholder) {
    let ogc = ogcSpatialOperator[json.spatialField.operation].startTag;
    ogc +=
        propertyTagReference[nsplaceholder].startTag +
            json.spatialField.attribute +
        propertyTagReference[nsplaceholder].endTag;

    switch (json.spatialField.operation) {
        case "INTERSECTS":
        case "DWITHIN":
        case "WITHIN":
        case "CONTAINS": {
            switch (json.spatialField.geometry.type) {
                case "Point":
                    ogc += getGmlPointElement(json.spatialField.geometry.coordinates,
                        json.spatialField.geometry.projection || "EPSG:4326", version);
                    break;
                case "MultiPoint":
                    ogc += '<gml:MultiPoint srsName="' + (json.spatialField.geometry.projection || "EPSG:4326") + '">';

                    // //////////////////////////////////////////////////////////////////////////
                    // Coordinates of a MultiPoint are an array of positions
                    // //////////////////////////////////////////////////////////////////////////
                    json.spatialField.geometry.coordinates.forEach((element) => {
                        let point = element;
                        if (point) {
                            ogc += "<gml:pointMember>";
                            ogc += getGmlPointElement(point, version);
                            ogc += "</gml:pointMember>";
                        }
                    });

                    ogc += '</gml:MultiPoint>';
                    break;
                case "Polygon":
                    ogc += getGmlPolygonElement(json.spatialField.geometry.coordinates,
                        json.spatialField.geometry.projection || "EPSG:4326", version);
                    break;
                case "MultiPolygon":
                    const multyPolygonTagName = version === "2.0" ? "MultiSurface" : "MultiPolygon";
                    const polygonMemberTagName = version === "2.0" ? "surfaceMembers" : "polygonMember";

                    ogc += '<gml:' + multyPolygonTagName + ' srsName="' + (json.spatialField.geometry.projection || "EPSG:4326") + '">';

                    // //////////////////////////////////////////////////////////////////////////
                    // Coordinates of a MultiPolygon are an array of Polygon coordinate arrays
                    // //////////////////////////////////////////////////////////////////////////
                    json.spatialField.geometry.coordinates.forEach((element) => {
                        let polygon = element;
                        if (polygon) {
                            ogc += "<gml:" + polygonMemberTagName + ">";
                            ogc += getGmlPolygonElement(polygon, version);
                            ogc += "</gml:" + polygonMemberTagName + ">";
                        }
                    });

                    ogc += '</gml:' + multyPolygonTagName + '>';
                    break;
                default:
                    break;
            }

            if (json.spatialField.operation === "DWITHIN") {
                ogc += '<' + nsplaceholder + ':Distance units="m">' + (json.spatialField.geometry.distance || 0) + '</' + nsplaceholder + ':Distance>';
            }

            break;
        }
        case "BBOX": {
            let lowerCorner = json.spatialField.geometry.extent[0] + " " + json.spatialField.geometry.extent[1];
            let upperCorner = json.spatialField.geometry.extent[2] + " " + json.spatialField.geometry.extent[3];

            ogc +=
                '<gml:Envelope' + ' srsName="' + json.spatialField.geometry.projection + '">' +
                    '<gml:lowerCorner>' + lowerCorner + '</gml:lowerCorner>' +
                    '<gml:upperCorner>' + upperCorner + '</gml:upperCorner>' +
                '</gml:Envelope>';

            break;
        }
        default:
            break;
    }

    ogc += ogcSpatialOperator[json.spatialField.operation].endTag;
    return ogc;
};

const FilterUtils = {

    toOGCFilter: function(ftName, json, version, sortOptions = null, hits = false, format = null, propertyNames = null) {

        const versionOGC = normalizeVersion(version || ogcVersion);
        const nsplaceholder = versionOGC === "2.0" ? "fes" : "ogc";

        this.setOperatorsPlaceholders("{namespace}", nsplaceholder);

        let ogcFilter = getGetFeatureBase(versionOGC, json.pagination, hits, format);
        let filters = [];

        let attributeFilter;
        if (json.filterFields && json.filterFields.length > 0) {
            if (json.groupFields && json.groupFields.length > 0) {
                attributeFilter = processOGCFilterGroup(json.groupFields[0], json, nsplaceholder);
            } else {
                attributeFilter = processOGCFilterFields(json, nsplaceholder);
            }
            filters.push(attributeFilter);
        }else if (json.simpleFilterFields && json.simpleFilterFields.length > 0) {
            let ogc = "";
            ogc += ogcLogicalOperator.AND.startTag;
            json.simpleFilterFields.forEach((filter) => {
                ogc += processOGCSimpleFilterField(filter, nsplaceholder);
            }, this);
            ogc += ogcLogicalOperator.AND.endTag;
            filters.push(ogc);
        }

        let spatialFilter;
        if (json.spatialField && json.spatialField.geometry && json.spatialField.operation) {
            spatialFilter = processOGCSpatialFilter(versionOGC, json, nsplaceholder);
            filters.push(spatialFilter);
        }
        if (json.crossLayerFilter) {
            let crossLayerFilter = json.crossLayerFilter;
            if (Array.isArray()) {
                crossLayerFilter.forEach( f => filters.push(this.processOGCCrossLayerFilter(f, nsplaceholder)));
            } else {
                filters.push(this.processOGCCrossLayerFilter(crossLayerFilter, nsplaceholder));
            }
        }

        let filter = "<" + nsplaceholder + ":Filter>";

        if (filters.length > 1) {
            filter += "<" + nsplaceholder + ":And>";
            filters.forEach((subFilter) => {
                filter += subFilter;
            });
            filter += "</" + nsplaceholder + ":And>";
        } else {
            filter += filters[0];
        }

        filter += "</" + nsplaceholder + ":Filter>";

        ogcFilter += '<wfs:Query ' + (versionOGC === "2.0" ? "typeNames" : "typeName") + '="' + ftName + '" srsName="EPSG:4326">';
        ogcFilter += filter;
        if (propertyNames) {
            ogcFilter += propertyNames.map( name => (
                propertyTagReference[nsplaceholder].startTag +
                name +
                propertyTagReference[nsplaceholder].endTag )).join("");
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

        this.setOperatorsPlaceholders(nsplaceholder, "{namespace}");

        return ogcFilter;
    },

    setOperatorsPlaceholders: function(placeholder, replacement) {
        [
            ogcLogicalOperator,
            ogcComparisonOperators,
            ogcSpatialOperator
        ].forEach((operator) => {
            for (let op in operator) {
                if (operator.hasOwnProperty(op)) {
                    operator[op].startTag = operator[op].startTag.replace(placeholder, replacement);
                    operator[op].endTag = operator[op].endTag.replace(placeholder, replacement);
                }
            }
        });
    },
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
    processOGCCrossLayerFilter: function(crossLayerFilter, nsplaceholder) {
        let ogc = ogcSpatialOperator[crossLayerFilter.operation].startTag;
        ogc +=
            propertyTagReference[nsplaceholder].startTag +
                crossLayerFilter.attribute +
            propertyTagReference[nsplaceholder].endTag;
        // only collectGeometries is supported now
        if (crossLayerFilter.collectGeometries) {
            ogc += `<ogc:Function name="collectGeometries">` +
             `<ogc:Function name="queryCollection">` +
               `<ogc:Literal>${crossLayerFilter.collectGeometries.queryCollection.typeName}</ogc:Literal>` +
               `<ogc:Literal>${crossLayerFilter.collectGeometries.queryCollection.geometryName}</ogc:Literal>` +
               `<ogc:Literal>${crossLayerFilter.collectGeometries.queryCollection.cqlFilter}</ogc:Literal>` +
             `</ogc:Function>` +
         `</ogc:Function>`;
        }
        if (crossLayerFilter.operation === "DWITHIN") {
            ogc += '<' + nsplaceholder + ':Distance units="m">' + (crossLayerFilter.distance || 0) + '</' + nsplaceholder + ':Distance>';
        }

        ogc += ogcSpatialOperator[crossLayerFilter.operation].endTag;
        return ogc;
    },
    toCQLFilter: function(json) {

        let filters = [];

        let attributeFilter;
        if (json.filterFields && json.filterFields.length > 0) {
            attributeFilter = processCQLFilterGroup(json.groupFields[0], json);
            filters.push(attributeFilter);
        }else if (json.simpleFilterFields && json.simpleFilterFields.length > 0) {
            let simpleFilter = json.simpleFilterFields.reduce((cql, field) => {
                let tmp = cql;
                let strFilter = processCQLSimpleFilterField(field);
                if (strFilter !== false) {
                    tmp = cql.length > 0 ? cql + " AND (" + strFilter + ")" : "(" + strFilter + ")";
                }
                return tmp;
            }, "");
            simpleFilter = simpleFilter.length > 0 ? simpleFilter : "INCLUDE";
            filters.push(simpleFilter);
        }

        let spatialFilter;
        if (json.spatialField && json.spatialField.geometry && json.spatialField.operation) {
            spatialFilter = processCQLSpatialFilter(json);
            filters.push(spatialFilter);
        }

        return "(" + (filters.length > 1 ? filters.join(") AND (") : filters[0]) + ")";
    }
};

module.exports = FilterUtils;
