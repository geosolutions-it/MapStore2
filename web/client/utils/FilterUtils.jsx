/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const FilterUtils = {
    ogcVersion: "1.1.0",
    ogcLogicalOperator: {
        "AND": {startTag: "<ogc:And>", endTag: "</ogc:And>"},
        "OR": {startTag: "<ogc:Or>", endTag: "</ogc:Or>"},
        "AND NOT": {startTag: "<ogc:Not>", endTag: "</ogc:Not>"}
    },
    ogcComparisonOperators: {
        "=": {startTag: "<ogc:PropertyIsEqualTo>", endTag: "</ogc:PropertyIsEqualTo>"},
        ">": {startTag: "<ogc:PropertyIsGreaterThan>", endTag: "</ogc:PropertyIsGreaterThan>"},
        "<": {startTag: "<ogc:PropertyIsLessThan>", endTag: "</ogc:PropertyIsLessThan>"},
        ">=": {startTag: "<ogc:PropertyIsGreaterThanOrEqualTo>", endTag: "</ogc:PropertyIsGreaterThanOrEqualTo>"},
        "<=": {startTag: "<ogc:PropertyIsLessThanOrEqualTo>", endTag: "</ogc:PropertyIsLessThanOrEqualTo>"},
        "<>": {startTag: "<ogc:PropertyIsNotEqualTo>", endTag: "</ogc:PropertyIsNotEqualTo>"},
        "><": {startTag: "<ogc:PropertyIsBetween>", endTag: "</ogc:PropertyIsBetween>"}
    },
    ogcSpatialOperator: {
        "INTERSECTS": {startTag: "<ogc:Intersects>", endTag: "</ogc:Intersects>"},
        "BBOX": {startTag: "<ogc:BBOX>", endTag: "</ogc:BBOX>"},
        "CONTAINS": {startTag: "<ogc:Contains>", endTag: "</ogc:Contains>"},
        "DWITHIN": {startTag: "<ogc:DWithin>", endTag: "</ogc:DWithin>"},
        "WITHIN": {startTag: "<ogc:Within>", endTag: "</ogc:Within>"}
    },
    toOGCFilter: function(ftName, json) {
        try {
            this.objFilter = (json instanceof Object) ? json : JSON.parse(json);
        } catch(e) {
            return e;
        }

        let filters = [];

        let attributeFilter;
        if (this.objFilter.filterFields.length > 0) {
            attributeFilter = this.processOGCFilterGroup(this.objFilter.groupFields[0]);
            filters.push(attributeFilter);
        }

        let spatialFilter;
        if (this.objFilter.spatialField.geometry && this.objFilter.spatialField.method) {
            spatialFilter = this.processOGCSpatialFilter();
            filters.push(spatialFilter);
        }

        let filter = "<ogc:Filter><ogc:And>";
        filters.forEach((subFilter) => {
            filter += subFilter;
        });
        filter += "</ogc:And></ogc:Filter>";

        let ogcFilter =
            '<wfs:GetFeature service="WFS" version="' + this.ogcVersion + '" ' +
            'xmlns:wfs="http://www.opengis.net/wfs" ' +
            'xmlns:ogc="http://www.opengis.net/ogc" ' +
            'xmlns:gml="http://www.opengis.net/gml" ' +
            'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
            '<wfs:Query typeName="' + ftName + '">';
        ogcFilter += filter;
        ogcFilter +=
            '</wfs:Query>' +
            '</wfs:GetFeature>';

        return ogcFilter;
    },
    processOGCFilterGroup: function(root) {
        let ogc = this.processOGCFilterFields(root);

        let subGroups = this.findSubGroups(root, this.objFilter.groupFields);
        if (subGroups.length > 0) {
            subGroups.forEach((subGroup) => {
                ogc +=
                    this.ogcLogicalOperator[root.logic].startTag +
                    this.processOGCFilterGroup(subGroup) +
                    this.ogcLogicalOperator[root.logic].endTag;
            });
        }

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
                                    "<ogc:PropertyName>" + field.attribute + "</ogc:PropertyName>" +
                                    "<ogc:LowerBoundary><ogc:Literal>" + field.value.startDate.toISOString() + "</ogc:Literal></ogc:LowerBoundary>" +
                                    "<ogc:UpperBoundary><ogc:Literal>" + field.value.endDate.toISOString() + "</ogc:Literal></ogc:UpperBoundary>" +
                                this.ogcComparisonOperators[field.operator].endTag;
                        }
                    } else {
                        if (field.value.startDate) {
                            fieldFilter =
                                this.ogcComparisonOperators[field.operator].startTag +
                                    "<ogc:PropertyName>" + field.attribute + "</ogc:PropertyName>" +
                                    "<ogc:Literal>" + field.value.startDate.toISOString() + "</ogc:Literal>" +
                                this.ogcComparisonOperators[field.operator].endTag;
                        }
                    }
                } else if (field.type === "list") {
                    if (field.value) {
                        fieldFilter =
                            this.ogcComparisonOperators[field.operator].startTag +
                                "<ogc:PropertyName>" + field.attribute + "</ogc:PropertyName>" +
                                "<ogc:Literal>" + field.value + "</ogc:Literal>" +
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
        let ogc =
            this.ogcSpatialOperator[this.objFilter.spatialField.operation].startTag;
        ogc += "<PropertyName>" + this.objFilter.spatialField.attribute + "</PropertyName>";

        switch (this.objFilter.spatialField.operation) {
            case "INTERSECTS":
            case "DWITHIN":
            case "WITHIN":
            case "CONTAINS": {
                let arr = this.objFilter.spatialField.geometry.coordinates[0];
                let coordinates = arr.map((coordinate) => {
                    return coordinate[0] + " " + coordinate[1];
                });

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

                if (this.objFilter.spatialField.operation === "DWITHIN") {
                    ogc += '<ogc:Distance units="m">' + (this.objFilter.spatialField.geometry.distance || 0) + '</ogc:Distance>';
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
