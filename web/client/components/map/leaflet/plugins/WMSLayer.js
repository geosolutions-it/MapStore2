/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../../../components/I18N/Message');
const Layers = require('../../../../utils/leaflet/Layers');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const { optionsToVendorParams } = require('../../../../utils/VendorParamsUtils');

const WMSUtils = require('../../../../utils/leaflet/WMSUtils');
const L = require('leaflet');
const objectAssign = require('object-assign');
const {isArray, isNil} = require('lodash');
const SecurityUtils = require('../../../../utils/SecurityUtils');
const ElevationUtils = require('../../../../utils/ElevationUtils');
const { creditsToAttribution } = require('../../../../utils/LayersUtils');

const { isVectorFormat } = require('../../../../utils/VectorTileUtils');

require('leaflet.nontiledlayer');

L.NonTiledLayer.WMSCustom = L.NonTiledLayer.WMS.extend({
    initialize: function(url, options) { // (String, Object)
        this._wmsUrl = url;

        let wmsParams = L.extend({}, this.defaultWmsParams);

        // all keys that are not NonTiledLayer options go to WMS params
        for (let i in options) {
            if (!this.options.hasOwnProperty(i) && i.toUpperCase() !== 'CRS' && i !== "maxNativeZoom") {
                wmsParams[i] = options[i];
            }
        }

        this.wmsParams = wmsParams;

        L.setOptions(this, options);
    },
    removeParams: function(params = [], noRedraw) {
        params.forEach( key => delete this.wmsParams[key]);
        if (!noRedraw) {
            this.redraw();
        }
        return this;
    }
});
L.nonTiledLayer.wmsCustom = function(url, options) {
    return new L.NonTiledLayer.WMSCustom(url, options);
};

L.TileLayer.MultipleUrlWMS = L.TileLayer.WMS.extend({
    initialize: function(urls, options) {
        this._url = urls[0];
        this._urls = urls;

        this._urlsIndex = 0;

        let wmsParams = L.extend({}, this.defaultWmsParams);
        let tileSize = options.tileSize || this.options.tileSize;

        if (options.detectRetina && L.Browser.retina) {
            wmsParams.width = wmsParams.height = tileSize * 2;
        } else {
            wmsParams.width = wmsParams.height = tileSize;
        }
        for (let i in options) {
            // all keys that are not TileLayer options go to WMS params
            if (!this.options.hasOwnProperty(i) && i.toUpperCase() !== 'CRS' && i !== "maxNativeZoom") {
                wmsParams[i] = options[i];
            }
        }
        this.wmsParams = wmsParams;

        L.setOptions(this, options);
    },
    getTileUrl: function(tilePoint) { // (Point, Number) -> String
        let map = this._map;
        let tileSize = this.options.tileSize;

        let nwPoint = tilePoint.multiplyBy(tileSize);
        let sePoint = nwPoint.add([tileSize, tileSize]);

        let nw = this._crs.project(map.unproject(nwPoint, tilePoint.z));
        let se = this._crs.project(map.unproject(sePoint, tilePoint.z));
        let bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
            [se.y, nw.x, nw.y, se.x].join(',') :
            [nw.x, se.y, se.x, nw.y].join(',');
        this._urlsIndex++;
        if (this._urlsIndex === this._urls.length) {
            this._urlsIndex = 0;
        }
        const url = L.Util.template(this._urls[this._urlsIndex], {s: this._getSubdomain(tilePoint)});

        return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
    },
    removeParams: function(params = [], noRedraw) {
        params.forEach( key => delete this.wmsParams[key]);
        if (!noRedraw) {
            this.redraw();
        }
        return this;
    }
});

L.tileLayer.multipleUrlWMS = function(urls, options) {
    return new L.TileLayer.MultipleUrlWMS(urls, options);
};


L.TileLayer.ElevationWMS = L.TileLayer.MultipleUrlWMS.extend({
    initialize: function(urls, options, nodata) {
        this._tiles = {};
        this._nodata = nodata;
        L.TileLayer.MultipleUrlWMS.prototype.initialize.apply(this, arguments);
    },
    _addTile: function(coords) {
        const tileUrl = this.getTileUrl(coords);
        ElevationUtils.loadTile(tileUrl, coords, this._tileCoordsToKey(coords));
    },

    getElevation: function(latLng, containerPoint) {
        try {
            const tilePoint = this._getTileFromCoords(latLng);
            const elevation = ElevationUtils.getElevation(this._tileCoordsToKey(tilePoint),
                this._getTileRelativePixel(tilePoint, containerPoint), this.getTileSize().x, this._nodata);
            if (elevation.available) {
                return elevation.value;
            }
            return <Message msgId={elevation.message} />;
        } catch (e) {
            return <Message msgId="elevationLoadingError" />;
        }
    },
    _getTileFromCoords: function(latLng) {
        var layerPoint = this._map.project(latLng).divideBy(256).floor();
        return objectAssign(layerPoint, {z: this._tileZoom});
    },
    _getTileRelativePixel: function(tilePoint, containerPoint) {
        var x = Math.floor(containerPoint.x - this._getTilePos(tilePoint).x - this._map._getMapPanePos().x);
        var y = Math.min(this.getTileSize().x - 1, Math.floor(containerPoint.y - this._getTilePos(tilePoint).y - this._map._getMapPanePos().y));
        return new L.Point(x, y);
    },
    _removeTile: function() {},
    _abortLoading: function() {}
});

