/**
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import { getRequestConfigurationByUrl } from '../../../../utils/SecurityUtils';
import { updateUrlParams } from '../../../../utils/URLUtils';

import isEqual from 'lodash/isEqual';
import proj4 from 'proj4';

/*
    only TIFFImageryProvider v2.17 is compatible for cesium v1.134 used now in MS
*/
import TIFFImageryProvider from 'tiff-imagery-provider';
import { COG_LAYER_TYPE } from '../../../../utils/CatalogUtils';
import { isProjectionAvailable } from '../../../../utils/ProjectionUtils';

/**
 * generate render options for tiff-imagery-provider based on layer options, support single band and RGB COG Geotiff
 * @param {*} options a layer options object, with sources and style properties from catalog
 * @return {*} renderOptions object for tiff-imagery-provider instance
 */
export function buildRenderOptions(options) {

    const nodata = Number(options.sources?.[0]?.nodata);
    const min = Number(options.sources?.[0]?.min);
    const max = Number(options.sources?.[0]?.max);
    const domainOption = [min, max].every(v => !isNaN(v)) && {domain: [min, max]};
    const nodataOption = !isNaN(nodata) && {nodata};

    const bands = (options?.style?.body?.color || []);
    const isRGB = (options?.sourceMetadata?.samples || 1) >= 3;

    if (isRGB) {

        if (!bands?.length) {
            return {
                convertToRGB: true
            };
        }

        const minMaxOption = {
            ...(min !== undefined  && { min }),
            ...(max !== undefined  && { max })
        };

        const [, r, g, b] = bands;

        return {
            multi: {
                r: {
                    band: r[1],
                    ...minMaxOption
                },
                g: {
                    band: g[1],
                    ...minMaxOption
                },
                b: {
                    band: b[1],
                    ...minMaxOption
                }
            }
        };
    }

    const band = options?.sources[0]?.band || 1;
    return {
        single: {
            band,
            /*
                colorScale set of values used by TIFFImageryProvider see https://observablehq.com/@d3/color-schemes
            */
            colorScale: 'greys',
            ...nodataOption,
            ...domainOption
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
    const {headers, params} = getRequestConfigurationByUrl(url, options?.security?.sourceId);
    const secureUrl = updateUrlParams(url, params);
    const renderOptions = buildRenderOptions(options);

    // https://github.com/hongfaqiu/TIFFImageryProvider?tab=readme-ov-file#api
    return TIFFImageryProvider.fromUrl(secureUrl, {
        requestOptions: {
            headers
        },
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
        renderOptions,
        enablePickFeatures: true // required for identify pickFeatures method
    });
};

Layers.registerType(COG_LAYER_TYPE, {
    create: createLayer,
    update: (layer, newOptions, oldOptions) => {
        if (!isEqual(newOptions.sources, oldOptions.sources) ||
            !isEqual(newOptions.style, oldOptions.style) ||
            !isEqual(oldOptions.security, newOptions.security) ||
            !isEqual(oldOptions.requestRuleRefreshHash, newOptions.requestRuleRefreshHash)) {
            // TODO check if stileeditor change newOptions.sources and newOptions.style
            return createLayer(newOptions);
        }
        return null;
    }
});
