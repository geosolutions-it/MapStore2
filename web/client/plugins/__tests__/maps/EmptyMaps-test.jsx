/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Provider } from 'react-redux';
import EmptyMaps from '../../maps/EmptyMaps';


describe('EmptyMaps component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Render EmptyMaps with default', function() {
        const store = {
            subscribe: () => { },
            dispatch: () => { },
            getState: () => ({ mapType: { mapType: "openlayers" }, security: {user: {name: 'geo'}} })
        };
        ReactDOM.render(
            <Provider store={store}>
                <EmptyMaps />
            </Provider>, document.getElementById("container"));

        const container = document.getElementById('container');
        expect(container.querySelector('button')).toExist();
        expect(container.querySelector('div').style['margin-bottom']).toEqual('20px');
    });

    it('Render EmptyMaps without create new button when is guest user', function() {
        const store = {
            subscribe: () => { },
            dispatch: () => { },
            getState: () => ({ mapType: { mapType: "openlayers" }})
        };
        ReactDOM.render(
            <Provider store={store}>
                <EmptyMaps />
            </Provider>, document.getElementById("container"));

        const container = document.getElementById('container');
        expect(container.querySelector('button')).toNotExist();
        expect(container.querySelector('div').style['margin-bottom']).toEqual('20px');
    });
});
