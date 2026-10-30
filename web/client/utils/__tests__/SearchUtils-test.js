/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { defaultIconStyle, getSearchResultCrs, getSearchServiceOptions, searchServiceUsesMapCrs, showGFIForService, layerIsVisibleForGFI } from '../SearchUtils';


describe('SearchUtils test', () => {
    it('preserves legacy request options and assumes 4326 for old results', () => {
        const options = { typeName: 'test:layer' };
        expect(getSearchServiceOptions({ type: 'wfs', options })).toBe(options);
        expect(getSearchResultCrs({})).toBe('EPSG:4326');
        expect(getSearchResultCrs({ __SERVICE__: { options: { srsName: 'map' } } })).toBe('EPSG:4326');
    });
    it('leaves custom service options unchanged', () => {
        const options = { srsName: 'map' };
        expect(getSearchServiceOptions({ type: 'custom', options }, 'EPSG:3857')).toBe(options);
    });
    it('rejects an unsupported CRS before sending the request', () => {
        expect(() => getSearchServiceOptions({ type: 'wfs', options: { srsName: 'EPSG:invalid' } })).toThrow();
    });
    it('detects map-dependent nested and geometry services', () => {
        const service = { type: 'wfs', options: { srsName: 'map' } };
        expect(searchServiceUsesMapCrs({ then: [{ geomService: service }] })).toBe(true);
        expect(searchServiceUsesMapCrs({ type: 'wfs', options: { srsName: 'EPSG:4326', item: { __SERVICE__: service } } })).toBe(true);
        expect(searchServiceUsesMapCrs({ type: 'wfs', options: { srsName: 'EPSG:4326' } })).toBe(false);
    });
    it('defaultIconStyle', () => {
        expect(defaultIconStyle).toEqual({
            iconUrl: require('../../product/assets/img/marker-icon-red.png'),
            shadowUrl: require('../../product/assets/img/marker-shadow.png'),
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    });
    it('showGFIForService with feature info button enabled', () => {
        expect(showGFIForService({launchInfoPanel: 'single_layer', openFeatureInfoButtonEnabled: true})).toBe(true);
    });
    it('showGFIForService with feature info button disabled', () => {
        expect(showGFIForService({launchInfoPanel: 'single_layer', openFeatureInfoButtonEnabled: false})).toBe(false);
    });
    it('showGFIForService wrong launch info panel', () => {
        expect(showGFIForService({launchInfoPanel: 'all_layers', openFeatureInfoButtonEnabled: true})).toBe(false);
    });
    it('layerIsVisibleForGFI layer hidden no force visibility', () => {
        expect(layerIsVisibleForGFI({visibility: false}, {launchInfoPanel: 'single_layer', openFeatureInfoButtonEnabled: true})).toBe(false);
    });
    it('layerIsVisibleForGFI layer hidden with force visibility', () => {
        expect(layerIsVisibleForGFI({visibility: false}, {launchInfoPanel: 'single_layer', openFeatureInfoButtonEnabled: true, forceSearchLayerVisibility: true})).toBe(true);
    });
    it('layerIsVisibleForGFI layer doesn\'t exist', () => {
        expect(layerIsVisibleForGFI(undefined, {launchInfoPanel: 'single_layer', openFeatureInfoButtonEnabled: true, forceSearchLayerVisibility: true})).toBe(false);
    });
});
