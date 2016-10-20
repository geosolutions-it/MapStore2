/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const FilterUtils = {
    ogcVersion: "2.0",
    ogcLogicalOperator: {
        "AND": {startTag: "<{namespace}:And>", endTag: "</{namespace}:And>"},
        "OR": {startTag: "<{namespace}:Or>", endTag: "</{namespace}:Or>"},
        "AND NOT": {startTag: "<{namespace}:Not>", endTag: "</{namespace}:Not>"}
    },
    ogcComparisonOperators: {
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
    },
    ogcSpatialOperator: {
        "INTERSECTS": {startTag: "<{namespace}:Intersects>", endTag: "</{namespace}:Intersects>"},
        "BBOX": {startTag: "<{namespace}:BBOX>", endTag: "</{namespace}:BBOX>"},
        "CONTAINS": {startTag: "<{namespace}:Contains>", endTag: "</{namespace}:Contains>"},
        "DWITHIN": {startTag: "<{namespace}:DWithin>", endTag: "</{namespace}:DWithin>"},
        "WITHIN": {startTag: "<{namespace}:Within>", endTag: "</{namespace}:Within>"}
    },
    propertyTagReference: {
        "ogc": {startTag: "<ogc:PropertyName>", endTag: "</ogc:PropertyName>"},
        "fes": {startTag: "<fes:ValueReference>", endTag: "</fes:ValueReference>"}
    },
    toOGCFilter: function(ftName, json, version, sortOptions = null, hits = false, format = null) {
        try {
            this.objFilter = (json instanceof Object) ? json : JSON.parse(json);
        } catch(e) {
            return e;
        }

        const versionOGC = version || this.ogcVersion;
        this.nsplaceholder = versionOGC === "2.0" ? "fes" : "ogc";

        this.setOperatorsPlaceholders("{namespace}", this.nsplaceholder);

        let ogcFilter = this.getGetFeatureBase(versionOGC, this.objFilter.pagination, hits, format);
        let filters = [];

        let attributeFilter;
        if (this.objFilter.filterFields && this.objFilter.filterFields.length > 0) {
            if (this.objFilter.groupFields && this.objFilter.groupFields.length > 0) {
                attributeFilter = this.processOGCFilterGroup(this.objFilter.groupFields[0]);
            } else {
                attributeFilter = this.processOGCFilterFields();
            }
            filters.push(attributeFilter);
        }else if (this.objFilter.simpleFilterFields && this.objFilter.simpleFilterFields.length > 0) {
            let ogc = "";
            ogc += this.ogcLogicalOperator.AND.startTag;
            this.objFilter.simpleFilterFields.forEach((filter) => {
                ogc += this.processOGCSimpleFilterField(filter);
            }, this);
            ogc += this.ogcLogicalOperator.AND.endTag;
            filters.push(ogc);
        }

        let spatialFilter;
        if (this.objFilter.spatialField && this.objFilter.spatialField.geometry && this.objFilter.spatialField.operation) {
            spatialFilter = this.processOGCSpatialFilter(versionOGC);
            filters.push(spatialFilter);
        }

        let filter = "<" + this.nsplaceholder + ":Filter>";

        if (filters.length > 1) {
            filter += "<" + this.nsplaceholder + ":And>";
            filters.forEach((subFilter) => {
                filter += subFilter;
            });
            filter += "</" + this.nsplaceholder + ":And>";
        } else {
            filter += filters[0];
        }

        filter += "</" + this.nsplaceholder + ":Filter>";

        ogcFilter += '<wfs:Query ' + (versionOGC === "2.0" ? "typeNames" : "typeName") + '="' + ftName + '" srsName="EPSG:4326">';
        ogcFilter += filter;

        if (sortOptions && sortOptions.sortBy && sortOptions.sortOrder) {
            ogcFilter +=
                "<" + this.nsplaceholder + ":SortBy>" +
                    "<" + this.nsplaceholder + ":SortProperty>" +
                        this.propertyTagReference[this.nsplaceholder].startTag +
                            sortOptions.sortBy +
                        this.propertyTagReference[this.nsplaceholder].endTag +
                        "<" + this.nsplaceholder + ":SortOrder>" +
                            sortOptions.sortOrder +
                        "</" + this.nsplaceholder + ":SortOrder>" +
                    "</" + this.nsplaceholder + ":SortProperty>" +
                "</" + this.nsplaceholder + ":SortBy>";
        }

        ogcFilter +=
                    '</wfs:Query>' +
            '</wfs:GetFeature>';

        this.setOperatorsPlaceholders(this.nsplaceholder, "{namespace}");

        return ogcFilter;
    },
    setOperatorsPlaceholders: function(placeholder, replacement) {
        [
            this.ogcLogicalOperator,
            this.ogcComparisonOperators,
            this.ogcSpatialOperator
        ].forEach((operator) => {
            for (let op in operator) {
                if (operator.hasOwnProperty(op)) {
                    operator[op].startTag = operator[op].startTag.replace(placeholder, replacement);
                    operator[op].endTag = operator[op].endTag.replace(placeholder, replacement);
                }
            }
        });
    },
    getGetFeatureBase: function(version, pagination, hits, format) {
        let ver = !version ? "2.0" : version;

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
    processOGCFilterGroup: function(root) {
        let ogc =
            this.ogcLogicalOperator[root.logic].startTag +
            this.processOGCFilterFields(root);

        let subGroups = this.findSubGroups(root, this.objFilter.groupFields);
        if (subGroups.length > 0) {
            subGroups.forEach((subGroup) => {
                ogc += this.processOGCFilterGroup(subGroup);
            });
        }

        ogc += this.ogcLogicalOperator[root.logic].endTag;

        return ogc;
    },
    processOGCFilterFields: function(group) {
        let fields = group ? this.objFilter.filterFields.filter((field) => field.groupId === group.id) : this.objFilter.filterFields;
        let filter = [];

        if (fields) {
            filter = fields.reduce((arr, field) => {
                let fieldFilter;
                switch (field.type) {
                    case "date":
                        fieldFilter = this.ogcDateField(field.attribute, field.operator, field.value);
                        break;
                    case "number":
                        fieldFilter = this.ogcNumberField(field.attribute, field.operator, field.value);
                        break;
                    case "string":
                        fieldFilter = this.ogcStringField(field.attribute, field.operator, field.value);
                        break;
                    case "list":
                        fieldFilter = this.ogcListField(field.attribute, field.operator, field.value);
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
    },
    processOGCSimpleFilterField: function(field) {
        let filter = "";
        switch (field.type) {
            case "date":
                filter = this.ogcDateField(field.attribute, field.operator, field.values);
                break;
            case "number":
                filter = this.ogcNumberField(field.attribute, field.operator, field.values);
                break;
            case "string":
                filter = this.ogcStringField(field.attribute, field.operator, field.values);
                break;
            case "list": {
                if (field.values && field.values.length > 0 ) {
                    filter = field.values.reduce((ogc, val) => {
                        let op = (val === null || val === "null") ? "isNull" : "=";
                        return ogc + this.ogcStringField(field.attribute, op, val);
                    }, this.ogcLogicalOperator.OR.startTag);
                    filter += this.ogcLogicalOperator.OR.endTag;
                }
                break;
            }
            default:
                break;
        }
        return filter;
    },
    ogcDateField: function(attribute, operator, value) {
        let fieldFilter;
        if (operator === "><") {
            if (value.startDate && value.endDate) {
                fieldFilter =
                            this.ogcComparisonOperators[operator].startTag +
                                this.propertyTagReference[this.nsplaceholder].startTag +
                                    attribute +
                                this.propertyTagReference[this.nsplaceholder].endTag +
                                "<" + this.nsplaceholder + ":LowerBoundary>" +
                                    "<" + this.nsplaceholder + ":Literal>" + value.startDate.toISOString() + "</" + this.nsplaceholder + ":Literal>" +
                                "</" + this.nsplaceholder + ":LowerBoundary>" +
                                "<" + this.nsplaceholder + ":UpperBoundary>" +
                                    "<" + this.nsplaceholder + ":Literal>" + value.endDate.toISOString() + "</" + this.nsplaceholder + ":Literal>" +
                                "</" + this.nsplaceholder + ":UpperBoundary>" +
                            this.ogcComparisonOperators[operator].endTag;
            }
        } else {
            if (value.startDate) {
                fieldFilter =
                            this.ogcComparisonOperators[operator].startTag +
                                this.propertyTagReference[this.nsplaceholder].startTag +
                                    attribute +
                                this.propertyTagReference[this.nsplaceholder].endTag +
                                "<" + this.nsplaceholder + ":Literal>" + value.startDate.toISOString() + "</" + this.nsplaceholder + ":Literal>" +
                            this.ogcComparisonOperators[operator].endTag;
            }
        }
        return fieldFilter;
    },
    ogcListField: function(attribute, operator, value) {
        let fieldFilter;
        if (value) {
            fieldFilter =
                this.ogcComparisonOperators[operator].startTag +
                    this.propertyTagReference[this.nsplaceholder].startTag +
                        attribute +
                    this.propertyTagReference[this.nsplaceholder].endTag +
                    "<" + this.nsplaceholder + ":Literal>" + value + "</" + this.nsplaceholder + ":Literal>" +
                this.ogcComparisonOperators[operator].endTag;
        }
        return fieldFilter;
    },
    ogcStringField: function(attribute, operator, value) {
        let fieldFilter;
        if (value) {
            if (operator === "isNull") {
                fieldFilter =
                    this.ogcComparisonOperators[operator].startTag +
                        this.propertyTagReference[this.nsplaceholder].startTag +
                            attribute +
                        this.propertyTagReference[this.nsplaceholder].endTag +
                    this.ogcComparisonOperators[operator].endTag;
            }else if (operator === "=") {
                fieldFilter =
                    this.ogcComparisonOperators[operator].startTag +
                        this.propertyTagReference[this.nsplaceholder].startTag +
                            attribute +
                        this.propertyTagReference[this.nsplaceholder].endTag +
                        "<" + this.nsplaceholder + ":Literal>" + value + "</" + this.nsplaceholder + ":Literal>" +
                    this.ogcComparisonOperators[operator].endTag;
            }else {
                fieldFilter =
                    this.ogcComparisonOperators[operator].startTag +
                        this.propertyTagReference[this.nsplaceholder].startTag +
                            attribute +
                        this.propertyTagReference[this.nsplaceholder].endTag +
                        "<" + this.nsplaceholder + ":Literal>*" + value + "*</" + this.nsplaceholder + ":Literal>" +
                    this.ogcComparisonOperators[operator].endTag;
            }
        }
        return fieldFilter;
    },
    ogcNumberField: function(attribute, operator, value) {
        let fieldFilter;
        if (operator === "><") {
            if (value && (value.lowBound !== null && value.lowBound !== undefined) && (value.upBound === null || value.upBound === undefined)) {
                fieldFilter = this.ogcComparisonOperators[">="].startTag +
                                this.propertyTagReference[this.nsplaceholder].startTag +
                                    attribute +
                                this.propertyTagReference[this.nsplaceholder].endTag +
                             "<" + this.nsplaceholder + ":Literal>" + value.lowBound + "</" + this.nsplaceholder + ":Literal>" +
                                        this.ogcComparisonOperators[">="].endTag;
            }else if (value && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound === null || value.lowBound === undefined)) {
                fieldFilter = this.ogcComparisonOperators["<="].startTag +
                                this.propertyTagReference[this.nsplaceholder].startTag +
                                    attribute +
                                this.propertyTagReference[this.nsplaceholder].endTag +
                             "<" + this.nsplaceholder + ":Literal>" + value.upBound + "</" + this.nsplaceholder + ":Literal>" +
                                        this.ogcComparisonOperators["<="].endTag;
            }else if (value && (value.upBound !== null && value.upBound !== undefined) && (value.lowBound !== null && value.lowBound !== undefined)) {
                fieldFilter =
                            this.ogcComparisonOperators[operator].startTag +
                                this.propertyTagReference[this.nsplaceholder].startTag +
                                    attribute +
                                this.propertyTagReference[this.nsplaceholder].endTag +
                                "<" + this.nsplaceholder + ":LowerBoundary>" +
                                    "<" + this.nsplaceholder + ":Literal>" + value.lowBound + "</" + this.nsplaceholder + ":Literal>" +
                                "</" + this.nsplaceholder + ":LowerBoundary>" +
                                "<" + this.nsplaceholder + ":UpperBoundary>" +
                                    "<" + this.nsplaceholder + ":Literal>" + value.upBound + "</" + this.nsplaceholder + ":Literal>" +
                                "</" + this.nsplaceholder + ":UpperBoundary>" +
                            this.ogcComparisonOperators[operator].endTag;
            }
        } else {
            let val = value && (value.lowBound !== null && value.lowBound !== undefined) ? value.lowBound : value;
            if (val) {
                fieldFilter = this.ogcComparisonOperators[operator].startTag +
                                this.propertyTagReference[this.nsplaceholder].startTag +
                                    attribute +
                                this.propertyTagReference[this.nsplaceholder].endTag +
                             "<" + this.nsplaceholder + ":Literal>" + val + "</" + this.nsplaceholder + ":Literal>" +
                                        this.ogcComparisonOperators[operator].endTag;
            }
        }
        return fieldFilter;
    },
    processOGCSpatialFilter: function(version) {
        let ogc = this.ogcSpatialOperator[this.objFilter.spatialField.operation].startTag;
        ogc +=
            this.propertyTagReference[this.nsplaceholder].startTag +
                this.objFilter.spatialField.attribute +
            this.propertyTagReference[this.nsplaceholder].endTag;

        switch (this.objFilter.spatialField.operation) {
            case "INTERSECTS":
            case "DWITHIN":
            case "WITHIN":
            case "CONTAINS": {
                switch (this.objFilter.spatialField.geometry.type) {
                    case "Point":
                        ogc += this.getGmlPointElement(this.objFilter.spatialField.geometry.coordinates,
                            this.objFilter.spatialField.geometry.projection || "EPSG:4326", version);
                        break;
                    case "MultiPoint":
                        ogc += '<gml:MultiPoint srsName="' + (this.objFilter.spatialField.geometry.projection || "EPSG:4326") + '">';

                        // //////////////////////////////////////////////////////////////////////////
                        // Coordinates of a MultiPoint are an array of positions
                        // //////////////////////////////////////////////////////////////////////////
                        this.objFilter.spatialField.geometry.coordinates.forEach((element) => {
                            let point = element;
                            if (point) {
                                ogc += "<gml:pointMember>";
                                ogc += this.getGmlPointElement(point, version);
                                ogc += "</gml:pointMember>";
                            }
                        });

                        ogc += '</gml:MultiPoint>';
                        break;
                    case "Polygon":
                        ogc += this.getGmlPolygonElement(this.objFilter.spatialField.geometry.coordinates,
                            this.objFilter.spatialField.geometry.projection || "EPSG:4326", version);
                        break;
                    case "MultiPolygon":
                        const multyPolygonTagName = version === "2.0" ? "MultiSurface" : "MultiPolygon";
                        const polygonMemberTagName = version === "2.0" ? "surfaceMembers" : "polygonMember";

                        ogc += '<gml:' + multyPolygonTagName + ' srsName="' + (this.objFilter.spatialField.geometry.projection || "EPSG:4326") + '">';

                        // //////////////////////////////////////////////////////////////////////////
                        // Coordinates of a MultiPolygon are an array of Polygon coordinate arrays
                        // //////////////////////////////////////////////////////////////////////////
                        this.objFilter.spatialField.geometry.coordinates.forEach((element) => {
                            let polygon = element;
                            if (polygon) {
                                ogc += "<gml:" + polygonMemberTagName + ">";
                                ogc += this.getGmlPolygonElement(polygon, version);
                                ogc += "</gml:" + polygonMemberTagName + ">";
                            }
                        });

                        ogc += '</gml:' + multyPolygonTagName + '>';
                        break;
                    default:
                        break;
                }

                if (this.objFilter.spatialField.operation === "DWITHIN") {
                    ogc += '<' + this.nsplaceholder + ':Distance units="m">' + (this.objFilter.spatialField.geometry.distance || 0) + '</' + this.nsplaceholder + ':Distance>';
                }

                break;
            }
            case "BBOX": {
                let lowerCorner = this.objFilter.spatialField.geometry.extent[0] + " " + this.objFilter.spatialField.geometry.extent[1];
                let upperCorner = this.objFilter.spatialField.geometry.extent[2] + " " + this.objFilter.spatialField.geometry.extent[3];

                ogc +=
                    '<gml:Envelope' + ' srsName="' + this.objFilter.spatialField.geometry.projection + '">' +
                        '<gml:lowerCorner>' + lowerCorner + '</gml:lowerCorner>' +
                        '<gml:upperCorner>' + upperCorner + '</gml:upperCorner>' +
                    '</gml:Envelope>';

                break;
            }
            default:
                break;
        }

        ogc += this.ogcSpatialOperator[this.objFilter.spatialField.operation].endTag;
        return ogc;
    },
    getGmlPointElement: function(coordinates, srsName, version) {
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
            if (version === "2.0") {
                gmlPoint += '<gml:pos>' + coords.join(" ") + '</gml:pos>';
            } else {
                gmlPoint += '<gml:coord><X>' + element[0][0] + '</X><Y>' + element[0][1] + '</Y></gml:coord>';
            }
        });

        gmlPoint += '</gml:Point>';
        return gmlPoint;
    },
    getGmlPolygonElement: function(coordinates, srsName, version) {
        let gmlPolygon = '<gml:Polygon';

        gmlPolygon += srsName ? ' srsName="' + srsName + '">' : '>';

        // ///////////////////////////////////////////////////////////////////////////////////////////////////////
        // Array of LinearRing coordinate array. The first element in the array represents the exterior ring.
        // Any subsequent elements represent interior rings (or holes).
        // ///////////////////////////////////////////////////////////////////////////////////////////////////////
        coordinates.forEach((element, index) => {
            let coords = element.map((coordinate) => {
                return coordinate[0] + (version === "2.0" ? " " : ",") + coordinate[1];
            });
            const exterior = (version === "2.0" ? "exterior" : "outerBoundaryIs");
            const interior = (version === "2.0" ? "exterior" : "innerBoundaryIs");
            gmlPolygon +=
                (index < 1 ? '<gml:' + exterior + '>' : '<gml:' + interior + '>') +
                        '<gml:LinearRing>' +
                        (version === "2.0" ? '<gml:posList>' : '<gml:coordinates>') +
                                coords.join(" ") +
                        (version === "2.0" ? '</gml:posList>' : '</gml:coordinates>') +
                        '</gml:LinearRing>' +
                (index < 1 ? '</gml:' + exterior + '>' : '</gml:' + interior + '>');
        });

        gmlPolygon += '</gml:Polygon>';
        return gmlPolygon;
    },
    toCQLFilter: function(json) {
        try {
            this.objFilter = (json instanceof Object) ? json : JSON.parse(json);
        } catch(e) {
            return e;
        }

        let filters = [];

        let attributeFilter;
        if (this.objFilter.filterFields && this.objFilter.filterFields.length > 0) {
            attributeFilter = this.processCQLFilterGroup(this.objFilter.groupFields[0]);
            filters.push(attributeFilter);
        }else if (this.objFilter.simpleFilterFields && this.objFilter.simpleFilterFields.length > 0) {
            let simpleFilter = this.objFilter.simpleFilterFields.reduce((cql, field) => {
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
        if (this.objFilter.spatialField && this.objFilter.spatialField.geometry && this.objFilter.spatialField.operation) {
            spatialFilter = this.processCQLSpatialFilter();
            filters.push(spatialFilter);
        }

        return "(" + (filters.length > 1 ? filters.join(") AND (") : filters[0]) + ")";
    },
    processCQLFilterGroup: function(root) {
        let cql = this.processCQLFilterFields(root);

        let subGroups = this.findSubGroups(root, this.objFilter.groupFields);
        if (subGroups.length > 0) {
            subGroups.forEach((subGroup) => {
                cql += " " + root.logic + " (" + this.processFilterGroup(subGroup) + ")";
            });
        }

        return cql;
    },
    processCQLFilterFields: function(group) {
        let fields = this.objFilter.filterFields.filter((field) => field.groupId === group.id);

        let filter = [];
        if (fields) {
            fields.forEach((field) => {
                let fieldFilter;

                switch (field.type) {
                    case "date":
                        fieldFilter = this.cqlDateField(field.attribute, field.operator, field.value);
                        break;
                    case "number":
                        fieldFilter = this.cqlNumberField(field.attribute, field.operator, field.value);
                        break;
                    case "string":
                        fieldFilter = this.cqlStringField(field.attribute, field.operator, field.value);
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
    },
    cqlListField: function(attribute, operator, value) {
        return this.cqlStringField(attribute, operator, value);
    },
    cqlStringField: function(attribute, operator, value) {
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
    },
    cqlNumberField: function(attribute, operator, value) {
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
    },
    cqlDateField: function(attribute, operator, value) {
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
    },
    processCQLSpatialFilter: function() {
        let cql = this.objFilter.spatialField.operation + "(" +
            this.objFilter.spatialField.attribute + ", ";

        cql += this.getCQLGeometryElement(this.objFilter.spatialField.geometry.coordinates, this.objFilter.spatialField.geometry.type);

        return cql + ")";
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
    },
    findSubGroups: function(root, groups) {
        let subGroups = groups.filter((g) => g.groupId === root.id);
        return subGroups;
    }
};

module.exports = FilterUtils;
