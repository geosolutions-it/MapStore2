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
import {Provider} from 'react-redux';

import MapWizardComp from '../MapWizard';

const MapWizard = dragDropContext(testBackend)(MapWizardComp);
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
