/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { setSupportedLocales, getSupportedLocales } from '../LocaleUtils';
import { resourceToLayerConfig, getDimensions } from '../GeoNodeUtils';

describe('GeoNodeUtils', () => {
    describe('resourceToLayerConfig', () => {

        let originalLocales;
        beforeEach(() => {
            originalLocales = getSupportedLocales();
        });
        afterEach(() => {
            setSupportedLocales(originalLocales);
        });

        it('should keep the wms params from the url if available', () => {
            const newLayer = resourceToLayerConfig({
                alternate: 'geonode:layer_name',
                links: [{
                    extension: 'html',
                    link_type: 'OGC:WMS',
                    name: 'OGC WMS Service',
                    mime: 'text/html',
                    url: 'http://localhost:8080/geoserver/wms?map=name&map_resolution=91'
                }],
                title: 'Layer title',
                perms: [],
                pk: 1
            });
            expect(newLayer.params).toEqual({ map: 'name', map_resolution: '91' });
        });

        it('should apply layer settings from dataset data', () => {
            const newLayer = resourceToLayerConfig({
                alternate: 'geonode:layer_name',
                links: [{
                    extension: 'html',
                    link_type: 'OGC:WMS',
                    name: 'OGC WMS Service',
                    mime: 'text/html',
                    url: 'http://localhost:8080/geoserver/wms?map=name&map_resolution=91'
                }],
                title: 'Layer title',
                perms: [],
                pk: 1,
                data: {opacity: 0.8}
            });
            expect(newLayer.opacity).toBe(0.8);
        });

        it('should parse arcgis dataset', () => {
            const newLayer = resourceToLayerConfig({
                alternate: 'remoteWorkspace:1',
                title: 'Layer title',
                perms: [],
                links: [{
                    extension: 'html',
                    link_type: 'image',
                    mime: 'text/html',
                    name: 'ArcGIS REST ImageServer',
                    url: 'http://localhost:8080/MapServer'
                }],
                pk: 1,
                ptype: 'gxp_arcrestsource'
            });
            expect(newLayer.type).toBe('arcgis');
            expect(newLayer.name).toBe('1');
            expect(newLayer.url).toBe('http://localhost:8080/MapServer');
        });

        it('should return localized title object when supported locales have translations', () => {
            setSupportedLocales({
                'en': { code: 'en-US', description: 'English' },
                'it': { code: 'it-IT', description: 'Italiano' },
                'fr': { code: 'fr-FR', description: 'Français' }
            });
            const newLayer = resourceToLayerConfig({
                alternate: 'geonode:layer_numtilangue',
                title: 'Default title',
                title_en: 'Layer title',
                title_it: 'Titolo del layer',
                title_fr: 'Titre de la couche',
                perms: [],
                pk: 1
            });
            expect(newLayer.title).toEqual({
                'en-US': 'Layer title',
                'it-IT': 'Titolo del layer',
                'fr-FR': 'Titre de la couche',
                'default': 'Default title'
            });
        });

        it('should return plain title string when no locale translations exist', () => {
            setSupportedLocales({});
            const newLayer = resourceToLayerConfig({
                alternate: 'geonode:layer_name',
                title: 'Plain title',
                links: [{ link_type: 'OGC:WMS', url: '/geoserver/wms' }],
                perms: [],
                pk: 1
            });
            expect(newLayer.title).toBe('Plain title');
        });

        describe('alternate in extendedParams', () => {
            it('WMS layer includes alternate in extendedParams', () => {
                const newLayer = resourceToLayerConfig({
                    alternate: 'geonode:layer_name',
                    links: [{
                        extension: 'html',
                        link_type: 'OGC:WMS',
                        name: 'OGC WMS Service',
                        mime: 'text/html',
                        url: '/geoserver/wms'
                    }],
                    title: 'Layer title',
                    perms: [],
                    pk: 1
                });
                expect(newLayer.extendedParams).toEqual({ pk: 1, alternate: 'geonode:layer_name' });
            });

            it('3dtiles layer includes alternate in extendedParams', () => {
                const newLayer = resourceToLayerConfig({
                    alternate: 'geonode:tileset',
                    subtype: '3dtiles',
                    links: [{ extension: '3dtiles', url: '/tileset.json' }],
                    title: 'Tileset',
                    perms: [],
                    pk: 2
                });
                expect(newLayer.extendedParams).toEqual({ pk: 2, alternate: 'geonode:tileset' });
            });

            it('cog layer includes alternate in extendedParams', () => {
                const newLayer = resourceToLayerConfig({
                    alternate: 'geonode:cog_layer',
                    subtype: 'cog',
                    links: [{ extension: 'cog', url: '/raster.tif' }],
                    title: 'COG',
                    perms: [],
                    pk: 3
                });
                expect(newLayer.extendedParams).toEqual({ pk: 3, alternate: 'geonode:cog_layer' });
            });

            it('flatgeobuf layer includes alternate in extendedParams', () => {
                const newLayer = resourceToLayerConfig({
                    alternate: 'geonode:fgb_layer',
                    subtype: 'flatgeobuf',
                    links: [{ extension: 'flatgeobuf', url: '/data.fgb' }],
                    title: 'FGB',
                    perms: [],
                    pk: 4
                });
                expect(newLayer.extendedParams).toEqual({ pk: 4, alternate: 'geonode:fgb_layer' });
            });

            it('arcgis layer includes alternate in extendedParams', () => {
                const newLayer = resourceToLayerConfig({
                    alternate: 'remoteWorkspace:1',
                    title: 'Layer title',
                    perms: [],
                    links: [{
                        extension: 'html',
                        link_type: 'image',
                        mime: 'text/html',
                        name: 'ArcGIS REST ImageServer',
                        url: '/MapServer'
                    }],
                    pk: 5,
                    ptype: 'gxp_arcrestsource'
                });
                expect(newLayer.extendedParams).toEqual({ pk: 5, alternate: 'remoteWorkspace:1' });
            });
        });
    });

    describe('getDimensions', () => {
        it('should return empty array if no links and has_time is false', () => {
            const result = getDimensions();
            expect(result).toEqual([]);
        });

        it('should return dimensions with time if has_time is true and WMTS link is present', () => {
            const links = [{ link_type: 'OGC:WMTS', url: 'http://example.com/wmts' }];
            const result = getDimensions({ links, has_time: true });
            expect(result).toEqual([{
                name: 'time',
                source: {
                    type: 'multidim-extension',
                    url: 'http://example.com/wmts'
                }
            }]);
        });

        it('should return dimensions with time if has_time is true and only WMS link is present', () => {
            const links = [{ link_type: 'OGC:WMS', url: 'http://example.com/geoserver/wms' }];
            const result = getDimensions({ links, has_time: true });
            expect(result).toEqual([{
                name: 'time',
                source: {
                    type: 'multidim-extension',
                    url: 'http://example.com/geoserver/gwc/service/wmts'
                }
            }]);
        });

        it('should return empty array if has_time is false', () => {
            const links = [{ link_type: 'OGC:WMTS', url: 'http://example.com/wmts' }];
            const result = getDimensions({ links, has_time: false });
            expect(result).toEqual([]);
        });

        it('should return default url if no matching link types are found', () => {
            const links = [{ link_type: 'OGC:OTHER', url: 'http://example.com/other' }];
            const result = getDimensions({ links, has_time: true });
            expect(result).toEqual([{
                name: 'time',
                source: {
                    type: 'multidim-extension',
                    url: '/geoserver/gwc/service/wmts'
                }
            }]);
        });
    });
});
