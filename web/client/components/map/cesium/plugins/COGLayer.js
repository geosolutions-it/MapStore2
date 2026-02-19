/**
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';

import isEqual from 'lodash/isEqual';
import proj4 from 'proj4';

/*
    only TIFFImageryProvider v2.17 is compatible for cesium v1.134 used now in MS
*/
import TIFFImageryProvider from 'tiff-imagery-provider';
import { COG_LAYER_TYPE } from '../../../../utils/CatalogUtils';
import {isProjectionAvailable} from '../../../../utils/ProjectionUtils';

/*
  colorScale set of values used by TIFFImageryProvider see https://observablehq.com/@d3/color-schemes
*/
function buildRenderOptions(options) {
    const band = options?.sources[0]?.band || 1;
    const nodata = Number(options.sources?.[0]?.nodata);
    const domain = [Number(options.sources?.[0]?.min), Number(options.sources?.[0]?.max)];
    return {
        band,
        single: {
            colorScale: 'greys',
            nodata,
            domain
        }
    };
}

/*
  `projFunc` is experimental in tiff-imagery-provider
*/
const createLayer = (options) => {

    if (!options.visibility) {
        return null;
    }
    const url = options.url || options?.sources[0]?.url;

    return TIFFImageryProvider.fromUrl(url, {
        projFunc: (code) => {
            const epsgCode = `EPSG:${code}`;
            if (isProjectionAvailable(epsgCode)) {
                return {
                    project: proj4(`EPSG:4326`, epsgCode).forward,
                    unproject: proj4(`EPSG:4326`, epsgCode).inverse
                };
            }
            return null;
        },
        renderOptions: buildRenderOptions(options)
    });
};

Layers.registerType(COG_LAYER_TYPE, {
    create: createLayer,
    update: (layer, newOptions, oldOptions) => {
        if (!isEqual(newOptions.sources, oldOptions.sources)) {
            return createLayer(newOptions);
        }
        return null;
    }
});