L.tileLayer.elevationWMS = function(urls, options, nodata) {
    return new L.TileLayer.ElevationWMS(urls, options, nodata);
};

const removeNulls = (obj = {}) => {
    return Object.keys(obj).reduce((previous, key) => {
        return isNil(obj[key]) ? previous : objectAssign(previous, {
            [key]: obj[key]
        });
    }, {});
};

function wmsToLeafletOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
    const params = optionsToVendorParams(options);
    // NOTE: can we use opacity to manage visibility?
    const result = objectAssign({}, options.baseParams, {
        attribution: options.credits && creditsToAttribution(options.credits),
        layers: options.name,
        styles: options.style || "",
        format: isVectorFormat(options.format) && 'image/png' || options.format || 'image/png',
        transparent: options.transparent !== undefined ? options.transparent : true,
        tiled: options.tiled !== undefined ? options.tiled : true,
        opacity: opacity,
        zIndex: options.zIndex,
        version: options.version || "1.3.0",
        SRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        CRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        tileSize: options.tileSize || 256,
        maxZoom: options.maxZoom || 23,
        maxNativeZoom: options.maxNativeZoom || 18
    }, objectAssign(
        (options._v_ ? {_v_: options._v_} : {}),
        (params || {})
    ));
    return SecurityUtils.addAuthenticationToSLD(result, options);
}

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

Layers.registerType('wms', {
    create: (options) => {
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const queryParameters = removeNulls(wmsToLeafletOptions(options) || {});
        urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, options.securityToken));
        if (options.useForElevation) {
            return L.tileLayer.elevationWMS(urls, queryParameters, options.nodata || -9999);
        }
        if (options.singleTile) {
            return L.nonTiledLayer.wmsCustom(urls[0], queryParameters);
        }
        return L.tileLayer.multipleUrlWMS(urls, queryParameters);
    },
    update: function(layer, newOptions, oldOptions) {
        if (oldOptions.singleTile !== newOptions.singleTile || oldOptions.tileSize !== newOptions.tileSize || oldOptions.securityToken !== newOptions.securityToken && newOptions.visibility) {
            let newLayer;
            const urls = getWMSURLs(isArray(newOptions.url) ? newOptions.url : [newOptions.url]);
            const queryParameters = wmsToLeafletOptions(newOptions) || {};
            urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters, newOptions.securityToken));
            if (newOptions.singleTile) {
                // return the nonTiledLayer
                newLayer = L.nonTiledLayer.wmsCustom(urls[0], queryParameters);
            } else {
                newLayer = L.tileLayer.multipleUrlWMS(urls, queryParameters);
            }
            return newLayer;
        }
        // find the options that make a parameter change
        let oldqueryParameters = objectAssign({}, WMSUtils.filterWMSParamOptions(wmsToLeafletOptions(oldOptions)),
            SecurityUtils.addAuthenticationToSLD(oldOptions.params || {}, oldOptions));
        let newQueryParameters = objectAssign({}, WMSUtils.filterWMSParamOptions(wmsToLeafletOptions(newOptions)),
            SecurityUtils.addAuthenticationToSLD(newOptions.params || {}, newOptions));
        let newParameters = Object.keys(newQueryParameters).filter((key) => {return newQueryParameters[key] !== oldqueryParameters[key]; });
        let removeParams = Object.keys(oldqueryParameters).filter((key) => { return oldqueryParameters[key] !== newQueryParameters[key]; });
        let newParams = {};
        if (removeParams.length > 0) {
            layer.removeParams(removeParams, newParameters.length > 0);
        }
        if ( newParameters.length > 0 ) {
            newParams = newParameters.reduce( (accumulator, currentValue) => {
                return objectAssign({}, accumulator, {[currentValue]: newQueryParameters[currentValue] });
            }, newParams);
            // set new options as parameters, merged with params
            layer.setParams(removeNulls(objectAssign(newParams, newParams.params, SecurityUtils.addAuthenticationToSLD(newOptions.params || {}, newOptions))));
        }/* else if (!isEqual(newOptions.params, oldOptions.params)) {
            layer.setParams(newOptions.params);
        }*/
        return null;
    }
});
