/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import {DragDropContext as dragDropContext} from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import TOCComp from '../TOC';

const TOC = dragDropContext(testBackend)(TOCComp);
describe('TOC component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('TOC rendering with layer', () => {
        ReactDOM.render(<TOC
            map={{ groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", name: "LAYER", group: "GGG", options: {} }] }}
            nodes={[{ id: 'GGG', nodes: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }] }]}
            layers={[{ id: "LAYER", group: "GGG", options: {} }]}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.toc-title');
        expect(el).toExist();
    });
    it('Test TOC onChange', () => {
        const actions = {
            onChange: () => {}
        };
        const spyonChange = expect.spyOn(actions, 'onChange');
        ReactDOM.render(<TOC map={{ groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", name: "LAYER", group: "GGG", options: {} }] }}
            nodes={[{ id: 'GGG', nodes: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }] }]}
            layers={[{ id: "LAYER", group: "GGG", options: {} }]}
            onChange={actions.onChange} />, document.getElementById("container"));

        const container = document.getElementById('container');
        const el = container.querySelector('.visibility-check');
        expect(el).toExist();
        ReactTestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonChange).toHaveBeenCalled();
    });
});
