/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import ConfigUtils from '../ConfigUtils';
import { groupWMSLayers, estimateWMSRequestURLLength, mergeable, defaultGroupCondition } from '../WMSCoalesceUtils';

describe('WMSCoalesceUtils', () => {
    describe('mergeable conditions', () => {
        const baseWms = {
            type: 'wms',
            url: 'http://localhost:8080/geoserver/wms',
            format: 'image/png',
            singleTile: false,
            opacity: 1
        };
        it('check opacity', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', opacity: undefined };
            const b = { ...baseWms, id: 'b', name: 'workspace:b', opacity: 1 };
            expect(mergeable(a, b)).toBe(true);
        });
        it('check mirrored urls are equal', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', url: `${baseWms.url}?foo=bar` };
            const b = { ...baseWms, id: 'b', name: 'workspace:b', url: baseWms.url };
            expect(mergeable(a, b)).toBe(true);
        });
        it('check coalesce option', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', coalesce: false };
            const b = { ...baseWms, id: 'b', name: 'workspace:b' };
            expect(mergeable(a, b)).toBe(false);
            expect(mergeable(b, a)).toBe(false);
        });
        it('check type is wms', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', type: 'wmts' };
            const b = { ...baseWms, id: 'b', name: 'workspace:b' };
            expect(mergeable(a, b)).toBe(false);
        });
        it('check useForElevation', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', useForElevation: true };
            const b = { ...baseWms, id: 'b', name: 'workspace:b' };
            expect(mergeable(a, b)).toBe(false);
        });
        it('check background group', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', group: 'background' };
            const b = { ...baseWms, id: 'b', name: 'workspace:b' };
            expect(mergeable(a, b)).toBe(false);
        });
        it('check vector format', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', format: 'application/vnd.mapbox-vector-tile' };
            const b = { ...baseWms, id: 'b', name: 'workspace:b' };
            expect(mergeable(a, b)).toBe(false);
        });
        it('check singleTile differs', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', singleTile: true };
            const b = { ...baseWms, id: 'b', name: 'workspace:b', singleTile: false };
            expect(mergeable(a, b)).toBe(false);
        });
        it('check opacity differs', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', opacity: 0.5 };
            const b = { ...baseWms, id: 'b', name: 'workspace:b', opacity: 1 };
            expect(mergeable(a, b)).toBe(false);
        });
        it('check urls do not match', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', url: 'http://otherhost:8080/geoserver/wms' };
            const b = { ...baseWms, id: 'b', name: 'workspace:b' };
            expect(mergeable(a, b)).toBe(false);
        });
        it('check blocked vendor params (e.g. CQL_FILTER)', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', params: { CQL_FILTER: 'INCLUDE' } };
            const b = { ...baseWms, id: 'b', name: 'workspace:b' };
            expect(mergeable(a, b)).toBe(false);
        });
        it('check shared key differences srs', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', srs: 'EPSG:3857' };
            const b = { ...baseWms, id: 'b', name: 'workspace:b', srs: 'EPSG:4326' };
            expect(mergeable(a, b)).toBe(false);
        });
        it('check tiled differs', () => {
            const a = { ...baseWms, id: 'a', name: 'workspace:a', tiled: true };
            const b = { ...baseWms, id: 'b', name: 'workspace:b', tiled: false };
            expect(mergeable(a, b)).toBe(false);
        });
    });
    it('groupWMSLayers coalesces adjacent compatible wms layers and keeps the others unchanged', () => {
        const baseWms = {
            type: 'wms',
            url: 'http://localhost:8080/geoserver/wms',
            format: 'image/png',
            visibility: true
        };
        const layerA = { ...baseWms, id: 'a', name: 'workspace:a', style: 'point', _v_: 2 };
        const layerB = { ...baseWms, id: 'b', name: 'workspace:b' };
        const layerHidden = { ...baseWms, id: 'h', name: 'workspace:h', visibility: false };
        const [group] = groupWMSLayers([layerA, layerB, layerHidden]);
        expect(group.key).toBe('wmsgroup:a,b,h');
        expect(group.options.id).toBe('wmsgroup:a,b,h');
        expect(group.options.name).toBe('workspace:a,workspace:b');
        expect(group.options.style).toBe('point,');
        expect(group.options.visibility).toBe(true);
        expect(group.options._coalesceGroupIds).toEqual(['a', 'b', 'h']);
    });
    it('groupWMSLayers coalesces handles group of layers', () => {
        const baseWms = {
            type: 'wms',
            url: 'http://localhost:8080/geoserver/wms',
            format: 'image/png',
            visibility: true
        };
        const layers = [
            { ...baseWms, id: 'wms1', name: 'workspace:wms1' },
            { ...baseWms, id: 'wms2', name: 'workspace:wms2' },
            { ...baseWms, id: 'wms3', name: 'workspace:wms3' },
            { ...baseWms, id: 'wms4', name: 'workspace:wms4' },
            { type: 'flatgeobuf', id: 'fgb1', name: 'workspace:fgb1', visibility: true },
            { ...baseWms, id: 'wms5', name: 'workspace:wms5' },
            { ...baseWms, id: 'wms6', name: 'workspace:wms6' },
            { ...baseWms, id: 'wms7', name: 'workspace:wms7' },
            { type: 'flatgeobuf', id: 'fgb2', name: 'workspace:fgb2', visibility: true },
            { ...baseWms, id: 'wms8', name: 'workspace:wms8' },
            { ...baseWms, id: 'wms9', name: 'workspace:wms9' },
            { ...baseWms, id: 'wms10', name: 'workspace:wms10' },
            { ...baseWms, id: 'wms11', name: 'workspace:wms11' },
            { ...baseWms, id: 'wms12', name: 'workspace:wms12' }
        ];
        const units = groupWMSLayers(layers);
        expect(units.length).toBe(5);
        expect(units[0].key).toBe('wmsgroup:wms1,wms2,wms3,wms4');
        expect(units[1].options.id).toBe('fgb1');
        expect(units[2].key).toBe('wmsgroup:wms5,wms6,wms7');
        expect(units[3].options.id).toBe('fgb2');
        expect(units[4].key).toBe('wmsgroup:wms8,wms9,wms10,wms11,wms12');
    });
    it('groupWMSLayers coalesces excludes layers with coalesce option false', () => {
        const baseWms = {
            type: 'wms',
            url: 'http://localhost:8080/geoserver/wms',
            format: 'image/png',
            visibility: true
        };
        const layers = [
            { ...baseWms, id: 'wms1', name: 'workspace:wms1' },
            { ...baseWms, id: 'wms2', name: 'workspace:wms2' },
            { ...baseWms, id: 'wms3', name: 'workspace:wms3', coalesce: false },
            { ...baseWms, id: 'wms4', name: 'workspace:wms4' },
            { ...baseWms, id: 'wms5', name: 'workspace:wms5' }
        ];
        const units = groupWMSLayers(layers);
        expect(units.length).toBe(3);
        expect(units[0].key).toBe('wmsgroup:wms1,wms2');
        expect(units[1].key).toBe('wms3');
        expect(units[1].options).toBe(layers[2]);
        expect(units[2].key).toBe('wmsgroup:wms4,wms5');
    });
    it('estimateWMSRequestURLLength grows with the merged LAYERS/STYLES and accounts for the base url', () => {
        const base = {
            url: 'http://localhost:8080/geoserver/wms',
            format: 'image/png',
            version: '1.3.0',
            srs: 'EPSG:3857',
            transparent: true,
            tiled: true,
            singleTile: false
        };
        const oneLayer = estimateWMSRequestURLLength({ ...base, name: 'workspace:a', style: '' });
        const twoLayers = estimateWMSRequestURLLength({ ...base, name: 'workspace:a,workspace:b', style: ',' });
        const threeLayers = estimateWMSRequestURLLength({ ...base, name: 'workspace:a,workspace:b,workspace:c', style: ',,' });
        expect(oneLayer).toBeGreaterThan(base.url.length);
        expect(twoLayers).toBeGreaterThan(oneLayer);
        expect(threeLayers).toBeGreaterThan(twoLayers);
        expect(estimateWMSRequestURLLength({ ...base, name: 'workspace:a', style: '' })).toBe(oneLayer);
        const differentSrsAndVersion = estimateWMSRequestURLLength({
            ...base, name: 'workspace:a', style: 'a-quite-long-style-name', srs: 'EPSG:4326', version: '1.1.1'
        });
        expect(differentSrsAndVersion).toBeGreaterThan(oneLayer);
        const multiUrl = estimateWMSRequestURLLength({ ...base, url: [base.url, 'http://mirror2:8080/geoserver/wms'], name: 'workspace:a', style: '' });
        expect(multiUrl).toBe(oneLayer);
    });
    describe('defaultGroupCondition with miscSettings.maxURLLength', () => {
        const baseWms = {
            type: 'wms',
            url: 'http://localhost:8080/geoserver/wms',
            format: 'image/png',
            singleTile: false,
            opacity: 1
        };
        const maxURLLength = 10;
        let originalMiscSettings;
        beforeEach(() => {
            originalMiscSettings = ConfigUtils.getConfigProp('miscSettings');
        });
        afterEach(() => {
            ConfigUtils.setConfigProp('miscSettings', originalMiscSettings);
        });
        it('merges two compatible layers when no maxURLLength is configured (defaults to Infinity)', () => {
            ConfigUtils.setConfigProp('miscSettings', {});
            const a = { ...baseWms, id: 'a', name: 'workspace:a' };
            const b = { ...baseWms, id: 'b', name: 'workspace:b' };
            expect(defaultGroupCondition(a, b, [a])).toBe(true);
        });
        it('rejects the merge once miscSettings.maxURLLength is set to 10, even if the layers are otherwise mergeable', () => {
            ConfigUtils.setConfigProp('miscSettings', { maxURLLength });
            const a = { ...baseWms, id: 'a', name: 'workspace:a' };
            const b = { ...baseWms, id: 'b', name: 'workspace:b' };
            expect(mergeable(a, b)).toBe(true);
            expect(defaultGroupCondition(a, b, [a])).toBe(false);
        });
    });
});
