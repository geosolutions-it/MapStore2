/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/leaflet/Layers';

import { filterWMSParamOptions, getWMSURLs, wmsToLeafletOptions, removeNulls } from '../../../../utils/leaflet/WMSUtils';
import L from 'leaflet';
import { isArray } from 'lodash';
import {addAuthenticationToSLD, addAuthenticationParameter} from '../../../../utils/SecurityUtils';

import 'leaflet.nontiledlayer';

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

Layers.registerType('wms', {
    create: (options, map, mapId) => {
        // the useForElevation in wms types will be deprecated
        // as support for existing configuration
        // we can use this fallback
        if (options.useForElevation) {
            return Layers.createLayer('elevation', {
                ...options,
                provider: 'wms'
            }, map, mapId);
        }
        const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
        const queryParameters = removeNulls(wmsToLeafletOptions(options) || {});
        urls.forEach(url => addAuthenticationParameter(url, queryParameters, options.securityToken));
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
            urls.forEach(url => addAuthenticationParameter(url, queryParameters, newOptions.securityToken));
            if (newOptions.singleTile) {
                // return the nonTiledLayer
                newLayer = L.nonTiledLayer.wmsCustom(urls[0], queryParameters);
            } else {
                newLayer = L.tileLayer.multipleUrlWMS(urls, queryParameters);
            }
            return newLayer;
        }
        // find the options that make a parameter change
        let oldqueryParameters = Object.assign({}, filterWMSParamOptions(wmsToLeafletOptions(oldOptions)),
            addAuthenticationToSLD(oldOptions.params || {}, oldOptions));
        let newQueryParameters = Object.assign({}, filterWMSParamOptions(wmsToLeafletOptions(newOptions)),
            addAuthenticationToSLD(newOptions.params || {}, newOptions));
        let newParameters = Object.keys(newQueryParameters).filter((key) => {return newQueryParameters[key] !== oldqueryParameters[key]; });
        let removeParams = Object.keys(oldqueryParameters).filter((key) => { return oldqueryParameters[key] !== newQueryParameters[key]; });
        let newParams = {};
        if (removeParams.length > 0) {
            layer.removeParams(removeParams, newParameters.length > 0);
        }
        if ( newParameters.length > 0 ) {
            newParams = newParameters.reduce( (accumulator, currentValue) => {
                return Object.assign({}, accumulator, {[currentValue]: newQueryParameters[currentValue] });
            }, newParams);
            // set new options as parameters, merged with params
            layer.setParams(removeNulls(Object.assign(newParams, newParams.params, addAuthenticationToSLD(newOptions.params || {}, newOptions))));
        }/* else if (!isEqual(newOptions.params, oldOptions.params)) {
            layer.setParams(newOptions.params);
        }*/
        return null;
    }
});
