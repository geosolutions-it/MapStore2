/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';

import { wmsToCesiumOptions } from '../../../../utils/cesium/WMSUtils';
import { addElevationTile, getElevation, getElevationKey, getTileRelativePixel } from '../../../../utils/ElevationUtils';

let canvas;

const createEmptyCanvas = () => {
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
    }
    return canvas;
};

const templateRegex = /{[^}]+}/g;

function buildTileResource(imageryProvider, x, y, level, request) {
    const resource = imageryProvider._resource;
    const url = resource.getUrlComponent(true);
    const allTags = imageryProvider._tags;
    const templateValues = {};
    const match = url.match(templateRegex);
    if (Cesium.defined(match)) {
        match.forEach(function(tag) {
            const key = tag.substring(1, tag.length - 1); // strip {}
            if (!['westProjected', 'southProjected', 'eastProjected', 'northProjected'].includes(key) && Cesium.defined(allTags[key])) {
                templateValues[key] = allTags[key](imageryProvider, x, y, level);
            }
        });
    }
    const nativeRectangle = imageryProvider.tilingScheme.tileXYToNativeRectangle(x, y, level);
    return resource.getDerivedResource({
        request: request,
        templateValues: {
            ...templateValues,
            // the bbox value must be computed here
            // because the internal Cesium tags are using the same object to store the cartesian value with a private boolean
            // causing wrong output related on previous tile bounding boxes
            westProjected: nativeRectangle.west,
            southProjected: nativeRectangle.south,
            eastProjected: nativeRectangle.east,
            northProjected: nativeRectangle.north
        }
    });
}

class ElevationWMS extends Cesium.WebMapServiceImageryProvider {
    constructor({
        nodata,
        littleEndian,
        map,
        ...options
    }) {
        super(options);
        this._msId = options.id;
        this._nodata = nodata ?? -9999;
        this._littleEndian = littleEndian ?? false;
        this._map = map;
        if (!this._map.msElevationLayers) {
            this._map.msElevationLayers = [];
        }
        this._map.msElevationLayers.push(this);
    }
    requestImage(x, y, z, request) {
        const tileRequest = buildTileResource(this._tileProvider, x, y, z, request.clone());
        const resource = Cesium.Resource.createIfNeeded(tileRequest);
        const promise = resource.fetchArrayBuffer();
        if (promise) {
            return promise.then((data) => {
                if (!this._zoomLevelRequested) {
                    this._zoomLevelRequested = [];
                }
                if (!this._zoomLevelRequested.includes(z)) {
                    this._zoomLevelRequested.push(z);
                    this._zoomLevelRequested.sort((a, b) => b - a);
                }
                addElevationTile(data, { x, y, z }, getElevationKey(x, y, z, this._msId), tileRequest.url);
                return createEmptyCanvas();
            });
        }
        return promise;
    }
    getElevation({
        longitude,
        latitude
    }) {
        let elevation;
        const zoomLevelRequested = this._zoomLevelRequested || [];
        for (let i = 0; i < zoomLevelRequested.length; i++) {
            const z = zoomLevelRequested[i];
            const tile = this._tileProvider.tilingScheme.positionToTileXY(new Cesium.Cartographic(longitude, latitude), z);
            if (tile) {
                const x = tile.x;
                const y = tile.y;
                const rectangle = this._tileProvider.tilingScheme.tileXYToRectangle(x, y, z);
                const currentElevation = getElevation(
                    getElevationKey(x, y, z, this._msId),
                    getTileRelativePixel(
                        [longitude, latitude],
                        [rectangle.west, rectangle.south, rectangle.east, rectangle.north],
                        [this._tileProvider.tileWidth, this._tileProvider.tileHeight]
                    ),
                    this._tileProvider.tileWidth,
                    this._nodata,
                    this._littleEndian
                );
                if (currentElevation.available) {
                    elevation = currentElevation;
                    break;
                }
            }
        }
        return elevation?.available ? elevation.value : '';
    }
    destroy() {
        this._map.msElevationLayers = this._map.msElevationLayers.filter(elevationLayer => elevationLayer._msId !== this._msId);
    }
}

const createWMSElevationLayer = (options, map) => {
    const { parameters, ...wmsOptions } = wmsToCesiumOptions(options);
    const layer = new ElevationWMS({
        ...wmsOptions,
        parameters: {
            ...parameters,
            format: options?.format || 'application/bil16'
        },
        id: options.id,
        map,
        nodata: options.nodata,
        littleEndian: options?.littleEndian ?? options?.littleendian ?? false
    });
    return layer;
};

Layers.registerType('elevation', {
    create: (options, map) => {
        if (options.provider === 'wms') {
            return createWMSElevationLayer(options, map);
        }
        return null;
    }
});
