/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {createFromSearch, getTooltip, getTooltipText} = require('../TOCUtils');
let options = [{label: "lab1", value: "val1"}];

describe('TOCUtils', () => {
    it('test createFromSearch for General Fragment with value not allowed', () => {
        let val = createFromSearch(options, "/as");
        expect(val).toBe(null);
        val = createFromSearch(options, "a//s");
        expect(val).toBe(null);
        val = createFromSearch(options, "s/d&/");
        expect(val).toBe(null);
    });

    it('test createFromSearch for General Fragment with new valid value', () => {
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
        const tooltipOptions = {"layer00": ["title", "description", "fakeFragment"]};
        const currentLocale = "it-IT";
        const tooltip = getTooltip(tooltipOptions, node, currentLocale);
        expect(tooltip).toBe("Livello - desc");
    });
    it('test getTooltipText', () => {
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
        let tooltip = getTooltipText("title", node, currentLocale);
        expect(tooltip).toBe("Livello");
        tooltip = getTooltipText("description", node, currentLocale);
        expect(tooltip).toBe("desc");

        tooltip = getTooltipText("fakeFragment", node, currentLocale);
        expect(tooltip).toBe(undefined);

    });
});
