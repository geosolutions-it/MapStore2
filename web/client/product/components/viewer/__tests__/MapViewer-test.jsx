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

describe("The MapViewerPage component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        done();
    });

    afterEach((done) => {
        document.body.innerHTML = '';
        done();
    });

    it('testing creation with mapId = new', (done) => {
        /*  setting props */
        const location = document.location;
        const match = {params: {mapId: "new"}};
        const store = mockStore({});
        const mapViewerPros = { match, onInit: () => {}, loadMapConfig: (cfgUrl, mapId) => {
            expect(cfgUrl).toBe("new.json");
            expect(mapId).toBe(null);
        },
        location};
        const cmpMapViewerPage = ReactDOM.render(
            <Provider store={store}>
                <MapViewerPage {...mapViewerPros}/>
            </Provider>, document.getElementById("container"));
        expect(cmpMapViewerPage).toExist();
        done();

    });

    it('testing creation with mapId = 0', (done) => {

        const location = document.location;
        const match = {params: {mapId: 0}};
        const store = mockStore({});
        const mapViewerPros = { match, onInit: () => {}, loadMapConfig: (cfgUrl, mapId) => {
            expect(cfgUrl).toBe("config.json");
            expect(mapId).toBe(null);
        },
        location};
        const component = ReactDOM.render(
            <Provider store={store}>
                <MapViewerPage {...mapViewerPros}/>
            </Provider>, document.getElementById("container"));
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
