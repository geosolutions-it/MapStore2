/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/leaflet/Layers';
import L from 'leaflet';
import { isArray } from 'lodash';
import { addAuthenticationParameter } from '../../../../utils/SecurityUtils';
import { loadTile, getElevation, getElevationKey } from '../../../../utils/ElevationUtils';
import { getWMSURLs, wmsToLeafletOptions, removeNulls } from '../../../../utils/leaflet/WMSUtils';

L.TileLayer.ElevationWMS = L.TileLayer.MultipleUrlWMS.extend({
    initialize: function(urls, options, nodata, littleEndian, id) {
        this._msId = id;
        this._tiles = {};
        this._nodata = nodata;
        this._littleEndian = littleEndian;
        L.TileLayer.MultipleUrlWMS.prototype.initialize.apply(this, arguments);
    },
    _addTile: function(coords) {
        const tileUrl = this.getTileUrl(coords);
        loadTile(tileUrl, coords, getElevationKey(coords.x, coords.y, coords.z, this._msId));
    },

    getElevation: function(latLng, containerPoint) {
        try {
            const tilePoint = this._getTileFromCoords(latLng);
            const elevation = getElevation(
                getElevationKey(tilePoint.x, tilePoint.y, tilePoint.z, this._msId),
                this._getTileRelativePixel(tilePoint, containerPoint),
                this.getTileSize().x,
                this._nodata, this._littleEndian
            );
            if (elevation.available) {
                return elevation.value;
            }
            return '';
        } catch (e) {
            return '';
        }
    },
    _getTileFromCoords: function(latLng) {
        const layerPoint = this._map.project(latLng).divideBy(256).floor();
        return Object.assign(layerPoint, {z: this._tileZoom});
    },
    _getTileRelativePixel: function(tilePoint, containerPoint) {
        const x = Math.floor(containerPoint.x - this._getTilePos(tilePoint).x - this._map._getMapPanePos().x);
        const y = Math.min(this.getTileSize().x - 1, Math.floor(containerPoint.y - this._getTilePos(tilePoint).y - this._map._getMapPanePos().y));
        return new L.Point(x, y);
    },
    _removeTile: function() {},
    _abortLoading: function() {},
    onAdd(map) {
        if (!map.msElevationLayers) {
            map.msElevationLayers = [];
        }
        map.msElevationLayers.push(this);
        return L.TileLayer.MultipleUrlWMS.prototype.onAdd.call(this, map);
    },
    onRemove(map) {
        map.msElevationLayers = map.msElevationLayers.filter(elevationLayer => elevationLayer._msId !== this._msId);
        return L.TileLayer.MultipleUrlWMS.prototype.onRemove.call(this, map);
    }
});

L.tileLayer.elevationWMS = function(urls, options, nodata, littleEndian, id) {
    return new L.TileLayer.ElevationWMS(urls, options, nodata, littleEndian, id);
};

const createWMSElevationLayer = (options) => {
    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    const queryParameters = removeNulls(wmsToLeafletOptions(options) || {});
    urls.forEach(url => addAuthenticationParameter(url, queryParameters, options.securityToken));
    const layer = L.tileLayer.elevationWMS(
        urls,
        {
            ...queryParameters,
            format: options?.format || 'application/bil16'
        },
        options.nodata || -9999,
        options?.littleEndian ?? options?.littleendian ?? false,
        options.id
    );
    return layer;
};

Layers.registerType('elevation', {
    create: (options) => {
        if (options.provider === 'wms') {
            return createWMSElevationLayer(options);
        }
        return null;
    }
});
