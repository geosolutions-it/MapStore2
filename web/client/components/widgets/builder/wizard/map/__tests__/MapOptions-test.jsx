/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const dragDropContext = require('react-dnd').DragDropContext;
const testBackend = require('react-dnd-test-backend');

const expect = require('expect');
const MapOptions = dragDropContext(testBackend)(require('../MapOptions'));

describe('MapOptions component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MapOptions rendering with defaults', () => {
        ReactDOM.render(<MapOptions />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.mapstore-step-title')).toExist();
        // renders the TOC
        expect(container.querySelector('#mapstore-layers')).toNotExist();
        expect(container.querySelector('.empty-state-container')).toExist();
        // not the Editor
        expect(container.querySelector('.ms-row-tab')).toNotExist();
    });
    it('MapOptions rendering layers', () => {
        ReactDOM.render(<MapOptions
            map={{ groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }] }}
            nodes={[{ id: 'GGG', nodes: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }] }]}
            layers={[{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }]}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.mapstore-step-title')).toExist();
        // renders the TOC
        expect(container.querySelector('#mapstore-layers')).toExist();
        expect(container.querySelector('.empty-state-container')).toNotExist();
        // not the Editor
        expect(container.querySelector('.ms-row-tab')).toNotExist();
    });
    it('MapOptions rendering node editor', () => {
        ReactDOM.render(<MapOptions
            map={{ groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }] }}
            nodes={[{ id: 'GGG', nodes: [{ id: "LAYER", group: "GGG", name: "LAYER", options: {}}]}]}
            layers={[{ id: "LAYER", group: "GGG", name: "LAYER", options: {} }]}
            editNode={"LAYER"} />, document.getElementById("container"));
        const container = document.getElementById('container');
        // renders the editor
        expect(container.querySelector('.ms-row-tab')).toExist();
        // not the TOC
        expect(container.querySelector('#mapstore-layers')).toNotExist();
    });
});
