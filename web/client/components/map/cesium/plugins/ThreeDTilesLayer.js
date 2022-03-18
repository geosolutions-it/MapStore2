/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';
import isEqual from 'lodash/isEqual';

function getStyle({ style }) {
    if (style?.format === '3dtiles' && style?.body) {
        return Promise.resolve(style.body);
    }
    return Promise.resolve(null);
}

Layers.registerType('3dtiles', {
    create: (options, map) => {
        if (options.visibility && options.url) {

            const tileSet = map.scene.primitives.add(new Cesium.Cesium3DTileset({
                url: options.url
            }));

            getStyle(options)
                .then((style) => {
                    if (style) {
                        tileSet.style = new Cesium.Cesium3DTileStyle(style);
                    }
                });

            return {
                detached: true,
                tileSet,
                remove: () => {
                    map.scene.primitives.remove(tileSet);
                }
            };
        }
        return {
            detached: true,
            remove: () => {}
        };
    },
    update: function(layer, newOptions, oldOptions, map) {
        if (newOptions.visibility && !oldOptions.visibility) {
            return this.create(newOptions, map);
        }
        if (!newOptions.visibility && oldOptions.visibility && layer?.remove) {
            layer.remove();
            return null;
        }
        if (!isEqual(newOptions.style, oldOptions.style) && layer?.tileSet) {
            getStyle(newOptions)
                .then((style) => {
                    if (style && layer?.tileSet) {
                        layer.tileSet.makeStyleDirty();
                        layer.tileSet.style = new Cesium.Cesium3DTileStyle(style);
                    }
                });
        }
        return null;
    }
});
