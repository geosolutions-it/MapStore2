/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const defaultIconStyle = {
    iconUrl: require('../product/assets/img/marker-icon-red.png'),
    shadowUrl: require('../product/assets/img/marker-shadow.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
};

const showGFIForService = (service) => service?.launchInfoPanel === 'single_layer' && !!service?.openFeatureInfoButtonEnabled;

const layerIsVisibleForGFI = (searchLayerObj, service) => service?.forceSearchLayerVisibility || !!searchLayerObj?.visibility;

module.exports = {
    defaultIconStyle,
    showGFIForService,
    layerIsVisibleForGFI
};
