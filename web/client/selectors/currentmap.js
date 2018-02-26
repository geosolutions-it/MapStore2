/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {get} = require('lodash');

/**
 * selects currentmap state
 * @name currentmap
 * @memberof selectors
 * @static
*/

const currentMapSelector = (state) => get(state, "currentMap", {});
const currentMapIdSelector = (state) => get(state, "currentMap.id", "");
const currentMapNameSelector = (state) => get(state, "currentMap.name", "");
const currentMapDetailsUriSelector = (state) => get(state, "currentMap.details", "");
const currentMapDecriptionSelector = (state) => get(state, "currentMap.description", "");
const currentMapDetailsTextSelector = (state) => get(state, "currentMap.detailsText", "");
const currentMapThumbnailUriSelector = (state) => get(state, "currentMap.thumbnail", "");
const currentMapDetailsChangedSelector = (state) => get(state, "currentMap.detailsChanged", false);
const currentMapOriginalDetailsTextSelector = (state) => get(state, "currentMap.originalDetails", false);
module.exports = {
    currentMapSelector,
    currentMapIdSelector,
    currentMapNameSelector,
    currentMapDecriptionSelector,
    currentMapDetailsUriSelector,
    currentMapDetailsTextSelector,
    currentMapThumbnailUriSelector,
    currentMapDetailsChangedSelector,
    currentMapOriginalDetailsTextSelector
};
