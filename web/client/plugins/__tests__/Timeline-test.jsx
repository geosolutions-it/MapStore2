/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { SHOW_NOTIFICATION } from '../../actions/notifications';

import TimelinePlugin from '../Timeline';
import { getPluginForTest } from './pluginsTestUtils';


import MapUtils from '../../utils/MapUtils';

const SAMPLE_STATE = {
    timeline: {
        selectedLayer: "TEST_LAYER",
        range: {
            start: "2000-01-01T00:00:00.000Z",
            end: "2020-12-31T00:00:00.000Z"
        }
    },
    layers: {
        flat: [{
            id: 'TEST_LAYER',
            name: 'TEST_LAYER',
            type: 'wms',
            url: 'base/web/client/test-resources/wmts/DomainValues.xml',
            dimensions: [
                {
                    source: {
                        type: 'multidim-extension',
                        // this forces to load fixed values from the test file, ignoring parameters
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                    },
                    name: 'time'
                }
            ],
            params: {
                time: '2000-06-08T00:00:00.000Z'
            },
            visibility: true
        }]
    }
};

const FALSY_STATE = {
    timeline: {
        selectedLayer: "TEST_LAYER",
        range: {
            start: "2000-01-01T00:00:00.000Z",
            end: "2020-12-31T00:00:00.000Z"
        }
    },
    layers: {
        flat: [{
            id: 'TEST_LAYER',
            name: 'TEST_LAYER',
            type: 'wms',
            url: 'base/web/client/test-resources/wmts/DomainValues.xml',
            dimensions: [
                {
                    source: {
                        type: 'multidim-extension',
                        // this forces to load fixed values from the test file, ignoring parameters
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                    },
                    name: 'time'
                }
            ],
            params: {
                time: '2000-06-08T00:00:00.000Z'
            },
            visibility: false
        }, {
            id: 'TEST_LAYER_2',
            name: 'TEST_LAYER_2',
            type: 'wms',
            url: 'base/web/client/test-resources/wmts/DomainValues.xml',
            dimensions: [
                {
                    source: {
                        type: 'multidim-extension',
                        // this forces to load fixed values from the test file, ignoring parameters
                        url: 'base/web/client/test-resources/wmts/DomainValues.xml'
                    },
                    name: 'time'
                }
            ],
            params: {
                time: '2000-06-08T00:00:00.000Z'
            },
            visibility: false
        }]
    }
};

