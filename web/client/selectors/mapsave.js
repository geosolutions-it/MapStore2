/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {createStructuredSelector} = require('reselect');
const {servicesSelector, selectedServiceSelector} = require('./catalog');
const {getFloatingWidgets, getCollapsedState, getFloatingWidgetsLayout} = require('./widgets');
const { mapInfoConfigurationSelector } = require('./mapInfo');
const { currentTimeSelector, offsetTimeSelector } = require('./dimension');
const { selectedLayerSelector } = require('./timeline');

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

module.exports = {mapOptionsToSaveSelector, registerCustomSaveHandler};
