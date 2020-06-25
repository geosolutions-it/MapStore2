/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');

const {
    isLocalizedLayerStylesEnabledSelector,
    isLocalizedLayerStylesEnabledDashboardsSelector,
    localizedLayerStylesNameSelector,
    localizedLayerStylesEnvSelector
} = require('../localizedLayerStyles');
const {currentLocaleLanguageSelector} = require('../locale');

const givenName = 'example';
const givenState = {
    localConfig: {
        localizedLayerStyles: {
            name: givenName
        },
        plugins: {
            dashboard: [{
                name: "DashboardEditor",
                cfg: {
                    catalog: {
                        localizedLayerStyles: true
                    }
                }
            }]
        }
    }
};

describe('Test localizedLayerStyles', () => {
    it('test localizedLayerStylesNameSelector default', () => {
        const localizedLayerStyles = localizedLayerStylesNameSelector({});

        expect(localizedLayerStyles).toBe('mapstore_language');
    });

    it('test localizedLayerStylesNameSelector', () => {
        const localizedLayerStyles = localizedLayerStylesNameSelector(givenState);

        expect(localizedLayerStyles).toBe(givenName);
    });

    it('test isLocalizedLayerStylesEnabledSelector', () => {
        let isLocalizedLayerStylesEnabled;

        isLocalizedLayerStylesEnabled = isLocalizedLayerStylesEnabledSelector({});
        expect(isLocalizedLayerStylesEnabled).toBe(false);

        isLocalizedLayerStylesEnabled = isLocalizedLayerStylesEnabledSelector(givenState);
        expect(isLocalizedLayerStylesEnabled).toBe(true);
    });

    it('test isLocalizedLayerStylesEnabledDashboardsSelector', () => {
        let isLocalizedLayerStylesEnabled;

        isLocalizedLayerStylesEnabled = isLocalizedLayerStylesEnabledDashboardsSelector({});
        expect(isLocalizedLayerStylesEnabled).toBe(false);

        isLocalizedLayerStylesEnabled = isLocalizedLayerStylesEnabledDashboardsSelector(givenState);
        expect(isLocalizedLayerStylesEnabled).toBe(true);
    });

    it('test localizedLayerStylesEnvSelector default', () => {
        const env = localizedLayerStylesEnvSelector({});

        expect(env).toEqual([]);
    });

    it('test localizedLayerStylesEnvSelector', () => {
        const env = localizedLayerStylesEnvSelector(givenState);
        const language = currentLocaleLanguageSelector(givenState);

        expect(env).toEqual([{
            name: givenName,
            value: language
        }]);
    });
});