describe('Timeline Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
        MapUtils.clearHooks();
    });


    describe('render Plugin', () => {
        it('do not render when state missing', () => {
            const { Plugin } = getPluginForTest(TimelinePlugin, {});
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.querySelector('.timeline-plugin')).toBeFalsy();
        });
        it('render with minimal state with default config', () => {
            const { Plugin} = getPluginForTest(TimelinePlugin, SAMPLE_STATE);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.querySelector('.timeline-plugin')).toBeTruthy();
        });
        it('render with minimal state with config', () => {
            const _state = {...SAMPLE_STATE, timeline: {...SAMPLE_STATE.timeline, setting: {showHiddenLayers: true}}};
            const { Plugin} = getPluginForTest(TimelinePlugin, _state);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.querySelector('.timeline-plugin')).toBeTruthy();
        });
        it('Timeline plugin is not visible when all layers with dimension data have visibility set to false', ()=>{
            const { Plugin } = getPluginForTest(TimelinePlugin, FALSY_STATE);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.querySelector('.timeline-plugin.hidden')).toBeTruthy();
        });
        it('shows the warning  when the hidden selected layer is not displayed in the timeline', () => {
            const state = {
                ...FALSY_STATE,
                layers: {
                    ...FALSY_STATE.layers,
                    flat: FALSY_STATE.layers.flat.map(layer =>
                        layer.id === 'TEST_LAYER_2' ? { ...layer, visibility: true } : layer
                    )
                }
            };
            const { Plugin } = getPluginForTest(TimelinePlugin, state);
            ReactDOM.render(<Plugin />, document.getElementById("container"));

            const warning = document.querySelector('.ms-timeline-visibility-warning');
            expect(warning).toBeTruthy();
        });
        it('Timeline plugin is not visible when there are no layers with dimension data', ()=>{
            const { Plugin } = getPluginForTest(TimelinePlugin, {});
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.querySelector('.timeline-plugin')).toBeFalsy();
        });
    });
    describe('edit the selected time range', () => {
        const start = '1583-01-01T00:00:00.000Z';
        const end = '1981-03-06T01:36:05.000Z';

        it('keeps invalid end-year drafts editable and commits a corrected range', () => {
            const { Plugin, store, actions } = getPluginForTest(TimelinePlugin, {
                ...SAMPLE_STATE,
                dimension: { currentTime: start, offsetTime: end }
            });
            ReactDOM.render(<Plugin/>, document.getElementById('container'));
            const year = document.querySelectorAll('.ms-dt-year input')[1];
            TestUtils.Simulate.change(year, { target: { value: '198' } });
            expect(actions.filter(({ type }) => type === SHOW_NOTIFICATION).length).toBe(0);
            TestUtils.Simulate.blur(year);
            expect(year.value).toBe('198');
            expect(year.getAttribute('aria-invalid')).toBe('true');
            expect(store.getState().dimension.offsetTime).toBe(end);
            const notification = actions.find(({ type }) => type === SHOW_NOTIFICATION);
            expect(notification.level).toBe('warning');
            expect(notification.title).toBe('timeline.errors.invalidDateTitle');
            expect(notification.message).toBe('timeline.errors.invalidEndDate');
            expect(notification.autoDismiss).toBe(6);
            TestUtils.Simulate.keyDown(year, { key: 'Enter' });
            TestUtils.Simulate.blur(year);
            expect(actions.filter(({ type }) => type === SHOW_NOTIFICATION).length).toBe(1);
            TestUtils.Simulate.change(year, { target: { value: '1980' } });
            expect(store.getState().dimension.offsetTime).toBe(end);
            TestUtils.Simulate.keyDown(year, { key: 'Enter' });
            expect(store.getState().dimension.offsetTime).toBe('1980-03-06T01:36:05.000Z');
            expect(year.value).toBe('1980');
            expect(year.getAttribute('aria-invalid')).toBe('false');
            expect(actions.filter(({ type }) => type === SHOW_NOTIFICATION).length).toBe(1);
        });
        it('rejects a start after the end and accepts correction on blur', () => {
            const { Plugin, store, actions } = getPluginForTest(TimelinePlugin, {
                ...SAMPLE_STATE,
                dimension: { currentTime: start, offsetTime: end }
            });
            ReactDOM.render(<Plugin/>, document.getElementById('container'));
            const year = document.querySelector('.ms-dt-year input');
            TestUtils.Simulate.change(year, { target: { value: '1982' } });
            TestUtils.Simulate.blur(year);
            expect(year.value).toBe('1982');
            expect(year.getAttribute('aria-invalid')).toBe('true');
            expect(store.getState().dimension.currentTime).toBe(start);
            expect(actions.find(({ type }) => type === SHOW_NOTIFICATION).message).toBe('timeline.errors.invalidStartDate');
            TestUtils.Simulate.change(year, { target: { value: '1980' } });
            TestUtils.Simulate.blur(year);
            expect(store.getState().dimension.currentTime).toBe('1980-01-01T00:00:00.000Z');
            expect(year.getAttribute('aria-invalid')).toBe('false');
        });
        [
            { name: 'empty year', selector: '.ms-dt-year input', value: '' },
            { name: 'nonnumeric year', selector: '.ms-dt-year input', value: 'abc' },
            { name: 'impossible date', selector: '.ms-dt-day input', value: '32' },
            { name: 'invalid time', selector: '.ms-dt-hours input', value: '25' }
        ].forEach(({ name, selector, value }) => {
            it(`warns about invalid input (${name}) without changing the selected range`, () => {
                const { Plugin, store, actions } = getPluginForTest(TimelinePlugin, {
                    ...SAMPLE_STATE,
                    dimension: { currentTime: start, offsetTime: end }
                });
                ReactDOM.render(<Plugin/>, document.getElementById('container'));
                const input = document.querySelectorAll(selector)[1];
                TestUtils.Simulate.change(input, { target: { value } });
                TestUtils.Simulate.keyDown(input, { key: 'Enter' });
                const notification = actions.find(({ type }) => type === SHOW_NOTIFICATION);
                expect(notification.level).toBe('warning');
                expect(notification.message).toBe('timeline.errors.invalidDateMessage');
                expect(input.value).toBe(value);
                expect(store.getState().dimension.offsetTime).toBe(end);
            });
        });
        it('warns about invalid input in single-time mode', () => {
            const { Plugin, store, actions } = getPluginForTest(TimelinePlugin, {
                ...SAMPLE_STATE,
                dimension: { currentTime: end }
            });
            ReactDOM.render(<Plugin/>, document.getElementById('container'));
            const minutes = document.querySelector('.ms-dt-minutes input');
            TestUtils.Simulate.change(minutes, { target: { value: '60' } });
            TestUtils.Simulate.blur(minutes);
            expect(actions.find(({ type }) => type === SHOW_NOTIFICATION).message).toBe('timeline.errors.invalidDateMessage');
            expect(store.getState().dimension.currentTime).toBe(end);
        });
        it('preserves single-time editing without a range constraint', () => {
            const { Plugin, store } = getPluginForTest(TimelinePlugin, {
                ...SAMPLE_STATE,
                dimension: { currentTime: end }
            });
            ReactDOM.render(<Plugin/>, document.getElementById('container'));
            const year = document.querySelector('.ms-dt-year input');
            TestUtils.Simulate.change(year, { target: { value: '198' } });
            expect(store.getState().dimension.currentTime).toBe(end);
            TestUtils.Simulate.blur(year);
            expect(store.getState().dimension.currentTime).toBe('0198-03-06T01:36:05.000Z');
        });
    });
});
