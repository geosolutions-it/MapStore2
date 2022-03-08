/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEmpty } from 'lodash';

/**
 * Utils for media editor
 */

export const SourceTypes = {
    GEOSTORY: 'geostory',
    GEOSTORE: 'geostore'
};
export const defaultLayerMapPreview = {
    type: 'osm',
    title: 'Open Street Map',
    name: 'mapnik',
    source: 'osm',
    group: 'background',
    visibility: true,
    id: 'mapnik__0',
    loading: false,
    loadingError: false
};
/**
 * Returns media service active for a selected media type
 * @param Object services
 * @param Object activeMediaService
 * @param String mediaType
 * @returns {*|string}
 */
export const selectService = (services, activeMediaService = {}, mediaType = 'image')=>{
    if (!isEmpty(activeMediaService)) {
        const activeItem = activeMediaService[mediaType];
        return services.find(service => service.id === activeItem)
            ? activeItem : SourceTypes.GEOSTORY;
    }
    return SourceTypes.GEOSTORY;
};

