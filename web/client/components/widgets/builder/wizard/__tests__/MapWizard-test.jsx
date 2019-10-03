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
const {Provider} = require('react-redux');

const expect = require('expect');

const MapWizard = dragDropContext(testBackend)(require('../MapWizard'));
describe('MapWizard component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MapWizard rendering with map', () => {
        // mock the store for empty map type
        const store = {
            getState: () => ({
                maptype: {
                    mapType: 'sink'
                }
            }),
            subscribe: () => {}
        };
        const map = { groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", name: "Layer", group: "GGG", options: {} }] };
        ReactDOM.render(<Provider store={store}><MapWizard editorData={{ map }} /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
    });
});
