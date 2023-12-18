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
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';
import { getProxyUrl, needProxy } from "../../../../utils/ProxyUtils";
import { getStyleParser } from '../../../../utils/VectorStyleUtils';
import { polygonToClippingPlanes } from '../../../../utils/cesium/PrimitivesUtils';
import tinycolor from 'tinycolor2';
import googleOnWhiteLogo from '../img/google_on_white_hdpi.png';
import googleOnNonWhiteLogo from '../img/google_on_non_white_hdpi.png';

const cleanStyle = (style, options) => {
    if (style && options?.pointCloudShading?.attenuation) {
        // remove pointSize if attenuation are applied
        const { pointSize, ...others } = style;
        return others;
    }
    return style;
};

function getStyle({ style, pointCloudShading = {} }) {
    const { format, body } = style || {};
    if (!format || !body) {
        return Promise.resolve(null);
    }
    if (format === '3dtiles') {
        return Promise.resolve(cleanStyle(body, { pointCloudShading }));
    }
    if (format === 'geostyler') {
        return getStyleParser('3dtiles')
            .then((parser) => parser.writeStyle(body))
            .then((parsedStyle) => cleanStyle(parsedStyle, { pointCloudShading }));
    }
    return Promise.all([
        getStyleParser(format),
        getStyleParser('3dtiles')
    ])
        .then(([parser, threeDTilesParser]) =>
            parser
                .readStyle(body)
                .then(parsedStyle => threeDTilesParser.writeStyle(parsedStyle))
                .then((parsedStyle) => cleanStyle(parsedStyle, { pointCloudShading }))
        );
}

function updateModelMatrix(tileSet, { heightOffset }) {
    if (!isNaN(heightOffset) && isNumber(heightOffset)) {
        const boundingSphere = tileSet.boundingSphere;
        const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);          // undefined if the cartesian is at the center of the ellipsoid
        const surface = Cesium.Cartesian3.fromRadians(cartographic?.longitude || 0, cartographic?.latitude || 0, 0.0);
        const offset = Cesium.Cartesian3.fromRadians(cartographic?.longitude || 0, cartographic?.latitude || 0, heightOffset);
        const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        tileSet.modelMatrix =  Cesium.Matrix4.fromTranslation(translation);
    }
}

function clip3DTiles(tileSet, options, map) {
    if (options.clippingPolygon) {
        polygonToClippingPlanes(options.clippingPolygon, !!options.clippingPolygonUnion, options.clipOriginalGeometry)
            .then((planes) => {
                tileSet.clippingPlanes = new Cesium.ClippingPlaneCollection({
                    modelMatrix: Cesium.Matrix4.inverse(
                        Cesium.Matrix4.multiply(
                            tileSet.root.computedTransform,
                            tileSet._initialClippingPlanesOriginMatrix,
                            new Cesium.Matrix4()
                        ),
                        new Cesium.Matrix4()),
                    planes,
                    edgeWidth: 1.0,
                    edgeColor: Cesium.Color.WHITE,
                    unionClippingRegions: !!options.clippingPolygonUnion
                });
                map.scene.requestRender();
            });
    } else {
        tileSet.clippingPlanes = new Cesium.ClippingPlaneCollection({ planes: [] });
        map.scene.requestRender();
    }
}

function ensureReady(tileSet, callback) {
    if (tileSet.ready) {
        callback();
    } else {
        tileSet.readyPromise.then(() => {
            callback();
        });
    }
}

// Google Photorealistic 3D Tiles requires both attribution and brand logo (see https://cloud.google.com/blog/products/maps-platform/commonly-asked-questions-about-our-recently-launched-photorealistic-3d-tiles)
// The attribution are dynamic and updated directly with the `showCreditsOnScreen` property (see https://developers.google.com/maps/documentation/tile/policies#3d_tiles)
// The brand logo instead is not managed by the Cesium3DTileset class and must to be included in the credits
function updateGooglePhotorealistic3DTilesBrandLogo(map, options, tileSet) {
    if ((options?.url || '').includes('https://tile.googleapis.com')) {
        if (!tileSet._googleCredit) {
            const bodyStyle = window?.getComputedStyle ? window.getComputedStyle(document.body, null) : null;
            const bodyBackgroundColor = bodyStyle?.getPropertyValue ? bodyStyle.getPropertyValue('background-color') : '#ffffff';
            const src = tinycolor(bodyBackgroundColor).isDark()
                ? googleOnNonWhiteLogo
                : googleOnWhiteLogo;
            tileSet._googleCredit = new Cesium.Credit(`<img src="${src}" title="Google" style="padding:0 0.5rem"/>`, true);
            return map.creditDisplay.addStaticCredit(tileSet._googleCredit);
        }
        return map.creditDisplay.removeStaticCredit(tileSet._googleCredit);
    }
    return null;
}

