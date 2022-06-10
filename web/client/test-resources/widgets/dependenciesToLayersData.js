/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * input data for filters
 */

import {
    inputQuickFiltersStateAbbr,
    inputLayerFilterSTATENAME
} from './dependenciesToFiltersData';

export const inputMapDefault = [];
export const inputMapStatesWithCQL = [{
    layers: [
        {
            name: "topp:states",
            params: {
                CQL_FILTER: '(strToLowerCase("state_abbr") LIKE \'%a%\')'
            }
        }
    ],
    mapId: 'MAP_ID'
}];
export const inputMapStatesCenterChanged = [{
    layers: [
        {
            name: "topp:states"
        }
    ],
    center: {

    },
    mapId: 'MAP_ID'
}];
export const inputMapStatesCenterChangedAndQuickFilters = [{
    layers: [
        {
            name: "topp:states",
            params: {
                CQL_FILTER: '(strToLowerCase("state_abbr") LIKE \'%calif%\')'
            }
        }
    ],
    center: {

    },
    mapId: 'MAP_ID'
}];
export const inputDependenciesQuickFilters = {
    layer: {
        name: "topp:states"
    },
    quickFilters: inputQuickFiltersStateAbbr,
    options: {
        propertyName: ["state_abbr"]
    }
};
export const inputDependenciesQuickFiltersAndFilter = {
    layer: {
        name: "topp:states"
    },
    quickFilters: inputQuickFiltersStateAbbr,
    options: {
        propertyName: ["state_abbr"]
    },
    filter: inputLayerFilterSTATENAME
};


/**
 * output data for filters
 */

export const resultMapStatesNoCQL = [{ mapId: 'MAP_ID', layers: [ { name: 'topp:states', params: { CQL_FILTER: undefined } } ], center: {} }];
export const resultMapStatesCQL = [{ mapId: 'MAP_ID', layers: [ { name: 'topp:states', params: { CQL_FILTER: '((strToLowerCase("state_abbr") LIKE \'%i%\'))' } } ], center: {} }];
export const resultMapStatesCQLAndOriginalCql = [{ mapId: 'MAP_ID', layers: [ { name: 'topp:states', params: { CQL_FILTER: '(((strToLowerCase("state_abbr") LIKE \'%i%\'))) AND ((strToLowerCase("state_abbr") LIKE \'%calif%\'))' } } ], center: {} }];
export const resultMapStatesCQLQuickFiltersAndFilter = [{ mapId: 'MAP_ID', layers: [ { name: 'topp:states', params: { CQL_FILTER: '(((strToLowerCase("state_abbr") LIKE \'%i%\')) AND (strToLowerCase("STATE_NAME") LIKE \'%i%\'))' } } ], center: {} }];
export const resultMapWithCqlStatesCQLQuickFiltersAndFilter = [{ mapId: 'MAP_ID', layers: [ { name: 'topp:states', params: { CQL_FILTER: '((((strToLowerCase("state_abbr") LIKE \'%i%\')) AND (strToLowerCase("STATE_NAME") LIKE \'%i%\'))) AND ((strToLowerCase("state_abbr") LIKE \'%a%\'))' } } ] }];
