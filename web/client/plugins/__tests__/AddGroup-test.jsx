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

import AddGroupPlugin from '../AddGroup';
import { getPluginForTest } from './pluginsTestUtils';
import ReactTestUtils from 'react-dom/test-utils';
import { DEFAULT_GROUP_ID } from '../../utils/LayersUtils';

describe('AddGroup Plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Shows AddGroup plugin', () => {
        const { Plugin } = getPluginForTest(AddGroupPlugin, {
            controls: {
                addgroup: {
                    enabled: true
                }
            }
        });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        expect(document.getElementById('mapstore-add-toc-group')).toExist();
    });

    it('Closes AddGroup on cancel', () => {
        const { Plugin, store } = getPluginForTest(AddGroupPlugin, {
            controls: {
                addgroup: {
                    enabled: true
                }
            }
        });
        ReactDOM.render(<Plugin />, document.getElementById("container"));
        const btn = document.getElementsByTagName('button')[0];
        ReactTestUtils.Simulate.click(btn);
        expect(store.getState().controls.addgroup.enabled).toBe(false);
    });

    it('Add Group on confirm', () => {
        const { Plugin, store } = getPluginForTest(AddGroupPlugin, {
            map: {},
            controls: {
                addgroup: {
                    enabled: true
                }
            },
            layers: {
                groups: [{id: 'group1', nodes: []}]
            }
        });
        ReactTestUtils.act(() => {
            ReactDOM.render(<Plugin />, document.getElementById("container"));
        });
        const input = document.getElementsByTagName('input')[0];
        ReactTestUtils.Simulate.change(input, {
            target: {
                value: 'newgroup'
            }
        });
        const btn = document.getElementsByTagName('button')[1];
        ReactTestUtils.Simulate.click(btn);
        expect(store.getState().layers.groups.length).toBe(2);
        expect(store.getState().layers.groups[0].nodes[0].title).toBe('newgroup');
        expect(store.getState().layers.groups[0].nodes[0].name).toExist();
        expect(store.getState().layers.groups[0].nodes[0].name.length).toBe(36);
        expect(store.getState().layers.groups[0].nodes[0].id).toExist();
        expect(store.getState().layers.groups[0].nodes[0].id.length).toBe(36 + DEFAULT_GROUP_ID.length + 1 /* 1 is the dot */);
        expect(store.getState().layers.groups[0].nodes[0].nodes.length).toBe(0);
    });

    it('Add Nested Group on confirm', () => {
        const { Plugin, store } = getPluginForTest(AddGroupPlugin, {
            map: {},
            controls: {
                addgroup: {
                    enabled: true,
                    parent: DEFAULT_GROUP_ID + '.group2'
                }
            },
            layers: {
                groups: [{ id: DEFAULT_GROUP_ID, nodes: [{id: DEFAULT_GROUP_ID + '.group2', nodes: []}] }]
            }
        });
        ReactTestUtils.act(() => {
            ReactDOM.render(<Plugin />, document.getElementById("container"));
        });
        const input = document.getElementsByTagName('input')[0];
        ReactTestUtils.Simulate.change(input, {
            target: {
                value: 'newgroup'
            }
        });
        const btn = document.getElementsByTagName('button')[1];
        ReactTestUtils.Simulate.click(btn);
        expect(store.getState().layers.groups.length).toBe(1);
        expect(store.getState().layers.groups[0].nodes.length).toBe(1);
        expect(store.getState().layers.groups[0].nodes[0].nodes.length).toBe(1);
        const newgroup = store.getState().layers.groups[0].nodes[0].nodes[0];
        expect(newgroup.title).toBe('newgroup');
        expect(newgroup.name).toExist();
        expect(newgroup.name.length).toBe(36);
        expect(newgroup.id).toExist();
        expect(newgroup.id.length).toBe(DEFAULT_GROUP_ID.length + 6 + 36 + 2);
        expect(newgroup.nodes.length).toBe(0);
    });
});
