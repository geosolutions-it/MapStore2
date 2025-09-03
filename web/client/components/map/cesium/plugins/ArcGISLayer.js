/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';
import { isImageServerUrl } from '../../../../utils/ArcGISUtils';
import { getProxiedUrl } from '../../../../utils/ConfigUtils';


// this override is needed to apply the selected format
// and to detect an ImageServer and to apply the correct exportImage path
function buildImageResource(imageryProvider, x, y, level, request) {
    const nativeRectangle = imageryProvider._tilingScheme.tileXYToNativeRectangle(
        x,
        y,
        level
    );
    const bbox = `${nativeRectangle.west},${nativeRectangle.south},${nativeRectangle.east},${nativeRectangle.north}`;

    const query = {
        bbox: bbox,
        size: `${imageryProvider._tileWidth},${imageryProvider._tileHeight}`,
        format: imageryProvider._format || 'png32',
        transparent: true,
        f: 'image'
    };

    if (
        imageryProvider._tilingScheme.projection instanceof Cesium.GeographicProjection
    ) {
        query.bboxSR = 4326;
        query.imageSR = 4326;
    } else {
        query.bboxSR = 3857;
        query.imageSR = 3857;
    }
    if (imageryProvider.layers) {
        query.layers = `show:${imageryProvider.layers}`;
    }
    const resource = imageryProvider._resource.getDerivedResource({
        url: isImageServerUrl(imageryProvider._resource.url) ? 'exportImage' : 'export',
        request: request,
        queryParameters: query
    });
    return resource;
}

class ArcGisMapAndImageServerImageryProvider extends Cesium.ArcGisMapServerImageryProvider {
    constructor(options) {
        super(options);
        this._format = options.format;
        this._resource = new Cesium.Resource({
            url: options.url
        });
        this._resource.appendForwardSlash();
    }
    requestImage = function(
        x,
        y,
        level,
        request
    ) {
        return Cesium.ImageryProvider.loadImage(
            this,
            buildImageResource(this, x, y, level, request)
        );
    }
}

const create = (options) => {
    return new ArcGisMapAndImageServerImageryProvider({
        url: options?.forceProxy ? getProxiedUrl() + encodeURIComponent(options.url) : options.url,
        ...(options.name !== undefined && { layers: `${options.name}` }),
        format: options.format,
        // we need to disable this when using layers ids
        // the usage of tiles will add an additional request to metadata
        // and render the map tiles representing all the layers available in the MapServer
        usePreCachedTilesIfAvailable: false
    });
};

const update = (layer, newOptions, oldOptions) => {
    if (newOptions.forceProxy !== oldOptions.forceProxy) {
        return create(newOptions);
    }
    return null;
};

Layers.registerType('arcgis', {
    create,
    update: update
});
