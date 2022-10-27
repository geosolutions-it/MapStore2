/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect } from 'react';
import {
    reproject,
    reprojectBbox
} from '../../../utils/CoordinatesUtils';
import {
    getHeightFromZoom,
    ViewSettingsTypes
} from '../../../utils/MapViewsUtils';

function MapViewSupport({
    map,
    apiRef = () => {}
}) {

    useEffect(() => {
        apiRef({
            options: {
                settings: [
                    ViewSettingsTypes.DESCRIPTION,
                    ViewSettingsTypes.POSITION,
                    ViewSettingsTypes.ANIMATION,
                    ViewSettingsTypes.LAYERS_OPTIONS
                ],
                unsupportedLayers: ['3dtiles', 'terrain']
            },
            getView: () => {
                const view = map.getView();
                const center = view.getCenter();
                const zoom = view.getZoom();
                const projection = view.getProjection();
                const extent = view.calculateExtent(map.getSize());
                const crs = projection.getCode();
                const { x: longitude, y: latitude } = reproject(center, crs, 'EPSG:4326');
                const height = getHeightFromZoom(zoom);
                const reprojectedBbox = reprojectBbox(extent, crs, 'EPSG:4326');
                const [minx, miny, maxx, maxy] = reprojectedBbox;
                return {
                    zoom,
                    center: {
                        longitude,
                        latitude,
                        height: 0
                    },
                    cameraPosition: {
                        longitude,
                        latitude,
                        height
                    },
                    bbox: [minx, miny, maxx, maxy]
                };
            },
            setView: (view) => {
                const projection = map.getView().getProjection();
                const crs = projection.getCode();
                if (view.bbox) {
                    const reprojectedBbox = reprojectBbox(view.bbox, 'EPSG:4326', crs);
                    return map.getView().fit(reprojectedBbox, {
                        size: map.getSize(),
                        duration: view.flyTo ? 500 : 0,
                        nearest: true
                    });
                }
                return null;
            }
        });
    }, [map]);

    return null;
}

export default MapViewSupport;
