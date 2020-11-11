/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Observable } from 'rxjs';
import castArray from 'lodash/castArray';
import { excludeGoogleBackground, extractTileMatrixFromSources } from '../../utils/LayersUtils';
import { convertFromLegacy, normalizeConfig } from '../../utils/ConfigUtils';

import { getResource, getResources } from '../persistence';
import uuid from 'uuid';

export const load = ({ params }) => {
    const { page, pageSize } = params;
    const emptyResponse = {
        resources: [],
        totalCount: 0
    };
    return getResources({
        category: 'MAP',
        query: params.q || '*',
        options: {
            params: {
                start: (page - 1) * pageSize,
                limit: pageSize
            }
        }
    })
        .switchMap(({ results, totalCount }) => {
            return Observable.of({
                resources: (results !== '' && castArray(results) || [])
                    .map((result = {}) => ({
                        data: {
                            ...result,
                            // this decode is for backward compatibility with old linked resources`rest%2Fgeostore%2Fdata%2F2%2Fraw%3Fdecode%3Ddatauri` not needed for new ones `rest/geostore/data/2/raw?decode=datauri`
                            thumbnail: decodeURIComponent(result.thumbnail || '')
                        },
                        id: uuid(),
                        type: 'map'
                    })),
                totalCount: totalCount || 0
            });
        })
        .catch(() => {
            return Observable.of(emptyResponse);
        });
};

export const getData = ({ selectedItem }) => {
    if (selectedItem && selectedItem.type === 'map'
    && selectedItem.data && selectedItem.data.id
    // request only if the configuration is missing
    && !selectedItem.data.layers) {
        return getResource(selectedItem.data.id)
            .switchMap(({
                id,
                data,
                attributes,
                creation,
                canCopy,
                canDelete,
                canEdit,
                name,
                description
            }) => {

                const config = data;
                const mapState = !config.version
                    ? convertFromLegacy(config)
                    : normalizeConfig(config.map);

                const layers = excludeGoogleBackground(mapState.layers.map(layer => {
                    if (layer.group === 'background' && (layer.type === 'ol' || layer.type === 'OpenLayers.Layer')) {
                        layer.type = 'empty';
                    }
                    return layer;
                }));

                const map = {
                    ...(mapState && mapState.map || {}),
                    id,
                    groups: mapState && mapState.groups || [],
                    layers: mapState?.map?.sources
                        ? layers.map(layer => {
                            const tileMatrix = extractTileMatrixFromSources(mapState.map.sources, layer);
                            return { ...layer, ...tileMatrix };
                        })
                        : layers
                };

                return Observable.of({
                    ...map,
                    ...attributes,
                    id,
                    creation,
                    canCopy,
                    canDelete,
                    canEdit,
                    name,
                    description,
                    thumbnail: decodeURIComponent(attributes.thumbnail || ''),
                    type: 'map'
                });
            });
    }
    return Observable.of(null);
};
