/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';
import isEmpty from 'lodash/isEmpty';
import { updateUrlParams } from '../utils/URLUtils';
import {
    flatGeobufExtractGeometryType,
    getFlatGeobufGeometryTypeFromOptions
} from '../utils/FlatGeobufLayerUtils';

export const FGB = 'fgb';
export const FGB_LAYER_TYPE = 'flatgeobuf';
export const FGB_VERSION = '3.0.1';

export const getFlatGeobufGeojson = () => import('flatgeobuf/lib/mjs/geojson').then(mod => mod);
export const getFlatGeobufGeneric = () => import('flatgeobuf/lib/mjs/generic').then(mod => mod);

function getFormat(url) {
    const parts = url.split(/\./g);
    const format = parts[parts.length - 1];
    return format;
}

function getTitleFromUrl(url) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const nameNoExt = filename.split('.').slice(0, -1).join('.');
    return nameNoExt || filename;
}

function extractCapabilities({url}) {
    const version = FGB_VERSION;
    const format = getFormat(url || '') || FGB;
    return {
        version,
        format
    };
}

//
// copy and paste in catalog for testing: https://flatgeobuf.org/test/data/countries.fgb
//
export const getCapabilities = (url) => {
    return getFlatGeobufGeneric().then(flatgeobuf => {
        return axios.get(url, {
            adapter: config => {
                const secureUrl = updateUrlParams(config.url, config.params);
                return flatgeobuf.readMetadata(secureUrl, true, config.headers);
            }
        }).then((metadata) => {

            metadata.title = !isEmpty(metadata?.title) ? metadata.title : getTitleFromUrl(url);

            const bbox = {
                bounds: {
                    minx: metadata.envelope[0],
                    miny: metadata.envelope[1],
                    maxx: metadata.envelope[2],
                    maxy: metadata.envelope[3]
                },
                crs: metadata.crs ? `${metadata.crs.org}:${metadata.crs.code}` : 'EPSG:4326'
            };

            const capabilities = extractCapabilities({flatgeobuf, url});

            return {
                ...capabilities,
                title: metadata.title,
                metadata,
                ...(bbox && { bbox })
            };
        });
    });
};

/**
 * Build a streaming-load helper that resolves the layer's geometry type
 * from (in priority order):
 *   1. layer config (options.geometryType / options.metadata.geometryType)
 *   2. FGB binary header (handleHeader, called once when the load starts)
 *   3. first sniffed feature (sniffFromFeature, called per-feature until reported)
 *
 * onChange is called at most once with the resolved type name, and only
 * when neither the config nor the caller's current value already matches.
 * Pass getCurrent so the resolver can no-op when the caller already has
 * the same inferred type stored, which avoids a redundant style reapply.
 *
 * @param {object} options layer options
 * @param {(typeName: string) => void} onChange called when a new type is resolved
 * @param {() => string|undefined} [getCurrent] reads the caller's currently-applied inferred type
 */
export const createFlatGeobufGeometryTypeResolver = (options, onChange, getCurrent = () => undefined) => {
    const fromConfig = getFlatGeobufGeometryTypeFromOptions(options);
    let reported = false;
    const report = (typeName) => {
        if (reported || !typeName) {
            return;
        }
        reported = true;
        if (fromConfig) {
            return;
        }
        if (getCurrent() === typeName) {
            return;
        }
        onChange(typeName);
    };
    return {
        // pass to flatgeobuf.deserialize as headerMetaFn
        handleHeader: (headerMeta) => {
            const fromHeader = flatGeobufExtractGeometryType(headerMeta);
            if (fromHeader && fromHeader !== 'Unknown') {
                report(fromHeader);
            }
        },
        // call from the for-await loop with the per-feature geometry type name
        sniffFromFeature: (typeName) => report(typeName),
        get reported() { return reported; }
    };
};

/**
 * Read the first feature from an FGB stream and return its GeoJSON
 * geometry.type. Used as a fallback when the FGB binary header declares
 * Unknown (0); heterogeneous datasets need an actual feature to know
 * what the layer should be styled as.
 * @param {string} url FGB URL (already resolved with auth params)
 * @param {object} [headers] HTTP headers
 * @returns {Promise<string|undefined>}
 */
// Match-all rect used when streaming to read just the first feature.
// flatgeobuf's streamSearch destructures rect.{minX,minY,maxX,maxY}
// directly and crashes on undefined; using ±Infinity inverts every
// comparison in the rtree filter so every node passes.
const FGB_MATCH_ALL_RECT = {
    minX: -Infinity,
    minY: -Infinity,
    maxX: Infinity,
    maxY: Infinity
};

export const sniffFlatGeobufFirstGeometryType = (url, headers) => {
    return getFlatGeobufGeojson().then((flatgeobuf) => {
        const iterator = flatgeobuf.deserialize(url, FGB_MATCH_ALL_RECT, undefined, false, headers);
        // best-effort cancel: stops the underlying fetch when the FGB
        // library honors generator return() (3.x streamSearch does).
        // Wrap so we can preserve / drop the resolved type through cleanup.
        const cleanup = (passthrough) => Promise.resolve(iterator.return?.()).then(() => passthrough);
        return iterator.next()
            .then(({ value: feature }) => cleanup(feature?.geometry?.type))
            .catch(() => cleanup(undefined));
    });
};
