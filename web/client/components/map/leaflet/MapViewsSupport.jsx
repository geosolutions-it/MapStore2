/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect } from 'react';
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
                const { lng: longitude, lat: latitude } = map.getCenter();
                const zoom = map.getZoom();
                const height = getHeightFromZoom(zoom);
                const bbox = map.getBounds().toBBoxString().split(',');
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
                    bbox: [
                        parseFloat(bbox[0]),
                        parseFloat(bbox[1]),
                        parseFloat(bbox[2]),
                        parseFloat(bbox[3])
                    ]
                };
            },
            setView: (view) => {
                if (view.bbox) {
                    return map.fitBounds([
                        [view.bbox[1], view.bbox[0]],
                        [view.bbox[3], view.bbox[2]]
                    ],
                    {
                        duration: 500,
                        animate: !view.flyTo ? false : undefined
                    }
                    );
                }
                return null;
            }
        });
    }, [map]);

    return null;
}

export default MapViewSupport;
