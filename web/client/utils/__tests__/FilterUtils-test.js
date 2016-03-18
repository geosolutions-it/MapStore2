/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var FilterUtils = require('../FilterUtils');

describe('FilterUtils', () => {
    it('Calculate OGC filter', () => {
        let filterObj = {
            filterFields: [{
                attribute: "attribute1",
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }, {
                attribute: "attribute2",
                exception: null,
                operator: "=",
                rowId: "2",
                type: "list",
                value: "value2"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            spatialField: {
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6]
                    ],
                    extent: [
                        1, 2, 3, 4, 5
                    ],
                    projection: "EPSG:4326",
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }
        };

        let filter = FilterUtils.toOGCFilter("ft_name_test", filterObj);
        expect(filter).toExist();
    });

    it('Calculate CQL filter', () => {
        let filterObj = {
            filterFields: [{
                attribute: "attribute1",
                exception: null,
                operator: "=",
                rowId: "1",
                type: "list",
                value: "value1"
            }, {
                attribute: "attribute2",
                exception: null,
                operator: "=",
                rowId: "2",
                type: "list",
                value: "value2"
            }],
            groupFields: [{
                id: 1,
                index: 0,
                logic: "OR"
            }],
            spatialField: {
                attribute: "the_geom",
                geometry: {
                    center: [1, 1],
                    coordinates: [
                        [1, 2],
                        [2, 3],
                        [3, 4],
                        [4, 5],
                        [5, 6]
                    ],
                    extent: [
                        1, 2, 3, 4, 5
                    ],
                    projection: "EPSG:4326",
                    radius: 1,
                    type: "Polygon"
                },
                method: "BBOX",
                operation: "INTERSECTS"
            }
        };

        let filter = FilterUtils.toCQLFilter("ft_name_test", filterObj);
        expect(filter).toExist();
    });
});
