/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { Provider } from 'react-redux';

import SpatialFilterMap from '../SpatialFilterMap';

const store = {
    subscribe: () => {},
    dispatch: () => {},
    getState: () => ({
        locale: {
            currentLocale: 'en-US',
            messages: {}
        }
    })
};

describe('SpatialFilterMap component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('renders the container with a placeholder when the spatial filter is hidden', () => {
        ReactDOM.render(
            <Provider store={store}>
                <SpatialFilterMap useEmbeddedMap queryPanelEnabled hideSpatialFilter/>
            </Provider>,
            document.getElementById("container")
        );
        expect(document.querySelectorAll('.mapstore-query-map').length).toBe(1);
        expect(document.querySelectorAll('.mapstore-query-map-empty').length).toBe(1);
    });
    it('renders nothing when the query panel is closed', () => {
        ReactDOM.render(
            <Provider store={store}>
                <SpatialFilterMap useEmbeddedMap hideSpatialFilter queryPanelEnabled={false}/>
            </Provider>,
            document.getElementById("container")
        );
        expect(document.querySelectorAll('.mapstore-query-map').length).toBe(0);
    });
    it('renders nothing when the embedded map is not used', () => {
        ReactDOM.render(
            <Provider store={store}>
                <SpatialFilterMap useEmbeddedMap={false} queryPanelEnabled hideSpatialFilter/>
            </Provider>,
            document.getElementById("container")
        );
        expect(document.querySelectorAll('.mapstore-query-map').length).toBe(0);
    });
});
