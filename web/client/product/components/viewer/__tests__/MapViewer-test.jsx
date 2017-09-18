/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const Provider = require('react-redux').Provider;
const MapViewerPage = require('../MapViewer');
const configureStore = require('redux-mock-store').default;
const thunkMiddleware = require('redux-thunk');
const mockStore = configureStore([thunkMiddleware]);
const store = mockStore({});
const location = document.location;

const renderMapViewerComp = (mapViewerPros) => {
    return ReactDOM.render(
        <Provider store={store}>
            <MapViewerPage {...mapViewerPros}/>
        </Provider>, document.getElementById("container"));
};

describe("The MapViewerPage component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        done();
    });

    afterEach((done) => {
        document.body.innerHTML = '';
        done();
    });

    it('testing creation with defaults', (done) => {
        const mapViewerPros = {};
        const cmpMapViewerPage = renderMapViewerComp(mapViewerPros);
        expect(cmpMapViewerPage).toExist();
        done();
    });

    it('testing creation with mapId = new', (done) => {
        const match = {params: {mapId: "new"}};
        const mapViewerPros = { match, location, onInit: () => {},
            loadMapConfig: (cfgUrl, mapId) => {
                expect(cfgUrl).toBe("new.json");
                expect(mapId).toBe(null);
            }};
        const cmpMapViewerPage = renderMapViewerComp(mapViewerPros);
        expect(cmpMapViewerPage).toExist();
        done();
    });

    it('testing creation with mapId = anyString', (done) => {
        const match = {params: {mapId: "anyString"}};
        const mapViewerPros = { match, location, onInit: () => {},
            loadMapConfig: (cfgUrl, mapId) => {
                expect(cfgUrl).toBe("anyString.json");
                expect(mapId).toBe(null);
            }};
        const cmpMapViewerPage = renderMapViewerComp(mapViewerPros);
        expect(cmpMapViewerPage).toExist();
        done();
    });

    it('testing creation with mapId = 0', (done) => {
        const match = {params: {mapId: 0}};
        const mapViewerPros = { match, location, onInit: () => {},
            loadMapConfig: (cfgUrl, mapId) => {
                expect(cfgUrl).toBe("config.json");
                expect(mapId).toBe(null);
            }};
        const component = renderMapViewerComp(mapViewerPros);
        expect(component).toExist();
        done();
    });

    it('testing creation with mapId = 1', (done) => {
        const match = {params: {mapId: 1}};
        const mapViewerPros = { match, location, onInit: () => {},
            loadMapConfig: (cfgUrl, mapId) => {
                expect(cfgUrl).toBe("/mapstore/rest/geostore/data/1");
                expect(mapId).toBe(1);
            }};
        const component = renderMapViewerComp(mapViewerPros);
        expect(component).toExist();
        done();
    });
/*
    it('testing creation with mapId = 0', () => {
        const props = assign({}, {...mapViewerPros}, {match: {params: {mapId: 0}}});
        const cmpMapViewerPage2 = ReactDOM.render(
            <Provider store={store}>
                <MapViewerPage {...props}/>
            </Provider>, document.getElementById("container"));
        expect(cmpMapViewerPage2).toExist();
        expect(spyLoadMapConfig).toHaveBeenCalled();
        expect(spyLoadMapConfig).toHaveBeenCalledWith("config.json", null);
    });

    it('testing creation with mapId = 1', () => {
        const props = assign({}, {...mapViewerPros}, {match: {params: {mapId: 1}}});
        const cmpMapViewerPage1 = ReactDOM.render(
            <Provider store={store}>
                <MapViewerPage {...props}/>
            </Provider>, document.getElementById("container"));
        expect(cmpMapViewerPage1).toExist();
        expect(spyLoadMapConfig).toHaveBeenCalled();
        expect(spyLoadMapConfig).toHaveBeenCalledWith("/mapstore/rest/geostore/data/1", 1);
    });

    it('is created with defaults', () => {
        const cmpMapViewerPage = ReactDOM.render( <Provider store={store}><MapViewerPage/></Provider>, document.getElementById("container"));
        expect(cmpMapViewerPage).toExist();
    });*/
});
