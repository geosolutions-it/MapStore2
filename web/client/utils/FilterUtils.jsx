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
        "><": {startTag: "<{namespace}:PropertyIsBetween>", endTag: "</{namespace}:PropertyIsBetween>"}
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
    toOGCFilter: function(ftName, json, version) {
        try {
            this.objFilter = (json instanceof Object) ? json : JSON.parse(json);
        } catch(e) {
            return e;
        }

        const versionOGC = version || this.ogcVersion;
        this.nsplaceholder = versionOGC === "2.0" ? "fes" : "ogc";

        this.setOperatorsPlaceholders("{namespace}", this.nsplaceholder);

        let ogcFilter = this.getGetFeatureBase(versionOGC, this.nsplaceholder);
        let filters = [];

        let attributeFilter;
        if (this.objFilter.filterFields && this.objFilter.filterFields.length > 0) {
            attributeFilter = this.processOGCFilterGroup(this.objFilter.groupFields[0]);
            filters.push(attributeFilter);
        }

        let spatialFilter;
        if (this.objFilter.spatialField && this.objFilter.spatialField.geometry && this.objFilter.spatialField.method) {
            spatialFilter = this.processOGCSpatialFilter();
            filters.push(spatialFilter);
        }

        let filter = "<" + this.nsplaceholder + ":Filter><" + this.nsplaceholder + ":And>";
        filters.forEach((subFilter) => {
            filter += subFilter;
        });
        filter += "</" + this.nsplaceholder + ":And></" + this.nsplaceholder + ":Filter>";

        ogcFilter += '<wfs:Query ' + (versionOGC === "2.0" ? "typeNames" : "typeName") + '="' + ftName + '" srsName="EPSG:4326">';
        ogcFilter += filter;
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
    getGetFeatureBase: function(version) {
        let ver = !version ? "2.0" : version;

        switch (ver) {
            case "1.0.0":
                return '<wfs:GetFeature service="WFS" version="' + ver + '" ' +
                    'outputFormat="GML2" ' +
                    'xmlns:gml="http://www.opengis.net/gml" ' +
                    'xmlns:wfs="http://www.opengis.net/wfs" ' +
                    'xmlns:ogc="http://www.opengis.net/ogc" ' +
                    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xsi:schemaLocation="http://www.opengis.net/wfs ' +
                        'http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">';
            case "1.1.0":
                return '<wfs:GetFeature service="WFS" version="' + ver + '" ' +
                    'xmlns:gml="http://www.opengis.net/gml" ' +
                    'xmlns:wfs="http://www.opengis.net/wfs" ' +
                    'xmlns:ogc="http://www.opengis.net/ogc" ' +
                    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xsi:schemaLocation="http://www.opengis.net/wfs ' +
                        'http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">';
            default: // default is wfs 2.0
                return '<wfs:GetFeature service="WFS" version="' + ver + '" ' +
                    'xmlns:wfs="http://www.opengis.net/wfs/2.0" ' +
                    'xmlns:fes="http://www.opengis.net/fes/2.0" ' +
                    'xmlns:gml="http://www.opengis.net/gml/3.2" ' +
                    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xsi:schemaLocation="http://www.opengis.net/wfs/2.0 ' +
                        'http://schemas.opengis.net/wfs/2.0/wfs.xsd ' +
                        'http://www.opengis.net/gml/3.2 ' +
                        'http://schemas.opengis.net/gml/3.2.1/gml.xsd">';
        }
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
        let fields = this.objFilter.filterFields.filter((field) => field.groupId === group.id);

        let filter = [];
        if (fields) {
            fields.forEach((field) => {
                let fieldFilter;

                if (field.type === "date") {
                    if (field.operator === "><") {
                        if (field.value.startDate && field.value.endDate) {
                            fieldFilter =
                                this.ogcComparisonOperators[field.operator].startTag +
                                    this.propertyTagReference[this.nsplaceholder].startTag +
                                        field.attribute +
                                    this.propertyTagReference[this.nsplaceholder].endTag +
                                    "<" + this.nsplaceholder + ":LowerBoundary>" +
                                        "<" + this.nsplaceholder + ":Literal>" + field.value.startDate.toISOString() + "</" + this.nsplaceholder + ":Literal>" +
                                    "</" + this.nsplaceholder + ":LowerBoundary>" +
                                    "<" + this.nsplaceholder + ":UpperBoundary>" +
                                        "<" + this.nsplaceholder + ":Literal>" + field.value.endDate.toISOString() + "</" + this.nsplaceholder + ":Literal>" +
                                    "</" + this.nsplaceholder + ":UpperBoundary>" +
                                this.ogcComparisonOperators[field.operator].endTag;
                        }
                    } else {
                        if (field.value.startDate) {
                            fieldFilter =
                                this.ogcComparisonOperators[field.operator].startTag +
                                    this.propertyTagReference[this.nsplaceholder].startTag +
                                        field.attribute +
                                    this.propertyTagReference[this.nsplaceholder].endTag +
                                    "<" + this.nsplaceholder + ":Literal>" + field.value.startDate.toISOString() + "</" + this.nsplaceholder + ":Literal>" +
                                this.ogcComparisonOperators[field.operator].endTag;
                        }
                    }
                } else if (field.type === "list") {
                    if (field.value) {
                        fieldFilter =
                            this.ogcComparisonOperators[field.operator].startTag +
                                this.propertyTagReference[this.nsplaceholder].startTag +
                                    field.attribute +
                                this.propertyTagReference[this.nsplaceholder].endTag +
                                "<" + this.nsplaceholder + ":Literal>" + field.value + "</" + this.nsplaceholder + ":Literal>" +
                            this.ogcComparisonOperators[field.operator].endTag;
                    }
                }

                if (fieldFilter) {
                    filter.push(fieldFilter);
                }
            });

            filter = filter.join("");
        }

        return filter;
    },
    processOGCSpatialFilter: function() {
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
                let arr = this.objFilter.spatialField.geometry.coordinates[0];
                let coordinates = arr.map((coordinate) => {
                    return coordinate[0] + " " + coordinate[1];
                });

                if (this.objFilter.spatialField.method === "POINT") {
                    ogc +=
                        '<gml:Point srsDimension="2" srsName="' + this.objFilter.spatialField.geometry.projection + '">' +
                            '<gml:pos>' + coordinates.join(" ") + '</gml:pos>' +
                        '</gml:Point>';
                } else {
                    ogc +=
                        '<gml:Polygon srsName="' + this.objFilter.spatialField.geometry.projection + '">' +
                            '<gml:exterior>' +
                                '<gml:LinearRing>' +
                                    '<gml:posList>' +
                                        coordinates.join(" ") +
                                    '</gml:posList>' +
                                '</gml:LinearRing>' +
                            '</gml:exterior>' +
                        '</gml:Polygon>';
                }

                if (this.objFilter.spatialField.operation === "DWITHIN") {
                    ogc += '<' + this.nsplaceholder + ':Distance units="m">' + (this.objFilter.spatialField.geometry.distance || 0) + '</' + this.nsplaceholder + ':Distance>';
                }

                break;
            }
            case "BBOX": {
                let lowerCorner = this.objFilter.spatialField.geometry[0] + " " + this.objFilter.spatialField.geometry[1];
                let upperCorner = this.objFilter.spatialField.geometry[2] + " " + this.objFilter.spatialField.geometry[3];

                ogc +=
                    '<gml:Envelope' + ' srsName="' + this.objFilter.spatialField.projection + '">' +
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
    toCQLFilter: function(json) {
        try {
            this.objFilter = (json instanceof Object) ? json : JSON.parse(json);
        } catch(e) {
            return e;
        }

        let filters = [];

        let attributeFilter;
        if (this.objFilter.filterFields.length > 0) {
            attributeFilter = this.processCQLFilterGroup(this.objFilter.groupFields[0]);
            filters.push(attributeFilter);
        }

        let spatialFilter;
        if (this.objFilter.spatialField.geometry && this.objFilter.spatialField.method) {
            spatialFilter = this.processCQLSpatialFilter();
            filters.push(spatialFilter);
        }

        return "(" + (filters.length > 1 ? filters.join(") AND (") : filters[0]) + ")";
    },
    processCQLFilterGroup: function(root) {
        let cql = this.processFilterFields(root);

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

                if (field.type === "date") {
                    if (field.operator === "><") {
                        if (field.value.startDate && field.value.endDate) {
                            fieldFilter = "(" + field.attribute + ">='" + field.value.startDate.toISOString() +
                                "' AND " + field.attribute + "<='" + field.value.endDate.toISOString() + "')";
                        }
                    } else {
                        if (field.value.startDate) {
                            fieldFilter = field.attribute + field.operator + "'" + field.value.startDate.toISOString() + "'";
                        }
                    }
                } else if (field.type === "list") {
                    if (field.value) {
                        let value = "'" + field.value + "'";
                        fieldFilter = field.attribute + field.operator + value;
                    }
                }

                if (fieldFilter) {
                    filter.push(fieldFilter);
                }
            });

            filter = filter.join(" " + group.logic + " ");
        }

        return filter;
    },
    processCQLSpatialFilter: function() {
        let cql = this.objFilter.spatialField.operation + "(" +
            this.objFilter.spatialField.attribute + ", " +
            this.objFilter.spatialField.geometry.type + "((";

        let arr = this.objFilter.spatialField.geometry.coordinates[0];
        let coordinates = arr.map((coordinate) => {
            return coordinate[0] + " " + coordinate[1];
        });

        cql += coordinates.join(", ") + "))";

        return cql + ")";
    },
    findSubGroups: function(root, groups) {
        let subGroups = groups.filter((g) => g.groupId === root.id);
        return subGroups;
    }
};

module.exports = FilterUtils;
