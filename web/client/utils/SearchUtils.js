/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import iconUrl from '../product/assets/img/marker-icon-red.png';
import shadowUrl from '../product/assets/img/marker-shadow.png';

export const defaultIconStyle = {
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
};

export const showGFIForService = (service) => service?.launchInfoPanel === 'single_layer' && !!service?.openFeatureInfoButtonEnabled;

export const layerIsVisibleForGFI = (searchLayerObj, service) => !!searchLayerObj && (service?.forceSearchLayerVisibility || !!searchLayerObj.visibility);
