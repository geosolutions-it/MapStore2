/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { get as getProjection } from 'ol/proj';
import * as OL from '../../../utils/openlayers/Layers';
import Leaflet from '../../../utils/leaflet/Layers';
import CesiumLayers from '../../../utils/cesium/Layers';
import '../openlayers/plugins/TileProviderLayer';
import '../openlayers/plugins/TMSLayer';
import '../openlayers/plugins/ArcGISLayer';
import '../leaflet/plugins/TileProviderLayer';
import '../leaflet/plugins/TMSLayer';
import '../leaflet/plugins/ArcGISLayer';
import '../cesium/plugins/TileProviderLayer';

const tiled = { id: 'tiles', type: 'tileprovider', provider: 'custom', url: 'https://example.invalid/{z}/{x}/{y}.png', _v_: 1 };

describe('Layer version refresh adapters', () => {
    it('changes OpenLayers tile URLs without replacing the layer or losing URL parameters', () => {
        const options = { ...tiled, url: tiled.url + '?token=test' };
        const layer = OL.createLayer('tileprovider', options);
        OL.updateLayer('tileprovider', layer, { ...options, _v_: 2 }, options);
        expect(layer.getSource().getUrls()[0]).toContain('token=test&_v_=2');
        expect(layer.getSource().getUrls()[0]).toNotContain('_v_=1');
    });
    it('updates OpenLayers ArcGIS request URLs rather than just clearing its tile cache', () => {
        const options = { id: 'arcgis', url: 'https://example.invalid/MapServer', name: '0', _v_: 1 };
        const layer = OL.createLayer('arcgis', options);
        OL.updateLayer('arcgis', layer, { ...options, _v_: 2 }, options);
        const url = layer.getSource().getTileUrlFunction()([0, 0, 0], 1, getProjection('EPSG:3857'));
        expect(url).toContain('_v_=2');
    });
    it('changes TMS URLs in OpenLayers and Leaflet', () => {
        const options = { tileMapUrl: 'https://example.invalid/tms', extension: 'png', _v_: 1 };
        const ol = OL.createLayer('tms', options);
        OL.updateLayer('tms', ol, { ...options, _v_: 2 }, options);
        expect(ol.getSource().getUrls()[0]).toContain('_v_=2');
        const leaflet = Leaflet.createLayer('tms', options);
        Leaflet.updateLayer('tms', leaflet, { ...options, _v_: 2 }, options);
        expect(leaflet._url).toContain('_v_=2');
    });
    it('changes Leaflet tile URLs in place', () => {
        const layer = Leaflet.createLayer('tileprovider', tiled);
        Leaflet.updateLayer('tileprovider', layer, { ...tiled, _v_: 2 }, tiled);
        expect(layer._url).toContain('_v_=2');
    });
    it('supplies ArcGIS export request parameters in Leaflet', () => {
        const options = { url: 'https://example.invalid/MapServer', _v_: 1 };
        const layer = Leaflet.createLayer('arcgis', options);
        Leaflet.updateLayer('arcgis', layer, { ...options, _v_: 2 }, options);
        expect(layer.options.requestParams._v_).toBe(2);
    });
    it('changes Cesium tile resource URLs when a version changes', () => {
        const first = CesiumLayers.createLayer('tileprovider', tiled);
        const next = CesiumLayers.updateLayer('tileprovider', first, { ...tiled, _v_: 2 }, tiled);
        expect(next.url).toContain('_v_=2');
        expect(next).toNotBe(first);
    });
});
