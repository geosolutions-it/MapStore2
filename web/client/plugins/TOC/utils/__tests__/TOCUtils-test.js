/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    isValidNewGroupOption,
    getTooltip,
    getTooltipFragment,
    getTitleAndTooltip,
    getLabelName
} from '../TOCUtils';
describe('TOCUtils', () => {
    it('test isValidNewGroupOption for General Fragment with value not allowed', () => {
        let val = isValidNewGroupOption({ label: "/as" });
        expect(val).toBe(false);
        val = isValidNewGroupOption({ label: "a//s" });
        expect(val).toBe(false);
        val = isValidNewGroupOption({ label: "s/d&/" });
        expect(val).toBe(false);
    });

    it('test getTooltip for General Fragment with new valid value', () => {
        const node = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            id: "layer00",
            description: "desc",
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            tooltipOptions: "both"
        };
        const currentLocale = "it-IT";
        const tooltip = getTooltip(node, currentLocale);
        expect(tooltip).toBe("Livello - desc");
    });

    it('test getTooltipFragment', () => {
        const node = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            id: "layer00",
            description: "desc",
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const currentLocale = "it-IT";
        let tooltip = getTooltipFragment("title", node, currentLocale);
        expect(tooltip).toBe("Livello");
        tooltip = getTooltipFragment("description", node, currentLocale);
        expect(tooltip).toBe("desc");

        tooltip = getTooltipFragment("fakeFragment", node, currentLocale);
        expect(tooltip).toBe(undefined);

    });
    it('test getTitleAndTooltip both', () => {
        const node = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            id: "layer00",
            description: "desc",
            tooltipOptions: "both"
        };
        const currentLocale = "it-IT";
        const {title, tooltipText} = getTitleAndTooltip({node, currentLocale});
        expect(title).toBe("Livello");
        expect(tooltipText).toBe("Livello - desc");
    });
    it('test getTitleAndTooltip NoTooltip', () => {
        const node = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            id: "layer00",
            description: "desc",
            tooltipOptions: "none"
        };
        const currentLocale = "it-IT";
        const {title, tooltipText} = getTitleAndTooltip({node, currentLocale});
        expect(title).toBe("Livello");
        expect(tooltipText).toBe("");
    });
    it('test default value getLabelName from object', () => {
        const groupLabel = "Default";
        const nodes = [{
            value: 'Layer',
            label: 'Default'
        }, {
            value: 'Layer_1',
            label: 'Default_1'
        }];
        const label = getLabelName(groupLabel, nodes);
        expect(label).toBe("Default");
    });
});
