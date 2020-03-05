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
import withMapEditing from '../withMapEditing';
import  {Provider} from 'react-redux';
const  store = {
    getState: () => {},
    subscribe: () => {}};


describe('media editor withMapEditing enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('withMapEditing rendering with defaults', (done) => {
        const Sink = withMapEditing(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.openMapEditor).toBeTruthy();
            expect(props.importInLocal).toBeTruthy();
            done();
        }));
        ReactDOM.render(<Provider store={store}><Sink /></Provider>, document.getElementById("container"));
    });
    it('withMapEditing open mapEditor when needed or call setAddingMedia', (done) => {
        const actions = {
            setAddingMedia: () => { }
        };
        store.dispatch = (a) => {
            expect(a).toBeTruthy();
            expect(a.type).toBe("MAP_EDITOR:SHOW");
        };
        const spyAddingMedia = expect.spyOn(actions, 'setAddingMedia');

        const Sink = withMapEditing(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.openMapEditor).toBeTruthy();
            expect(props.importInLocal).toBeTruthy();
            expect(props.setAddingMedia).toBeTruthy();
            expect(props.editRemoteMap).toBeTruthy();
            props.setAddingMedia(true);
        }));
        ReactDOM.render(<Provider store={store}><Sink setAddingMedia={actions.setAddingMedia} mediaType="map"/></Provider>, document.getElementById("container"));
        store.dispatch = () => {};
        const SinkAddingMedia = withMapEditing(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.openMapEditor).toBeTruthy();
            expect(props.importInLocal).toBeTruthy();
            expect(props.setAddingMedia).toBeTruthy();
            props.setAddingMedia(true);
            expect(spyAddingMedia).toHaveBeenCalled();
            done();
        }));
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        ReactDOM.render(<Provider store={store}><SinkAddingMedia setAddingMedia={actions.setAddingMedia} mediaType="imag"/></Provider>, document.getElementById("container"));

    });
    it('withMapEditing editRemoteMap call open map editor', (done) => {
        store.dispatch = (a) => {
            expect(a).toBeTruthy();
            expect(a.type).toBe("MAP_EDITOR:SHOW");
            expect(a.owner).toBe("mediaEditorEditRemote");
            expect(a.map).toBeTruthy();
        };

        const Sink = withMapEditing(createSink( props => {
            expect(props).toBeTruthy();
            expect(props.openMapEditor).toBeTruthy();
            expect(props.editRemoteMap).toBeTruthy();
            expect(props.setAddingMedia).toBeTruthy();
            props.editRemoteMap();
            done();
        }));
        ReactDOM.render(<Provider store={store}><Sink mediaType="map"/></Provider>, document.getElementById("container"));
        store.dispatch = () => {};

    });
});
