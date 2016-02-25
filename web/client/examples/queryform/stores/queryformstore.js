/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var DebugUtils = require('../../../utils/DebugUtils');

const {combineReducers} = require('redux');

const initialState = {
    attributePanelExpanded: true,
    spatialPanelExpanded: true,
    showDetailsPanel: false,
    groupLevels: 5,
    useMapProjection: false,
    groupFields: [
        {
            id: 1,
            logic: "OR",
            index: 0
        }
    ],
    filterFields: [
        {
            rowId: 0,
            groupId: 1,
            attribute: null,
            operator: "=",
            value: null,
            exception: null
        }
    ],
    spatialField: {
        method: null,
        attribute: "the_geom",
        operation: "INTERSECTS",
        geometry: null
    },
    attributes: [
        {
            id: "ListAttribute",
            type: "list",
            values: [
                "value1",
                "value2",
                "value3",
                "value4",
                "value5"
            ]
        },
        {
            id: "DateAttribute",
            type: "date"
        }
    ]
};

 // reducers
const reducers = combineReducers({
    browser: require('../../../reducers/browser'),
    config: require('../../../reducers/config'),
    locale: require('../../../reducers/locale'),
    map: require('../../../reducers/map'),
    draw: require('../../../reducers/draw'),
    queryform: require('../../../reducers/queryform')
});

// export the store with the given reducers
module.exports = DebugUtils.createDebugStore(reducers, {queryform: initialState});
