/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import expect from 'expect';
import withRemoveResource from '../withRemoveResource';
import  {Provider} from 'react-redux';
const  store = {
    getState: () => {},
    subscribe: () => {}};


describe('media editor  withRemoveResource enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withRemoveResource rendering with defaults', (done) => {
        const Sink = withRemoveResource(createSink( props => {
            expect(props).toExist();
            expect(props.removeMedia).toExist();
            done();
        }));
        ReactDOM.render(<Provider store={store}><Sink /></Provider>, document.getElementById("container"));
    });
});
