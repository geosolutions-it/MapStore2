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
    getLabelName,
    getLayerErrorMessage,
    selectedNodesIdsToObject,
    isSingleDefaultGroup,
    markEdgesForToolbar
} from '../TOCUtils';

import { DEFAULT_GROUP_ID, NodeTypes } from '../../../../utils/LayersUtils';

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
    it('getLayerErrorMessage', () => {
        expect(getLayerErrorMessage({ })).toBe(null);
        expect(getLayerErrorMessage({ loadingError: 'Error' })).toEqual({ msgId: "toc.loadingerror" });
        expect(getLayerErrorMessage({ bbox: { crs: 'EPSG:40400' } })).toEqual({ msgId: 'toc.sourceCRSNotCompatible', msgParams: { sourceCRS: 'EPSG:40400' } });
        expect(getLayerErrorMessage({ sourceMetadata: { crs: 'EPSG:40400' } })).toEqual({ msgId: 'toc.sourceCRSNotCompatible', msgParams: { sourceCRS: 'EPSG:40400' } });
        expect(getLayerErrorMessage({ bbox: { crs: 'EPSG:4326' } })).toBe(null);
    });
    it('isSingleDefaultGroup', () => {
        expect(isSingleDefaultGroup([{ id: 'group', nodes: [] }])).toBe(false);
        expect(isSingleDefaultGroup([{ id: DEFAULT_GROUP_ID, nodesMutuallyExclusive: true, nodes: [] }])).toBe(false);
        expect(isSingleDefaultGroup([{ id: DEFAULT_GROUP_ID, visibility: false, nodes: [] }])).toBe(false);
        expect(isSingleDefaultGroup([{ id: DEFAULT_GROUP_ID }])).toBe(false);
        expect(isSingleDefaultGroup([{ id: DEFAULT_GROUP_ID, nodes: [] }, { id: 'group', nodes: [] }])).toBe(false);
        expect(isSingleDefaultGroup([{ id: DEFAULT_GROUP_ID, nodes: [] }])).toBe(true);
    });
    it('selectedNodesIdsToObject', () => {
        const selectedNodesIds = ['layer01', 'group01'];
        const layers = [{ id: 'layer01' }];
        const tree = [{ id: 'group01', nodes: layers }];
        const selectedNodes = selectedNodesIdsToObject(selectedNodesIds, layers, tree);
        expect(selectedNodes).toEqual([
            { id: 'layer01', node: { id: 'layer01', error: null }, type: NodeTypes.LAYER },
            { id: 'group01', node: { id: 'group01', nodes: layers }, type: NodeTypes.GROUP }
        ]);
    });

    describe('markEdgesForToolbar', () => {
        let container;
        beforeEach(() => {
            container = document.createElement('div');
            document.body.appendChild(container);
        });

        afterEach(() => {
            document.body.removeChild(container);
            container = null;
        });

        function createButton(visible = true) {
            const btn = document.createElement('button');
            if (!visible) {
                btn.style.display = 'none';
            }
            return btn;
        }

        it('marks first and last visible buttons', () => {
            const btn1 = createButton();
            const btn2 = createButton();
            const btn3 = createButton();
            container.append(btn1, btn2, btn3);

            markEdgesForToolbar(container);

            expect(btn1.classList.contains('is-first')).toBe(true);
            expect(btn3.classList.contains('is-last')).toBe(true);
            expect(btn2.classList.contains('is-first')).toBe(false);
            expect(btn2.classList.contains('is-last')).toBe(false);
        });

        it('removes previous markers before marking new ones', () => {
            const btn1 = createButton();
            const btn2 = createButton();
            btn1.classList.add('is-first', 'is-last');
            btn2.classList.add('is-first', 'is-last');
            container.append(btn1, btn2);

            markEdgesForToolbar(container);

            expect(btn1.classList.contains('is-first')).toBe(true);
            expect(btn1.classList.contains('is-last')).toBe(false);
            expect(btn2.classList.contains('is-first')).toBe(false);
            expect(btn2.classList.contains('is-last')).toBe(true);
        });

        it('ignores invisible buttons', () => {
            const btn1 = createButton(false); // invisible
            const btn2 = createButton();
            const btn3 = createButton(false); // invisible
            container.append(btn1, btn2, btn3);

            markEdgesForToolbar(container);

            expect(btn2.classList.contains('is-first')).toBe(true);
            expect(btn2.classList.contains('is-last')).toBe(true);
            expect(btn1.classList.contains('is-first')).toBe(false);
            expect(btn1.classList.contains('is-last')).toBe(false);
            expect(btn3.classList.contains('is-first')).toBe(false);
            expect(btn3.classList.contains('is-last')).toBe(false);
        });

        it('does nothing if no visible buttons', () => {
            const btn1 = createButton(false);
            container.append(btn1);

            markEdgesForToolbar(container);

            expect(btn1.classList.contains('is-first')).toBe(false);
            expect(btn1.classList.contains('is-last')).toBe(false);
        });

        it('returns early if no element provided', () => {
            const spy = expect.spyOn(document, 'querySelectorAll');
            markEdgesForToolbar(null);
            markEdgesForToolbar(undefined);
            expect(spy.calls.length).toBe(0);
            spy.restore();
        });
    });
});
