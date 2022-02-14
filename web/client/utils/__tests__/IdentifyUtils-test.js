/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {displayByLocalConfig, getFormatForResponse} from '../IdentifyUtils';
import { INFO_FORMATS } from '../FeatureInfoUtils';

describe('IdentifyUtils', () => {
    it('getFormatForResponse WMS response', () => {
        expect(getFormatForResponse({ queryParams: { info_format: INFO_FORMATS.HTML } })).toBe(INFO_FORMATS.HTML);
    });
    it('getFormatForResponse WFS response', () => {
        expect(getFormatForResponse({ queryParams: { outputFormat: INFO_FORMATS.JSON } })).toBe(INFO_FORMATS.JSON);
    });
    it('displayByLocalConfig returns true when plugin\'s cfg is true', () => {
        const localConfig = {
            plugins: {
                mobile: [
                    {
                        name: 'Identify',
                        cfg: {
                            showNotifications: true
                        }
                    }
                ]
            }
        };
        const platform = 'mobile';
        const plugin =  'Identify';
        const cfg = 'showNotifications';
        expect(displayByLocalConfig(localConfig, platform, plugin, cfg)).toBe(true);
    });
    it('displayByLocalConfig returns false when plugin\'s cfg is false', () => {
        const localConfig = {
            plugins: {
                mobile: [
                    {
                        name: 'Identify',
                        cfg: {
                            showNotifications: false
                        }
                    }
                ]
            }
        };
        const platform = 'mobile';
        const plugin =  'Identify';
        const cfg = 'showNotifications';
        expect(displayByLocalConfig(localConfig, platform, plugin, cfg)).toBe(false);
    });
    it('displayByLocalConfig returns true when there\'s no plugin', () => {
        const localConfig = {
        };
        const platform = 'mobile';
        const plugin =  'Identify';
        const cfg = 'showNotifications';
        expect(displayByLocalConfig(localConfig, platform, plugin, cfg)).toBe(true);
    });
    it('displayByLocalConfig returns true for plugin congifs that are not objects', () => {
        const localConfig = {
            plugins: {
                mobile: [
                    "Home"
                ]
            }
        };
        const platform = 'mobile';
        const plugin =  'Identify';
        const cfg = 'showNotifications';
        expect(displayByLocalConfig(localConfig, platform, plugin, cfg)).toBe(true);
    });
});

