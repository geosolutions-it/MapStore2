/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Layers from '../../../../utils/openlayers/Layers';
import TileProvider from '../../../../utils/TileConfigProvider';
import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import { getUrls, template } from '../../../../utils/TileProviderUtils';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import axios from 'axios';
import { getCredentials } from '../../../../utils/SecurityUtils';
import { isEqual } from 'lodash';
function lBoundsToOlExtent(bounds, destPrj) {
    var [ [ miny, minx], [ maxy, maxx ] ] = bounds;
    return CoordinatesUtils.reprojectBbox([minx, miny, maxx, maxy], 'EPSG:4326', CoordinatesUtils.normalizeSRS(destPrj));
}

const tileLoadFunction = options => (image, src) => {
    const storedProtectedService = getCredentials(options.security?.sourceId) || {};
    axios.get(src, {
        headers: {
            "Authorization": `Basic ${btoa(storedProtectedService.username + ":" + storedProtectedService.password)}`
        },
        responseType: 'blob'
    }).then(response => {
        image.getImage().src = URL.createObjectURL(response.data);
    }).catch(e => {
        image.getImage().src = null;
        console.error(e);
    });
};
function tileXYZToOpenlayersOptions(options) {
    let urls = options.url.match(/(\{s\})/) ? getUrls(options) : [template(options.url, options)];
    let sourceOpt = Object.assign({}, {
        urls: urls,
        attributions: options.attribution ? [options.attribution] : [],
        maxZoom: options.maxZoom ? options.maxZoom : 18,
        minZoom: options.minZoom ? options.minZoom : 0 // dosen't affect ol layer rendering UNSUPPORTED
    });
    if (options.security) {
        sourceOpt.tileLoadFunction = tileLoadFunction(options);
    }
    let source = new XYZ(sourceOpt);
    let olOpt = Object.assign({}, {
        msId: options.id,
        opacity: options.opacity !== undefined ? options.opacity : 1,
        visible: options.visibility !== false,
        zIndex: options.zIndex,
        source: source,
        minResolution: options.minResolution,
        maxResolution: options.maxResolution
    }, options.bounds ? {extent: lBoundsToOlExtent(options.bounds, options.srs ? options.srs : 'EPSG:3857')} : {} );
    return olOpt;
}

Layers.registerType('tileprovider', {
    create: (options) => {
        let [url, opt] = TileProvider.getLayerConfig(options.provider, options);
        opt.url = url;
        return new TileLayer(tileXYZToOpenlayersOptions(opt));
    },
    update: (layer, newOptions, oldOptions) => {
        if (oldOptions.minResolution !== newOptions.minResolution) {
            layer.setMinResolution(newOptions.minResolution === undefined ? 0 : newOptions.minResolution);
        }
        if (oldOptions.maxResolution !== newOptions.maxResolution) {
            layer.setMaxResolution(newOptions.maxResolution === undefined ? Infinity : newOptions.maxResolution);
        }
        if (!isEqual(oldOptions.security, newOptions.security)) {
            layer.getSource().setTileLoadFunction(tileLoadFunction(newOptions));
        }
    }
});

