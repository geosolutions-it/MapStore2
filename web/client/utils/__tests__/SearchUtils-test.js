/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {defaultIconStyle, showGFIForService} = require('../SearchUtils');


describe('SearchUtils test', () => {
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
        expect(showGFIForService({visibility: true}, {launchInfoPanel: 'single_layer', openFeatureInfoButtonEnabled: true})).toBe(true);
    });
    it('showGFIForService with feature info button disabled', () => {
        expect(showGFIForService({visibility: true}, {launchInfoPanel: 'single_layer', openFeatureInfoButtonEnabled: false})).toBe(false);
    });
    it('showGFIForService wrong launch info panel', () => {
        expect(showGFIForService({visibility: true}, {launchInfoPanel: 'all_layers', openFeatureInfoButtonEnabled: true})).toBe(false);
    });
    it('showGFIForService layer hidden no force visibility', () => {
        expect(showGFIForService({visibility: false}, {launchInfoPanel: 'single_layer', openFeatureInfoButtonEnabled: true})).toBe(false);
    });
    it('showGFIForService layer hidden with force visibility', () => {
        expect(showGFIForService({visibility: false}, {launchInfoPanel: 'single_layer', openFeatureInfoButtonEnabled: true, forceSearchLayerVisibility: true})).toBe(true);
    });
});
