/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import Map from '../Map';
import { Provider } from 'react-redux';
import ReactTestUtils from 'react-dom/test-utils';
import '../../../../libs/bindings/rxjsRecompose';

describe('Map component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with defaults', () => {
        const mockStore = { subscribe: () => {}, getState: () => ({}) };
        ReactDOM.render(<Provider store={mockStore}><Map /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const mediaMapNode = container.querySelector('.ms-media-map');
        expect(mediaMapNode).toBeTruthy();
    });
    it('should show buttons to expand map', (done) => {
        const mockStore = { subscribe: () => {}, getState: () => ({}) };
        ReactDOM.render(<Provider store={mockStore}>
            <Map expandable
                mapType="openlayers"
                onMapTypeLoaded={() => {
                    const container = document.getElementById('container');
                    const mediaMapNode = container.querySelector('.ms-media-map');
                    expect(mediaMapNode).toBeTruthy();
                    expect(mediaMapNode.children.length).toBe(2);
                    expect(document.body.children.length).toBe(1);
                    const expandMediaButtonNode = mediaMapNode.querySelector('.ms-expand-media-button');
                    expect(expandMediaButtonNode).toBeTruthy();
                    ReactTestUtils.Simulate.click(expandMediaButtonNode);
                    expect(mediaMapNode.children.length).toBe(0);
                    expect(document.body.children.length).toBe(2);
                    expect(document.body.children[1].getAttribute('class')).toBe('ms-expanded-media-container');
                    done();
                }}
            />
        </Provider>, document.getElementById("container"));
    });
    it('should use cursor pointer with active map info control', (done) => {
        const MAP = {
            layers: [],
            mapInfoControl: true
        };
        ReactDOM.render(
            <Map
                id="map"
                mapType="openlayers"
                map={MAP}
                onMapTypeLoaded={() => {
                    const container = document.getElementById('container');
                    const mediaMapNode = container.querySelector('.ms-media-map');
                    expect(mediaMapNode).toBeTruthy();
                    const mapContainer = container.querySelector('#media-map');
                    expect(mapContainer).toBeTruthy();
                    expect(mapContainer.style.cursor).toBe('pointer');
                    done();
                }}
            />,
            document.getElementById("container"));
    });
});
