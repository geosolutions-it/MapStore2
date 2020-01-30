/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import expect from 'expect';
import withSelectedMapReload from '../withSelectedMapReload';
import  {Provider} from 'react-redux';
const  store = {
    getState: () => {},
    subscribe: () => {}};


describe('media editor withSelectedMapReload enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withSelectedMapReload throws onMapChoice  when needed', (done) => {
        const actions = {
            onMapChoice: () => { }
        };
        const spyOnMapChoice = expect.spyOn(actions, 'onMapChoice');

        const resource = {id: 1};
        const resources = [resource];

        store.dispatch = () => {};
        const Sink = withSelectedMapReload(createSink( props => {
            expect(props).toExist();
            expect(spyOnMapChoice).toHaveBeenCalled();
            expect(spyOnMapChoice.getLastCall().arguments[0]).toBe(resource);
            done();
        }));

        ReactDOM.render(<Provider store={store}>
            <Sink onMapChoice={actions.onMapChoice}
                selectedService="geostoreMap"
                selected
                resources={resources}
                selectedItem={resource}
            />
        </Provider>, document.getElementById("container"));

    });

});
