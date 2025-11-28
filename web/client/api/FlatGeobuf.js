/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';
import isEmpty from 'lodash/isEmpty';
import { extend, createEmpty } from 'ol/extent';
import { GeoJSON } from 'ol/format';

/**
 * constants of FlatGeobuf format
 */
export const FGB = 'fgb'; // extension file and format short name
export const FGB_LAYER_TYPE = 'flatgeobuf';
export const FGB_VERSION = '3.0.1'; // supported format version

export const getFlatGeobufGeojson = () => import('flatgeobuf/lib/mjs/geojson').then(mod => mod);
export const getFlatGeobufOl = () => import('flatgeobuf/lib/mjs/ol').then(mod => mod);

function getFormat(url) {
    const parts = url.split(/\./g);
    const format = parts[parts.length - 1];
    return format;
}

function getTitleFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
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
    return getFlatGeobufGeojson().then(async flatgeobuf => { // load lib dynamically
        return axios.get(url, {
            adapter: config => {
                return fetch(config.url); // use fetch adapter to get a stream
            }
        }).then(async({body}) => {

            const features = [];
            let metadata = {};
            let rect; // if undefined read all features

            // ///// TODO  replace .deserialize() with new method .readMetadata()
            // when available in flatgeobuf lib > v4.4.5
            // just merged here: https://github.com/flatgeobuf/flatgeobuf/commit/15f137cdf30495dd84afda6159e537df39d5309c

            /**
             * flatgeobuf.deserialize() return a AsyncGenerator
             */
            for await (let feature of flatgeobuf.deserialize(
                body,
                rect,
                function HeaderMetaFn(meta) {
                    // sample of metadata structure /web/client/test-resources/flatgeobuf/UScounties_subset.metadata.json
                    const crs = `${meta?.crs?.org}:${meta?.crs?.code}`;
                    const title = !isEmpty(meta?.title) ? meta.title : getTitleFromUrl(url);
                    metadata = {
                        ...metadata,
                        title,
                        crs
                    };
                })
            ) {
                features.push(new GeoJSON().readFeature(feature));
            }

            // TODO simplify using new method readMetadata(url) when available in flatgeobuf lib > v4.4.5
            // that return envelope

            const totExtent = features.reduce((extent, feature) => {
                return extend(extent, feature.getGeometry().getExtent());
            }, createEmpty());

            const bbox = {
                bounds: {
                    minx: totExtent[0],
                    miny: totExtent[1],
                    maxx: totExtent[2],
                    maxy: totExtent[3]
                },
                crs: metadata.crs || 'EPSG:4326'
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
