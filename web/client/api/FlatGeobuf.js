/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';
import isEmpty from 'lodash/isEmpty';

/**
 * constants of FlatGeobuf format
 */
export const FGB = 'fgb'; // extension file and format short name
export const FGB_LAYER_TYPE = 'flatgeobuf';
export const FGB_VERSION = '3.0.1'; // supported format version

export const getFlatGeobufGeojson = () => import('flatgeobuf/lib/mjs/geojson').then(mod => mod);
export const getFlatGeobufGeneric = () => import('flatgeobuf/lib/mjs/generic').then(mod => mod);  // implement readMetadata()
export const getFlatGeobufOl = () => import('flatgeobuf/lib/mjs/ol').then(mod => mod);

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
    const version = FGB_VERSION; // flatgeobuf-ol not read file format version, it might be possible by reading the header
    // https://flatgeobuf.org/doc/format-changelog.html
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
    return getFlatGeobufGeneric().then(async flatgeobuf => { // load lib dynamically
        return axios.get(url, {
            adapter: async config => {
                // fetch(config.url); // use fetch adapter to get a stream
                return await flatgeobuf.readMetadata(config.url); // readMetadata accept also request headers as param
            }
        }).then(async(metadata) => {

            // const metadata = await flatgeobuf.readMetadata(url);
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
                ...metadata,
                ...(bbox && { bbox })
            };
        });
    });
};
