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
