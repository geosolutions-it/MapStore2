/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import {
    getWMSLegendConfig,
    getLayerFilterByLegendFormat,
    INTERACTIVE_LEGEND_ID,
    LEGEND_FORMAT
} from '../LegendUtils';
import { ServerTypes } from '../LayersUtils';

describe('LegendUtils', () => {
    describe('getLayerFilterByLegendFormat', () => {
        it('should return layer filter without interactive legend filter for JSON format', () => {
            const layer = {
                type: 'wms',
                url: 'http://example.com',
                layerFilter: {
                    filters: [{ id: INTERACTIVE_LEGEND_ID }, { id: 'otherFilter' }]
                }
            };
            const format = LEGEND_FORMAT.JSON;
            const result = getLayerFilterByLegendFormat(layer, format);
            expect(result.filters).toEqual([{ id: 'otherFilter' }]);
        });

        it('should return original layer filter for non-JSON format', () => {
            const layer = {
                type: 'wms',
                url: 'http://example.com',
                layerFilter: {
                    filters: [{ id: INTERACTIVE_LEGEND_ID }, { id: 'otherFilter' }]
                }
            };
            const format = LEGEND_FORMAT.IMAGE;
            const result = getLayerFilterByLegendFormat(layer, format);
            expect(result.filters).toEqual([{ id: INTERACTIVE_LEGEND_ID }, { id: 'otherFilter' }]);
        });

        it('should return empty filter if layerFilter is undefined', () => {
            const layer = {
                type: 'wms',
                url: 'http://example.com'
            };
            const format = LEGEND_FORMAT.JSON;
            const result = getLayerFilterByLegendFormat(layer, format);
            expect(result).toBe(undefined);
        });
    });

    describe('getWMSLegendConfig', () => {
        it('should return correct WMS legend config for non-vendor server type', () => {
            const layer = {
                name: 'testLayer',
                type: 'wms',
                url: 'http://example.com',
                serverType: ServerTypes.NO_VENDOR,
                params: { customParam: 'value' }
            };
            const config = getWMSLegendConfig({
                format: LEGEND_FORMAT.IMAGE,
                legendHeight: 20,
                legendWidth: 20,
                layer,
                mapSize: { width: 800, height: 600 },
                projection: 'EPSG:4326',
                mapBbox: { bounds: { minx: -30, miny: 20, maxx: 50, maxy: 60 } },
                legendOptions: 'fontSize:10'
            });
            expect(config).toEqual({
                service: 'WMS',
                request: 'GetLegendGraphic',
                format: LEGEND_FORMAT.IMAGE,
                height: 20,
                width: 20,
                layer: 'testLayer',
                style: null,
                version: '1.3.0',
                SLD_VERSION: '1.1.0',
                LEGEND_OPTIONS: 'fontSize:10',
                customParam: 'value'
            });
        });

        it('should return correct WMS legend config for vendor server type', () => {
            const layer = {
                name: 'testLayer',
                type: 'wms',
                url: 'http://example.com',
                serverType: 'VENDOR',
                group: 'foreground'
            };
            const config = getWMSLegendConfig({
                format: LEGEND_FORMAT.IMAGE,
                legendHeight: 20,
                legendWidth: 20,
                layer,
                mapSize: { width: 800, height: 600 },
                projection: 'EPSG:4326',
                mapBbox: { bounds: {minx: -30, miny: 20, maxx: 50, maxy: 60}, crs: "EPSG:4326" },
                legendOptions: 'fontSize:10'
            });
            expect(config).toEqual({
                service: 'WMS',
                request: 'GetLegendGraphic',
                format: LEGEND_FORMAT.IMAGE,
                height: 20,
                width: 20,
                layer: 'testLayer',
                style: null,
                version: '1.3.0',
                SLD_VERSION: '1.1.0',
                LEGEND_OPTIONS: 'hideEmptyRules:true;fontSize:10',
                SRCWIDTH: 800,
                SRCHEIGHT: 600,
                SRS: 'EPSG:4326',
                CRS: 'EPSG:4326',
                BBOX: '-30,20,50,60'
            });
        });
        it('should return correct WMS legend config for vendor server type with background group', () => {
            const layer = {
                name: 'testLayer',
                type: 'wms',
                url: 'http://example.com',
                serverType: 'VENDOR',
                group: 'background'
            };
            const config = getWMSLegendConfig({
                format: LEGEND_FORMAT.IMAGE,
                legendHeight: 20,
                legendWidth: 20,
                layer,
                mapSize: { width: 800, height: 600 },
                projection: 'EPSG:4326',
                mapBbox: { bounds: { minx: -30, miny: 20, maxx: 50, maxy: 60 }, crs: "EPSG:4326" },
                legendOptions: 'fontSize:10'
            });
            expect(config).toEqual({
                service: 'WMS',
                request: 'GetLegendGraphic',
                format: LEGEND_FORMAT.IMAGE,
                height: 20,
                width: 20,
                layer: 'testLayer',
                style: null,
                version: '1.3.0',
                SLD_VERSION: '1.1.0',
                LEGEND_OPTIONS: 'hideEmptyRules:false;fontSize:10',
                SRCWIDTH: 800,
                SRCHEIGHT: 600,
                SRS: 'EPSG:4326',
                CRS: 'EPSG:4326',
                BBOX: '-30,20,50,60'
            });
        });
    });
});
