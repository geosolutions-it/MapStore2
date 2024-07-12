/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { dashboardInfoDetailsSettingsFromIdSelector, getDashboardId, dashboardInfoDetailsUriFromIdSelector  } from "./dashboard";
import { mapIdSelector, mapInfoDetailsSettingsFromIdSelector, mapInfoDetailsUriFromIdSelector } from "./map";

export const detailsTextSelector = state => state?.details?.detailsText;

export const detailsUriSelector = state => {
 	const mapId = mapIdSelector(state);
    const dashboardId = getDashboardId(state);
    // todo: this is now for map and dashboard only, in the future if something else needs to use this like geostory, an additional condition should be added
    let detailsUri = dashboardId && dashboardInfoDetailsUriFromIdSelector(state) || mapId && mapInfoDetailsUriFromIdSelector(state);
    return detailsUri;
};

export const detailsSettingsSelector = state => {
    const mapId = mapIdSelector(state);
   	const dashboardId = getDashboardId(state);
    // todo: this is now for map and dashboard only, in the future if something else needs to use this like geostory, an additional contional should be added
    let detailsSettings = dashboardId && dashboardInfoDetailsSettingsFromIdSelector(state) ||  mapId && mapInfoDetailsSettingsFromIdSelector(state);
    return detailsSettings;
};