function updateShading(tileSet, options, map) {
    // point cloud
    tileSet.pointCloudShading.attenuation = !!options?.pointCloudShading?.attenuation;
    tileSet.pointCloudShading.maximumAttenuation = options?.pointCloudShading?.maximumAttenuation ?? 4;
    tileSet.pointCloudShading.eyeDomeLighting = !!options?.pointCloudShading?.eyeDomeLighting;
    tileSet.pointCloudShading.eyeDomeLightingStrength = options?.pointCloudShading?.eyeDomeLightingStrength ?? 1.0;
    tileSet.pointCloudShading.eyeDomeLightingRadius = options?.pointCloudShading?.eyeDomeLightingRadius ?? 1.0;
    setTimeout(() => map.scene.requestRender());
}

Layers.registerType('3dtiles', {
    create: (options, map) => {
        if (!options.visibility) {
            return {
                detached: true,
                getTileSet: () => undefined,
                remove: () => {}
            };
        }
        let tileSet;
        const resource = new Cesium.Resource({
            url: options.url,
            proxy: needProxy(options.url) ? new Cesium.DefaultProxy(getProxyUrl()) : undefined
            // TODO: axios supports also adding access tokens or credentials (e.g. authkey, Authentication header ...).
            // if we want to use internal cesium functionality to retrieve data
            // we need to create a utility to set a CesiumResource that applies also this part.
            // in addition to this proxy.
        });
        let promise = Cesium.Cesium3DTileset.fromUrl(resource,
            {
                showCreditsOnScreen: true
            }
        ).then((_tileSet) => {
            tileSet = _tileSet;
            updateGooglePhotorealistic3DTilesBrandLogo(map, options, tileSet);
            map.scene.primitives.add(tileSet);
            // assign the original mapstore id of the layer
            tileSet.msId = options.id;

            ensureReady(tileSet, () => {
                updateModelMatrix(tileSet, options);
                clip3DTiles(tileSet, options, map);
                updateShading(tileSet, options, map);
                getStyle(options)
                    .then((style) => {
                        if (style) {
                            tileSet.style = new Cesium.Cesium3DTileStyle(style);
                        }
                    });
            });
        });
        const removeTileset = () => {
            updateGooglePhotorealistic3DTilesBrandLogo(map, options, tileSet);
            map.scene.primitives.remove(tileSet);
            tileSet = undefined;
        };
        return {
            detached: true,
            getTileSet: () => tileSet,
            resource,
            remove: () => {
                if (tileSet) {
                    removeTileset();
                    return;
                }
                promise.then(() => {
                    removeTileset();
                });
                return;
            }
        };
    },
    update: function(layer, newOptions, oldOptions, map) {
        const tileSet = layer?.getTileSet();
        if (
            (!isEqual(newOptions.clippingPolygon, oldOptions.clippingPolygon)
            || newOptions.clippingPolygonUnion !== oldOptions.clippingPolygonUnion
            || newOptions.clipOriginalGeometry !== oldOptions.clipOriginalGeometry)
         && tileSet) {
            ensureReady(tileSet, () => {
                clip3DTiles(tileSet, newOptions, map);
            });
        }
        if ((
            !isEqual(newOptions.style, oldOptions.style)
            || newOptions?.pointCloudShading?.attenuation !== oldOptions?.pointCloudShading?.attenuation
        ) && tileSet) {
            ensureReady(tileSet, () => {
                getStyle(newOptions)
                    .then((style) => {
                        if (style && tileSet) {
                            tileSet.makeStyleDirty();
                            tileSet.style = new Cesium.Cesium3DTileStyle(style);
                        }
                    });
            });
        }
        if (!isEqual(newOptions.pointCloudShading, oldOptions.pointCloudShading) && tileSet) {
            ensureReady(tileSet, () => {
                updateShading(tileSet, newOptions, map);
            });
        }
        if (tileSet && newOptions.heightOffset !== oldOptions.heightOffset) {
            ensureReady(tileSet, () => {
                updateModelMatrix(tileSet, newOptions);
            });
        }
        return null;
    }
});
