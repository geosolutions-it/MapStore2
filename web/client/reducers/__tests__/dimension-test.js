/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

var dimension = require('../dimension');
const { updateLayerDimensionData } = require('../../actions/dimension');
const { layerDimensionDataSelectorCreator } = require('../../selectors/dimension');

it('dimension updateLayerDimensionData', () => {
    const action = updateLayerDimensionData("TEST_LAYER", "time", {
        name: "time",
        domain: "123--123"
    });
    const state = dimension( undefined, action);
    expect(state).toExist();
    expect(layerDimensionDataSelectorCreator("TEST_LAYER", "time")( {
        dimension: state
    }).name).toBe("time");
});
it('removing a layer-related data from dimensin state', () => {
    const action = {
        type: 'REMOVE_NODE',
        node: 'sample1'
    };
    const initialState = {
      currentTime: '00:00:00z',
      data: {
          dimension1: { sample1: {}, sample2: {}},
          dimension2: { sample2: {}}
      }
    };
    const state = dimension(initialState, action);
    expect(state).toExist();
    expect(layerDimensionDataSelectorCreator('sample1', 'dimension1')( {
        dimension: state
    })).toNotExist();
    expect(layerDimensionDataSelectorCreator('sample2', 'dimension1')( {
        dimension: state
    })).toExist();
});
it('removing a layer when there is no data in dimensin state', () => {
    const action = {
        type: 'REMOVE_NODE',
        node: 'sample'
    };
    const initialState = {
      currentTime: '00:00:00z'
    };
    const state = dimension(initialState, action);
    expect(state).toExist();
});
