/*
 * Copyright 2025, GeoSolutions Sas.
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
import EditGSInstanceMain from '../EditGSInstanceMain';
import configureMockStore from 'redux-mock-store';
import { setObservableConfig } from 'recompose';
setObservableConfig(rxjsConfig);
const mockStore = configureMockStore();

const renderComp = (props, store) => {
    return ReactDOM.render(
        <Provider store={store}>
            <EditGSInstanceMain {...props}/>
        </Provider>, document.getElementById("container"));
};


describe('GS Instances EditGSInstanceMain Main EditGSInstanceMain component', () => {
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
        expect(rows.length).toBe(3);
    });
});
