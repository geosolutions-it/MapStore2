/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {withHandlers} = require('recompose');
const {debounce} = require("lodash");
const emptyFunc = () => {};
/**
 * This enhancer de-bounce a method passed as prop of the given time.
 * The action should be present in the props passed to the component
 * @memberof components.misc.enhancers
 * @function
 * @name debounce
 * @example
 * // example: every props change increment the *count* prop
 * compose(debounce("onChangeDrawingStatus", 800));
 * the onChangeDrawingStatus action is debounced by 800 ms
 */
module.exports = (action = "", debounceTime = 1000) => withHandlers((initProp = {}) => {
    const debounced = debounce(initProp[action] || emptyFunc, debounceTime);
    return {
        [action]: () => debounced
    };
});
