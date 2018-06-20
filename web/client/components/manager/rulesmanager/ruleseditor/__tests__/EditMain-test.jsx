/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const rxjsConfig = require('recompose/rxjsObservableConfig').default;

const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const Provider = require('react-redux').Provider;
const Editor = require('../EditMain.jsx');

const configureMockStore = require('redux-mock-store').default;
const { setObservableConfig } = require('recompose');
setObservableConfig(rxjsConfig);
const mockStore = configureMockStore();

const renderComp = (props, store) => {
    return ReactDOM.render(
        <Provider store={store}>
            <Editor {...props}/>
        </Provider>, document.getElementById("container"));
};


describe('Rules Editor Main Editor component', () => {
    let store;
    beforeEach((done) => {
        store = mockStore();
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render nothing if not  active', () => {
        store = mockStore({
            rulesmanager: {}
        });
        renderComp({active: false}, store);
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-rule-editor');
        expect(el).toExist();
        expect(el.style.display).toBe("none");
    });
    it('render default when active', () => {
        store = mockStore({
            rulesmanager: {}
        });
        renderComp({active: true}, store);
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-rule-editor');
        expect(el).toExist();
        const rows = el.querySelectorAll('.row');
        expect(rows).toExist();
        expect(rows.length).toBe(8);
        const disabledRows = el.querySelectorAll('.ms-disabled.row');
        expect(disabledRows).toExist();
        expect(disabledRows.length).toBe(1);
    });
    it('render priority selector', () => {
        store = mockStore({
            rulesmanager: {}
        });
        renderComp({active: true, rule: {id: 10}}, store);
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-rule-editor');
        expect(el).toExist();
        const rows = el.querySelectorAll('.row');
        expect(rows).toExist();
        expect(rows.length).toBe(9);
    });
});
