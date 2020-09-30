/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const layerSwipeSettingsSelector = (state) => state.swipe && state.swipe || { active: false };

export {
    layerSwipeSettingsSelector
};
