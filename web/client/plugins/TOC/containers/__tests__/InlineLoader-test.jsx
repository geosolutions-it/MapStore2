/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import InlineLoaderComp from '../InlineLoader';
import { Provider } from 'react-redux';

const renderWithStore = (props = {}, state = {}) => {
    const testStore = {
        dispatch: () => {},
        subscribe: () => {},
        getState: () => ({
            layers: {
                flat: [],
                layerTransientProps: {},
                ...state.layers
            },
            ...state
        })
    };
    return ReactDOM.render(
        <Provider store={testStore}>
            <InlineLoaderComp {...props} />
        </Provider>,
        document.getElementById("container")
    );
};

describe('InlineLoader container', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render hidden by default when node is not loading', () => {
        renderWithStore();
        expect(document.querySelector('.inline-loader-container')).toBeTruthy();
        expect(document.querySelector('.inline-loader-bar').style.display).toBe('none');
    });

    it('should render hidden when layer is not loading in store', () => {
        renderWithStore(
            { node: { id: 'layer-1' }, nodeType: 'layers' },
            { layers: { layerTransientProps: { 'layer-1': { loading: false } } } }
        );
        expect(document.querySelector('.inline-loader-bar').style.display).toBe('none');
    });

    it('should render visible when layer is loading in store', () => {
        renderWithStore(
            { node: { id: 'layer-1' }, nodeType: 'layers' },
            { layers: { layerTransientProps: { 'layer-1': { loading: true } } } }
        );
        expect(document.querySelector('.inline-loader-bar').style.display).toBe('block');
    });

    it('should render visible when a nested layer of a group is loading in store', () => {
        renderWithStore(
            { node: { id: 'group-1', nodes: [{ id: 'layer-1' }, { id: 'group-2', nodes: [{ id: 'layer-2' }] }] }, nodeType: 'groups' },
            { layers: { layerTransientProps: { 'layer-1': { loading: false }, 'layer-2': { loading: true } } } }
        );
        expect(document.querySelector('.inline-loader-bar').style.display).toBe('block');
    });

    it('should render hidden when no layer of a group is loading in store', () => {
        renderWithStore(
            { node: { id: 'group-1', nodes: [{ id: 'layer-1' }] }, nodeType: 'groups' },
            { layers: { layerTransientProps: { 'group-1': { loading: true }, 'layer-1': { loading: false } } } }
        );
        expect(document.querySelector('.inline-loader-bar').style.display).toBe('none');
    });
});
