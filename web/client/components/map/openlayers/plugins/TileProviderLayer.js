/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import assign from 'object-assign';
import Layers from '../../../../utils/openlayers/Layers';
import TileProvider from '../../../../utils/TileConfigProvider';
import CoordinatesUtils from '../../../../utils/CoordinatesUtils';
import { getUrls, template } from '../../../../utils/TileProviderUtils';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';

function lBoundsToOlExtent(bounds, destPrj) {
    var [ [ miny, minx], [ maxy, maxx ] ] = bounds;
    return CoordinatesUtils.reprojectBbox([minx, miny, maxx, maxy], 'EPSG:4326', CoordinatesUtils.normalizeSRS(destPrj));
}
function tileXYZToOpenlayersOptions(options) {
    let urls = options.url.match(/(\{s\})/) ? getUrls(options) : [template(options.url, options)];
    let sourceOpt = assign({}, {
        urls: urls,
        attributions: options.attribution ? [options.attribution] : [],
        maxZoom: options.maxZoom ? options.maxZoom : 18,
        minZoom: options.minZoom ? options.minZoom : 0 // dosen't affect ol layer rendering UNSUPPORTED
    });
    let source = new XYZ(sourceOpt);
    let olOpt = assign({}, {
        msId: options.id,
        opacity: options.opacity !== undefined ? options.opacity : 1,
        visible: options.visibility !== false,
        zIndex: options.zIndex,
        source: source
    }, options.bounds ? {extent: lBoundsToOlExtent(options.bounds, options.srs ? options.srs : 'EPSG:3857')} : {} );
    return olOpt;
}

Layers.registerType('tileprovider', {
    create: (options) => {
        let [url, opt] = TileProvider.getLayerConfig(options.provider, options);
        opt.url = url;
        return new TileLayer(tileXYZToOpenlayersOptions(opt));
    }
});

