/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const { withContext } = require('recompose');
const expect = require('expect');

const mockStore = withContext({
    store: PropTypes.any
}, ({store = {}} = {}) => ({
    store: {
        dispatch: () => { },
        subscribe: () => { },
        getState: () => ({}),
        ...store
    }
}));
const MapWizard = mockStore(require('../MapWizard'));
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
            })
        };
        const map = { groups: [{ id: 'GGG' }], layers: [{ id: "LAYER", name: "Layer", group: "GGG", options: {} }] };
        ReactDOM.render(<MapWizard store={store} editorData={{ map }} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-wizard');
        expect(el).toExist();
    });
});
