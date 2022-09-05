/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MapViewerCmp from '../MapViewerCmp';
import MapViewerContainer from '../../../../containers/MapViewer';
import configureStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
const mockStore = configureStore([thunkMiddleware]);
const store = mockStore({});
const location = document.location;

const renderMapViewerComp = (mapViewerPros) => {
    return ReactDOM.render(
        <Provider store={store}>
            <MapViewerCmp {...mapViewerPros}/>
        </Provider>, document.getElementById("container"));
};

describe("Test the MapViewerCmp component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('testing creation with defaults', () => {
        const mapViewerPros = { wrappedContainer: MapViewerContainer };
        const cmpMapViewerCmp = renderMapViewerComp(mapViewerPros);
        expect(cmpMapViewerCmp).toExist();
    });

    it('testing creation with mapId = new', () => {
        const match = {params: {mapId: "new"}};
        const mapViewerPros = { match, location, onInit: () => {},
            wrappedContainer: MapViewerContainer,
            loadMapConfig: (cfgUrl, mapId) => {
                expect(cfgUrl).toBe("new.json");
                expect(mapId).toBe(null);
            }};
        const cmpMapViewerCmp = renderMapViewerComp(mapViewerPros);
        expect(cmpMapViewerCmp).toExist();
    });

    it('testing creation with mapId = anyString', () => {
        const match = {params: {mapId: "anyString"}};
        const mapViewerPros = { match, location, onInit: () => {},
            wrappedContainer: MapViewerContainer,
            loadMapConfig: (cfgUrl, mapId) => {
                expect(cfgUrl).toBe("anyString.json");
                expect(mapId).toBe(null);
            }};
        const cmpMapViewerCmp = renderMapViewerComp(mapViewerPros);
        expect(cmpMapViewerCmp).toExist();
    });

    it('testing creation with mapId = 0', () => {
        const match = {params: {mapId: 0}};
        const mapViewerPros = { match, location, onInit: () => {},
            wrappedContainer: MapViewerContainer,
            loadMapConfig: (cfgUrl, mapId) => {
                expect(cfgUrl).toBe("config.json");
                expect(mapId).toBe(null);
            }};
        const component = renderMapViewerComp(mapViewerPros);
        expect(component).toExist();
    });

    it('testing creation with mapId = 1', () => {
        const match = {params: {mapId: 1}};
        const mapViewerPros = { match, location, onInit: () => {},
            wrappedContainer: MapViewerContainer,
            loadMapConfig: (cfgUrl, mapId) => {
                expect(cfgUrl).toBe("/rest/geostore/data/1");
                expect(mapId).toBe(1);
            }};
        const component = renderMapViewerComp(mapViewerPros);
        expect(component).toExist();
    });
    it('testing update of map on mapId change', (done) => {
        let count = 1;
        const match = { params: { mapId: 1 } };
        const match2 = { params: { mapId: 2 } };
        const mapViewerPros = {
            match, location, onInit: () => { },
            wrappedContainer: MapViewerContainer,
            pluginsConfig: [],
            plugins: {},
            loadMapConfig: (cfgUrl, mapId) => {
                expect(cfgUrl).toBe(`/rest/geostore/data/${count}`);
                expect(mapId).toBe(count);
                count++;
                if (count === 3) {
                    done();
                }
            }
        };
        // override location force re-render. (not sure check location is correct)
        renderMapViewerComp({ ...mapViewerPros, location: { ...location }});
        // render second time
        setTimeout(() => {
            const component = renderMapViewerComp({ ...mapViewerPros, match: match2, location: {...location}});
            expect(component).toExist();
        }, 300);
    });

});
