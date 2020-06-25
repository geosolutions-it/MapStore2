/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MapUtils = require('../utils/MapUtils');
const {mapSelector} = require('./map');
const {createStructuredSelector} = require('reselect');
const {servicesSelector, selectedServiceSelector} = require('./catalog');
const {getFloatingWidgets, getCollapsedState, getFloatingWidgetsLayout} = require('./widgets');
const { mapInfoConfigurationSelector } = require('./mapInfo');
const { currentTimeSelector, offsetTimeSelector } = require('./dimension');
const { selectedLayerSelector } = require('./timeline');
const { layersSelector, groupsSelector } = require('../selectors/layers');
const { backgroundListSelector } = require('../selectors/backgroundselector');
const { textSearchConfigSelector, bookmarkSearchConfigSelector } = require('./searchconfig');

const customSaveHandlers = {};

const registerCustomSaveHandler = (section, handler) => {
    if (handler) {
        customSaveHandlers[section] = handler;
    } else {
        delete customSaveHandlers[section];
    }
};

const basicMapOptionsToSaveSelector = createStructuredSelector({
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
        selectedLayer: selectedLayerSelector
    })
});

const mapOptionsToSaveSelector = (state) => {
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
const mapSaveSelector = state => {
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
const mapHasPendingChangesSelector = state => {
    const updatedMap = mapSaveSelector(state);
    const currentMap = mapSelector(state) || {};
    const { canEdit } = currentMap.info || {};
    const { mapConfigRawData } = state;
    return (canEdit || !currentMap.mapId) && !MapUtils.compareMapChanges(mapConfigRawData, updatedMap);
};

module.exports = { mapSaveSelector, mapOptionsToSaveSelector, mapHasPendingChangesSelector, registerCustomSaveHandler};
