/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const SELECT_FEATURES = 'SELECT_FEATURES';
const SET_FEATURES = 'SET_FEATURES';

function selectFeatures(features) {
    return {
        type: SELECT_FEATURES,
        features: features
    };
}

function setFeatures(features) {
    return {
        type: SET_FEATURES,
        features: features
    };
}

module.exports = {
    SELECT_FEATURES,
    SET_FEATURES,
    selectFeatures,
    setFeatures
};
