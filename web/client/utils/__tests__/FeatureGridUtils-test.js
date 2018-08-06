/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const { gridUpdateToQueryUpdate } = require('../FeatureGridUtils');
const update = {
    rawValue: 'k',
    value: 'k',
    operator: 'ilike',
    type: 'string',
    attribute: 'STATE_NAME'
  };

const update1 = {
    rawValue: 'a',
    value: 'a',
    operator: 'ilike',
    type: 'string',
    attribute: 'STATE_NAME'
  };

const oldFilterObj1 = {
    featureTypeName: 'topp:states',
    groupFields: [
      {
        id: 1,
        logic: 'OR',
        index: 0
      }
    ],
    filterFields: [
      {
        rowId: 1531235095805,
        groupId: 1,
        attribute: 'STATE_NAME',
        operator: '=',
        value: 'Alabama',
        type: 'string',
        fieldOptions: {
          valuesCount: 0,
          currentPage: 1
        },
        exception: null,
        loading: false,
        options: {
          STATE_NAME: []
        },
        openAutocompleteMenu: false
      },
      {
        rowId: 1531235122110,
        groupId: 1,
        attribute: 'STATE_NAME',
        operator: '=',
        value: 'Arizona',
        type: 'string',
        fieldOptions: {
          valuesCount: 0,
          currentPage: 1
        },
        exception: null,
        loading: false,
        options: {
          STATE_NAME: []
        },
        openAutocompleteMenu: false
      },
      {
        rowId: 1531235133249,
        groupId: 1,
        attribute: 'STATE_NAME',
        operator: '=',
        value: 'Arkansas',
        type: 'string',
        fieldOptions: {
          valuesCount: 0,
          currentPage: 1
        },
        exception: null,
        loading: false,
        options: {
          STATE_NAME: []
        },
        openAutocompleteMenu: false
      }
    ],
    spatialField: {
      method: null,
      operation: 'INTERSECTS',
      geometry: null,
      attribute: 'the_geom'
    },
    pagination: {
      startIndex: 0,
      maxFeatures: 20
    },
    filterType: 'OGC',
    ogcVersion: '1.1.0',
    sortOptions: null,
    crossLayerFilter: null,
    hits: false
  };
const oldFilterObj = {
    featureTypeName: 'topp:states',
    groupFields: [
      {
        id: 1,
        logic: 'OR',
        index: 0
      }
    ],
    filterFields: [
      {
        rowId: 1530177195171,
        groupId: 1,
        attribute: 'STATE_NAME',
        operator: 'like',
        value: 'la',
        type: 'string',
        fieldOptions: {
          valuesCount: 5,
          currentPage: 1
        },
        exception: null,
        loading: false,
        options: {
          STATE_NAME: [
            'Alabama',
            'Delaware',
            'Maryland',
            'Oklahoma',
            'Rhode Island'
          ]
        },
        openAutocompleteMenu: false
      }
    ]
  };

const filterObj1 = {
    featureTypeName: 'topp:states',
    groupFields: [
      {
        id: 9999,
        logic: 'AND',
        index: 0
      },
      {
        id: 1,
        logic: 'OR',
        groupId: 9999,
        index: 1
      }
    ],
    filterFields: [
      {
        rowId: 1531235095805,
        groupId: 1,
        attribute: 'STATE_NAME',
        operator: '=',
        value: 'Alabama',
        type: 'string',
        fieldOptions: {
          valuesCount: 0,
          currentPage: 1
        },
        exception: null,
        loading: false,
        options: {
          STATE_NAME: []
        },
        openAutocompleteMenu: false
      },
      {
        rowId: 1531235122110,
        groupId: 1,
        attribute: 'STATE_NAME',
        operator: '=',
        value: 'Arizona',
        type: 'string',
        fieldOptions: {
          valuesCount: 0,
          currentPage: 1
        },
        exception: null,
        loading: false,
        options: {
          STATE_NAME: []
        },
        openAutocompleteMenu: false
      },
      {
        rowId: 1531235133249,
        groupId: 1,
        attribute: 'STATE_NAME',
        operator: '=',
        value: 'Arkansas',
        type: 'string',
        fieldOptions: {
          valuesCount: 0,
          currentPage: 1
        },
        exception: null,
        loading: false,
        options: {
          STATE_NAME: []
        },
        openAutocompleteMenu: false
      },
      {
        attribute: 'STATE_NAME',
        rowId: 1531235186314,
        type: 'string',
        groupId: 9999,
        operator: 'ilike',
        value: 'a'
      }
    ],
    spatialField: {
      method: null,
      operation: 'INTERSECTS',
      geometry: null,
      attribute: 'the_geom'
    },
    pagination: {
      startIndex: 0,
      maxFeatures: 20
    },
    filterType: 'OGC',
    ogcVersion: '1.1.0',
    sortOptions: null,
    crossLayerFilter: null,
    hits: false
  };
const filterObj = {
    featureTypeName: 'topp:states',
    groupFields: [
      {
        id: 9999, // dummy number representing group id
        logic: 'AND',
        index: 0
      }
    ],
    filterFields: [
      {
        rowId: 1530177195171,
        groupId: 9999,
        attribute: 'STATE_NAME',
        operator: 'like',
        value: 'la',
        type: 'string',
        fieldOptions: {
          valuesCount: 5,
          currentPage: 1
        },
        exception: null,
        loading: false,
        options: {
          STATE_NAME: [
            'Alabama',
            'Delaware',
            'Maryland',
            'Oklahoma',
            'Rhode Island'
          ]
        },
        openAutocompleteMenu: false
      },
      {
        attribute: 'STATE_NAME',
        rowId: 1530177664717,
        type: 'string',
        groupId: 9999,
        operator: 'ilike',
        value: 'k'
      }
    ]
  };

describe('FeatureGridUtils', () => {
    it('combines query panel and featuregrid filter', () => {
        const {groupFields: expectedGroupFileds, filterFields: expectedFilterFields} = gridUpdateToQueryUpdate(update, oldFilterObj);
        const {groupFields, filterFields} = filterObj;
        const [queryPanelField, featuregridFields] = filterFields;
        const [expectedQueryPanelField, expectedFeaturegridFields] = expectedFilterFields;
        expect(groupFields).toEqual(expectedGroupFileds);
        expect(queryPanelField.value).toBe(expectedQueryPanelField.value);
        expect(featuregridFields.value).toBe(expectedFeaturegridFields.value);
        expect(filterFields.length).toBe(expectedFilterFields.length);

    });

    it('combines query panel with multiple fields and featuregrid filter  ', () => {
        const {groupFields: expectedGroupFileds, filterFields: expectedFilterFields} = gridUpdateToQueryUpdate(update1, oldFilterObj1);
        const {groupFields, filterFields} = filterObj1;
        let root = groupFields[0];
        let subGroups = groupFields.filter((g) => g.groupId === root.id);
        expect(groupFields).toEqual(expectedGroupFileds);
        expect(subGroups.length > 0).toBeTruthy();
        expect(filterFields.length).toBe(expectedFilterFields.length);

    });
});
