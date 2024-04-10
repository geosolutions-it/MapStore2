/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import TOC from '../TOC';
import { Simulate } from 'react-dom/test-utils';

describe('TOC', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with defaults', () => {
        ReactDOM.render(<TOC />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
    });
    it('should trigger on change map with onChange event', (done) => {
        ReactDOM.render(<TOC
            config={{ sortable: false }}
            map={{
                layers: [
                    {
                        id: 'layer02',
                        name: 'Layer 02',
                        group: 'group02'
                    },
                    {
                        id: 'layer01',
                        name: 'Layer 01',
                        group: 'group01'
                    }
                ],
                groups: [
                    {
                        id: 'group01',
                        title: 'Group 01',
                        visibility: true
                    },
                    {
                        id: 'group02',
                        title: 'Group 02',
                        visibility: true
                    }
                ]
            }}
            onChangeMap={(map) => {
                expect(map.groups[0].visibility).toBe(false);
                done();
            }}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const visibilityChecks = [...document.querySelectorAll('.ms-visibility-check')];
        expect(visibilityChecks.length).toBe(4);
        Simulate.click(visibilityChecks[0]);
    });
    it('should trigger on select node', (done) => {
        ReactDOM.render(<TOC
            config={{ sortable: false }}
            map={{
                layers: [
                    {
                        id: 'layer02',
                        name: 'Layer 02',
                        group: 'group02'
                    },
                    {
                        id: 'layer01',
                        name: 'Layer 01',
                        group: 'group01'
                    }
                ],
                groups: [
                    {
                        id: 'group01',
                        title: 'Group 01',
                        visibility: true
                    },
                    {
                        id: 'group02',
                        title: 'Group 02',
                        visibility: true
                    }
                ]
            }}
            onSelectNode={(nodeId, nodeType) => {
                expect(nodeId).toBe('group01');
                expect(nodeType).toBe('group');
                done();
            }}
        />, document.getElementById("container"));
        expect(document.querySelector('.ms-layers-tree')).toBeTruthy();
        const nodeHeaders = [...document.querySelectorAll('.ms-node-header')];
        expect(nodeHeaders.length).toBe(4);
        Simulate.click(nodeHeaders[0]);
    });
});
