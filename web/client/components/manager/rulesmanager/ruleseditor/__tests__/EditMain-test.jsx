/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import rxjsConfig from 'recompose/rxjsObservableConfig';

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Provider } from 'react-redux';
import Editor from '../EditMain.jsx';
import configureMockStore from 'redux-mock-store';
import { setObservableConfig } from 'recompose';
import ConfigUtils from '../../../../../utils/ConfigUtils.js';
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
    describe('for stand-alone geofence', () => {
        beforeEach((done) => {
            ConfigUtils.setConfigProp("geoFenceServiceType", "geofence");
            setTimeout(done);
        });
        afterEach((done) => {
            ConfigUtils.removeConfigProp("geoFenceServiceType");
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
            expect(rows.length).toBe(10);
            const disabledRows = el.querySelectorAll('.ms-disabled.row');
            expect(disabledRows).toExist();
            expect(disabledRows.length).toBe(3);    // includes: workspace, layer and request
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
            expect(rows.length).toBe(11);
        });
    });
    describe('for integrated geofence with geoserver', () => {
        beforeEach((done) => {
            ConfigUtils.setConfigProp("geoFenceServiceType", "geoserver");
            setTimeout(done);
        });
        afterEach((done) => {
            ConfigUtils.removeConfigProp("geoFenceServiceType");
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
            expect(rows.length).toBe(9);
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
            expect(rows.length).toBe(10);
        });
    });
});
