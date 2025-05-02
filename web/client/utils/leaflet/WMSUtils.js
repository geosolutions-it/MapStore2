/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import L from 'leaflet';
import { isNil } from 'lodash';
import { creditsToAttribution, getWMSVendorParams } from '../LayersUtils';
import { isVectorFormat } from '../VectorTileUtils';
import { optionsToVendorParams } from '../VendorParamsUtils';
import { addAuthenticationToSLD } from '../SecurityUtils';

// implementation used by wms and elevation types
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

export const PARAM_OPTIONS = ["layers", "styles", "format", "transparent", "version", "tiled", "zindex", "_v_", "cql_filter", "sld"];

export const filterWMSParamOptions = (options) => {
    let paramOptions = {};
    Object.keys(options).forEach((key) => {
        if (!key || !key.toLowerCase) {
            return;
        }
        if (PARAM_OPTIONS.indexOf(key.toLowerCase()) >= 0) {
            paramOptions[key] = options[key];
        }
    });
    return paramOptions;
};

export function wmsToLeafletOptions(options) {
    var opacity = options.opacity !== undefined ? options.opacity : 1;
    const params = optionsToVendorParams(options);
    // NOTE: can we use opacity to manage visibility?
    const result = {
        ...options.baseParams,
        attribution: options.credits && creditsToAttribution(options.credits),
        layers: options.name,
        styles: options.style || "",
        format: isVectorFormat(options.format) && 'image/png' || options.format || 'image/png',
        transparent: options.transparent !== undefined ? options.transparent : true,
        ...getWMSVendorParams(options),
        opacity: opacity,
        zIndex: options.zIndex,
        version: options.version || "1.3.0",
        tileSize: options.tileSize || 256,
        maxZoom: options.maxZoom || 23,
        maxNativeZoom: options.maxNativeZoom || 18,
        ...(options._v_ ? {_v_: options._v_} : {}),
        ...(params || {})
    };
    return addAuthenticationToSLD(result, options);
}

export function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

export const removeNulls = (obj = {}) => {
    return Object.keys(obj).reduce((previous, key) => {
        return isNil(obj[key]) ? previous : Object.assign(previous, {
            [key]: obj[key]
        });
    }, {});
};
