/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import L from 'leaflet';
import Layers from '../../../../utils/leaflet/Layers';
import 'leaflet-plugins/layer/tile/Bing';
import assign from 'object-assign';

L.BingLayer.prototype.loadMetadata = function() {
    if (this.metaRequested) {
        return;
    }
    this.metaRequested = true;
    const _this = this;
    const cbid = '_bing_metadata_' + L.Util.stamp(this);
    window[cbid] = function(meta) {
        _this.meta = meta;
        window[cbid] = undefined;
        const e = document.getElementById(cbid);
        e.parentNode.removeChild(e);
        if (meta.errorDetails) {
            _this.fire('load', {layer: _this});
            return _this.onError(meta);
        }
        _this.initMetadata(meta);
        return null;
    };
    const urlScheme = document.location.protocol === 'file:' ? 'https' : document.location.protocol.slice(0, -1);
    const url = urlScheme + '://dev.virtualearth.net/REST/v1/Imagery/Metadata/'
                + this.options.type + '?include=ImageryProviders&jsonp=' + cbid +
                '&key=' + this._key + '&UriScheme=' + urlScheme;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.id = cbid;
    document.getElementsByTagName('head')[0].appendChild(script);
};
L.BingLayer.prototype.onError = function(meta) {
    if (this.options.onError) {
        return this.options.onError(meta);
    }
    return null;
};


Layers.registerType('bing', {
    create: (options) => {
        var key = options.apiKey;
        let layerOptions = {
            subdomains: [0, 1, 2, 3],
            type: options.name,
            attribution: 'Bing',
            culture: '',
            onError: options.onError,
            maxNativeZoom: options.maxNativeZoom || 19,
            maxZoom: options.maxZoom || 23
        };
        if (options.zoomOffset) {
            layerOptions = assign({}, layerOptions, {
                zoomOffset: options.zoomOffset
            });
        }
        return new L.BingLayer(key, layerOptions);
    },
    isValid: (layer) => {
        if (layer.meta && layer.meta.statusCode && layer.meta.statusCode !== 200) {
            return false;
        }
        return true;
    }
});
