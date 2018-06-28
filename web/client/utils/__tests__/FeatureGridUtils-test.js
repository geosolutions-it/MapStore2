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
const filterObj = {
    featureTypeName: 'topp:states',
    groupFields: [
      {
        id: 3355046933748244,
        logic: 'AND',
        index: 0
      }
    ],
    filterFields: [
      {
        rowId: 1530177195171,
        groupId: 3355046933748244,
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
        groupId: 3355046933748244,
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
});
