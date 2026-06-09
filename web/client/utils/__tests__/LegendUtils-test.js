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
    LEGEND_FORMAT,
    updateLayerWithLegendFilters
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
                LEGEND_OPTIONS: 'fontSize:10'
            });
        });
        it('should return correct WMS legend config for vendor server type with background group', () => {
            const layer = {
                name: 'testLayer',
                type: 'wms',
                url: 'http://example.com',
                serverType: 'VENDOR',
                group: 'background',
                enableInteractiveLegend: true
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
        it('should add bbox when legend viewport filter is enabled', () => {
            const layer = {
                name: 'testLayer',
                type: 'wms',
                url: 'http://example.com',
                serverType: 'VENDOR',
                enableInteractiveLegend: true,
                enableLegendFilterByViewport: true
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
                LEGEND_OPTIONS: 'hideEmptyRules:true;fontSize:10',
                SRCWIDTH: 800,
                SRCHEIGHT: 600,
                SRS: 'EPSG:4326',
                CRS: 'EPSG:4326',
                BBOX: '-30,20,50,60'
            });
        });
        it('should skip content dependent param when dynamic legend is not enabled', () => {
            const layer = {
                name: 'testLayer',
                type: 'wms',
                url: 'http://example.com',
                serverType: 'VENDOR',
                enableDynamicLegend: false
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
                LEGEND_OPTIONS: 'fontSize:10'
            });
        });
        it('should skip bbox when interactive legend is not enabled', () => {
            const layer = {
                name: 'testLayer',
                type: 'wms',
                url: 'http://example.com',
                serverType: 'VENDOR',
                enableInteractiveLegend: false
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
                LEGEND_OPTIONS: 'fontSize:10'
            });
        });
        it('should add content dependent params when dynamic legend is enabled', () => {
            const layer = {
                name: 'testLayer',
                type: 'wms',
                url: 'http://example.com',
                serverType: 'VENDOR',
                enableDynamicLegend: true
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
                LEGEND_OPTIONS: 'hideEmptyRules:true;fontSize:10',
                SRCWIDTH: 800,
                SRCHEIGHT: 600,
                SRS: 'EPSG:4326',
                CRS: 'EPSG:4326',
                BBOX: '-30,20,50,60'
            });
        });
    });
    describe('updateLayerWithLegendFilters', () => {
        const filter = {
            "featureTypeName": "layer1",
            "groupFields": [{"id": 1, "logic": "OR", "index": 0}],
            "filterFields": [],
            "spatialField": {
                "method": "BBOX",
                "attribute": "the_geom",
                "operation": "INTERSECTS",
                "geometry": {
                    "id": "2",
                    "type": "Polygon",
                    "extent": [-12039795.482942028, 4384116.951814341, -9045909.959068244, 6702910.641873448],
                    "center": [-10542852.721005136, 5543513.796843895],
                    "coordinates": [[[-12039795.482942028, 6702910.641873448], [-12039795.482942028, 4384116.951814341], [-9045909.959068244, 4384116.951814341], [-9045909.959068244, 6702910.641873448], [-12039795.482942028, 6702910.641873448]]],
                    "style": {},
                    "projection": "EPSG:3857"
                }
            },
            "pagination": null,
            "filterType": "OGC",
            "ogcVersion": "1.1.0",
            "sortOptions": null,
            "crossLayerFilter": null,
            "hits": false,
            "filters": []
        };
        const quickFilters = {
            "STATE_NAME": {"rawValue": "mi", "value": "mi", "operator": "ilike", "type": "string", "attribute": "STATE_NAME"}
        };
        it('should return layers with updated CQL_FILTER when mapSync is true and filter matches', () => {
            const layers = [
                { name: 'layer1', params: {} },
                { name: 'layer2', params: {} }
            ];
            const dependencies = {
                layer: { name: 'layer1' },
                filter,
                mapSync: true,
                quickFilters: {},
                options: {}
            };

            const result = updateLayerWithLegendFilters(layers, dependencies);

            expect(result).toBeTruthy();
            expect(result.length).toBe(2);
            const layer = {"name": "layer1", "params": {"CQL_FILTER": "(INTERSECTS(\"the_geom\",SRID=3857;Polygon((-12039795.482942028 6702910.641873448, -12039795.482942028 4384116.951814341, -9045909.959068244 4384116.951814341, -9045909.959068244 6702910.641873448, -12039795.482942028 6702910.641873448))))"}};
            expect(result[0]).toEqual(layer);
            expect(result[1].params).toEqual({});
        });

        it('should return layers with undefined CQL_FILTER when mapSync is false', () => {
            const layers = [
                { name: 'layer1', params: { CQL_FILTER: 'some_filter' } },
                { name: 'layer2', params: { CQL_FILTER: 'some_filter' } }
            ];
            const dependencies = {
                layer: { name: 'layer1' },
                filter,
                mapSync: false,
                quickFilters,
                options: {}
            };

            const result = updateLayerWithLegendFilters(layers, dependencies);
            expect(result).toBeTruthy();
            expect(result).toEqual([
                { name: 'layer1', params: {CQL_FILTER: undefined} },
                { name: 'layer2', params: {CQL_FILTER: undefined} }
            ]);
        });

        it('should return layers with undefined CQL_FILTER when no matching layer is found', () => {
            const layers = [
                { name: 'layer1', params: { CQL_FILTER: 'some_filter' } },
                { name: 'layer2', params: { CQL_FILTER: 'some_filter' } }
            ];
            const dependencies = {
                layer: { name: 'layer3' },
                filter: { featureTypeName: 'layer3' },
                mapSync: true,
                quickFilters: {},
                options: {}
            };

            const result = updateLayerWithLegendFilters(layers, dependencies);
            expect(result).toBeTruthy();
            expect(result).toEqual([
                { name: 'layer1', params: {CQL_FILTER: undefined} },
                { name: 'layer2', params: {CQL_FILTER: undefined} }
            ]);
        });

        it('should return layers with updated CQL_FILTER when quickFilters are provided', () => {
            const layers = [
                { name: 'layer1', params: {} },
                { name: 'layer2', params: {} }
            ];
            const dependencies = {
                layer: { name: 'layer1' },
                filter,
                mapSync: true,
                quickFilters,
                options: {propertyName: ['STATE_NAME']}
            };

            const result = updateLayerWithLegendFilters(layers, dependencies);
            expect(result).toBeTruthy();
            expect(result.length).toBe(2);
            const CQL_FILTER = "((strToLowerCase(\"STATE_NAME\") LIKE '%mi%')) AND (INTERSECTS(\"the_geom\",SRID=3857;Polygon((-12039795.482942028 6702910.641873448, -12039795.482942028 4384116.951814341, -9045909.959068244 4384116.951814341, -9045909.959068244 6702910.641873448, -12039795.482942028 6702910.641873448))))";
            expect(result[0].name).toBe("layer1");
            expect(result[0].params.CQL_FILTER).toBe(CQL_FILTER);
        });

        it('should clear CQL_FILTER when quickFilters are missing', () => {
            const layers = [
                { name: 'layer1', params: { CQL_FILTER: 'some_filter' } },
                { name: 'layer2', params: { CQL_FILTER: 'some_filter' } }
            ];
            const dependencies = {
                layer: { name: 'layer1' },
                filter,
                mapSync: true,
                options: {}
            };

            const result = updateLayerWithLegendFilters(layers, dependencies);
            expect(result).toBeTruthy();
            expect(result).toEqual([
                { name: 'layer1', params: {CQL_FILTER: undefined} },
                { name: 'layer2', params: {CQL_FILTER: undefined} }
            ]);
        });

        it('should skip applying filters when featureTypeName does not match target layer', () => {
            const layers = [
                { name: 'layer1', params: { CQL_FILTER: 'some_filter' } },
                { name: 'layer2', params: { CQL_FILTER: 'some_filter' } }
            ];
            const dependencies = {
                layer: { name: 'layer1' },
                filter: { ...filter, featureTypeName: 'anotherLayer' },
                mapSync: true,
                quickFilters: {},
                options: {}
            };

            const result = updateLayerWithLegendFilters(layers, dependencies);
            expect(result).toBeTruthy();
            expect(result).toEqual([
                { name: 'layer1', params: {CQL_FILTER: undefined} },
                { name: 'layer2', params: {CQL_FILTER: undefined} }
            ]);
        });

        it('should clear filters when layer dependency is missing', () => {
            const layers = [
                { name: 'layer1', params: { CQL_FILTER: 'some_filter' } },
                { name: 'layer2', params: { CQL_FILTER: 'some_filter' } }
            ];
            const dependencies = {
                filter,
                mapSync: true,
                quickFilters: {},
                options: {}
            };

            const result = updateLayerWithLegendFilters(layers, dependencies);
            expect(result).toBeTruthy();
            expect(result).toEqual([
                { name: 'layer1', params: {CQL_FILTER: undefined} },
                { name: 'layer2', params: {CQL_FILTER: undefined} }
            ]);
        });
    });
});
