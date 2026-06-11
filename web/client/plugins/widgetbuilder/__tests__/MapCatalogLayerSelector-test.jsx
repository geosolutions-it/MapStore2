/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Simulate } from 'react-dom/test-utils';

import MapCatalogLayerSelector from '../MapCatalogLayerSelector';

const makeStore = (layers = []) => ({
    subscribe: () => () => {},
    getState: () => ({
        layers: { flat: layers },
        locale: { current: 'en-US' }
    }),
    dispatch: () => {}
});

describe('MapCatalogLayerSelector plugin', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders the layer selector chrome', () => {
        const store = makeStore([{ id: 'l1', name: 'roads', search: { url: 'x' } }]);
        ReactDOM.render(
            <Provider store={store}>
                <MapCatalogLayerSelector editorData={{ widgetType: 'filter' }} />
            </Provider>,
            document.getElementById('container')
        );
        expect(document.querySelector('.layer-selector')).toExist();
    });

    it('calls toggleLayerSelector(false) when the back button is clicked', () => {
        const store = makeStore([{ id: 'l1', name: 'roads', search: { url: 'x' } }]);
        let toggled;
        ReactDOM.render(
            <Provider store={store}>
                <MapCatalogLayerSelector
                    editorData={{ widgetType: 'filter' }}
                    toggleLayerSelector={(v) => { toggled = v; }}
                />
            </Provider>,
            document.getElementById('container')
        );
        const backGlyph = document.querySelector('.glyphicon-arrow-left');
        expect(backGlyph).toExist();
        const backButton = backGlyph.closest('button');
        expect(backButton).toExist();
        Simulate.click(backButton);
        expect(toggled).toBe(false);
    });
});
