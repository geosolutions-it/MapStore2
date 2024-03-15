/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';

import { isEqual } from 'lodash';

/**
 * @deprecated
 */
Layers.registerType('marker', {
    create: (options, map) => {
        if (!options.visibility) {
            return {
                detached: true,
                point: undefined,
                remove: () => {}
            };
        }
        const style = {
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2
            },
            ...options.style
        };
        const point = map.entities.add({
            position: Cesium.Cartesian3.fromDegrees(options?.point?.lng || 0, options?.point?.lat || 0),
            ...style
        });
        return {
            detached: true,
            point: point,
            remove: () => {
                map.entities.remove(point);
            }
        };
    },
    update: function(layer, newOptions, oldOptions, map) {
        if (!isEqual(newOptions.point, oldOptions.point)) {
            return this.create(newOptions, map);
        }
        return null;
    }
});
