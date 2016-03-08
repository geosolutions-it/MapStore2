/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const FilterUtils = {
    toCQLFilter: function(json) {
        try {
            this.objFilter = (json instanceof Object) ? json : JSON.parse(json);
        } catch(e) {
            return e;
        }

        let filters = [];

        let attributeFilter;
        if (this.objFilter.filterFields.length > 0) {
            attributeFilter = this.processFilterGroup(this.objFilter.groupFields[0]);
            filters.push(attributeFilter);
        }

        let spatialFilter;
        if (this.objFilter.spatialField.geometry && this.objFilter.spatialField.method) {
            spatialFilter = this.processSpatialFilter();
            filters.push(spatialFilter);
        }

        return "(" + (filters.length > 1 ? filters.join(") AND (") : filters[0]) + ")";
    },
    processFilterGroup: function(root) {
        let cql = this.processFilterFields(root);

        let subGroups = this.findSubGroups(root, this.objFilter.groupFields);
        if (subGroups.length > 0) {
            subGroups.forEach((subGroup) => {
                cql += " " + root.logic + " (" + this.processFilterGroup(subGroup) + ")";
            });
        }

        return cql;
    },
    processFilterFields: function(group) {
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
    processSpatialFilter: function() {
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
