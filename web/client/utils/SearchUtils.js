/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import iconUrl from '../product/assets/img/marker-icon-red.png';
import shadowUrl from '../product/assets/img/marker-shadow.png';
import { getAvailableCRS, reproject } from './CoordinatesUtils';
import pointOnSurface from '@turf/point-on-surface';

/** Resolve WFS request options without changing the saved service configuration. */
export const getSearchServiceOptions = (service, mapCrs = 'EPSG:4326') => {
    if (service.type !== 'wfs' || !service.options?.srsName) {
        return service.options;
    }
    const srsName = service.options.srsName === 'map' ? mapCrs : service.options.srsName;
    if (!getAvailableCRS()[srsName]) {
        throw new Error(`Unsupported search CRS: ${srsName}`);
    }
    return { ...service.options, srsName };
};

export const getSearchResultCrs = (item) => item?.__CRS__
    || (item?.__SERVICE__?.options?.srsName !== 'map' && item?.__SERVICE__?.options?.srsName)
    || 'EPSG:4326';

export const searchServiceUsesMapCrs = (service) => !!service && (
    (service.type === 'wfs' && service.options?.srsName === 'map')
    || searchServiceUsesMapCrs(service.options?.item?.__SERVICE__)
    || searchServiceUsesMapCrs(service.geomService)
    || (service.then || []).some(searchServiceUsesMapCrs)
);

/** Feature info expects longitude/latitude even when the search geometry is projected. */
export const getSearchResultLatLng = (item) => {
    const coordinates = pointOnSurface(item).geometry.coordinates;
    const crs = getSearchResultCrs(item);
    if (crs === 'EPSG:4326') {
        return { lng: coordinates[0], lat: coordinates[1] };
    }
    const point = reproject(coordinates, crs, 'EPSG:4326');
    return point ? { lng: point.x, lat: point.y } : null;
};

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
