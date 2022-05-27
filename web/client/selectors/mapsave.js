/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MapUtils from '../utils/MapUtils';

import { mapSelector } from './map';
import { createStructuredSelector } from 'reselect';
import { servicesSelector, selectedServiceSelector } from './catalog';
import { getFloatingWidgets, getCollapsedState, getFloatingWidgetsLayout } from './widgets';
import { mapInfoConfigurationSelector } from './mapInfo';
import { currentTimeSelector, offsetTimeSelector } from './dimension';
import { endValuesSupportSelector, selectedLayerSelector, snapRadioButtonEnabledSelector } from './timeline';
import { layersSelector, groupsSelector } from '../selectors/layers';
import { backgroundListSelector } from '../selectors/backgroundselector';
import { textSearchConfigSelector, bookmarkSearchConfigSelector } from './searchconfig';

const customSaveHandlers = {};

export const registerCustomSaveHandler = (section, handler) => {
    if (handler) {
        customSaveHandlers[section] = handler;
    } else {
        delete customSaveHandlers[section];
    }
};

export const basicMapOptionsToSaveSelector = createStructuredSelector({
    catalogServices: createStructuredSelector({
        services: servicesSelector,
        selectedService: selectedServiceSelector
    }),
    widgetsConfig: createStructuredSelector({
        widgets: getFloatingWidgets,
        layouts: getFloatingWidgetsLayout,
        collapsed: getCollapsedState
    }),
    mapInfoConfiguration: mapInfoConfigurationSelector,
    dimensionData: createStructuredSelector({
        currentTime: currentTimeSelector,
        offsetTime: offsetTimeSelector
    }),
    timelineData: createStructuredSelector({
        selectedLayer: selectedLayerSelector,
        endValuesSupport: endValuesSupportSelector,
        snapRadioButtonEnabled: snapRadioButtonEnabledSelector
    })
});

export const mapOptionsToSaveSelector = (state) => {
    const customState = Object.keys(customSaveHandlers).reduce((acc, fragment) => {
        return {
            ...acc,
            [fragment]: customSaveHandlers[fragment](state)
        };
    }, {});
    return { ...basicMapOptionsToSaveSelector(state), ...customState};
};

/**
 * Selector that returns the current mapConfig to save.
 * @param {object} state the application state
 * @return the map to save
 */
export const mapSaveSelector = state => {
    const map = mapSelector(state);
    const layers = layersSelector(state);
    const groups = groupsSelector(state);
    const backgrounds = backgroundListSelector(state);
    const textSearchConfig = textSearchConfigSelector(state);
    const bookmarkSearchConfig = bookmarkSearchConfigSelector(state);
    const additionalOptions = mapOptionsToSaveSelector(state);
    return MapUtils.saveMapConfiguration(map, layers, groups, backgrounds, textSearchConfig, bookmarkSearchConfig, additionalOptions);
};
/**
 * Selector to identify pending changes.
 * TODO: reuse if possible with `mapSaveSelector` (actually they differs a little)
 * @param {object} state
 * @returns {boolean} true if there are pending changes to save.
 */
export const mapHasPendingChangesSelector = state => {
    const updatedMap = mapSaveSelector(state);
    const currentMap = mapSelector(state) || {};
    const { canEdit } = currentMap.info || {};
    const { mapConfigRawData } = state;
    return (canEdit || !currentMap.mapId) && !MapUtils.compareMapChanges(mapConfigRawData, updatedMap);
};

