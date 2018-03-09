/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {compose, withHandlers} = require('recompose');
const {debounce} = require("lodash");

module.exports = compose(withHandlers((initProp) => {
    const debounced = debounce(initProp.onChangeDrawingStatus, 800);
    return {
        onChangeDrawingStatus: () => debounced
        };
}));
