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
// const assign = require('object-assign');
const Provider = require('react-redux').Provider;
const MapViewerPage = require('../MapViewer');
const {INIT_MAP} = require('../../../actions/map');
const {MAP_CONFIG_LOAD_ERROR} = require('../../../actions/config');
const ReactTestUtils = require('react-dom/test-utils');


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
        const configureStore = require('redux-mock-store').default;

        // const middlewares = [];
        const thunkMiddleware = require('redux-thunk');
        const mockStore = configureStore([thunkMiddleware]);
        const location = document.location;
        const match = {params: {mapId: "new"}};
        const store = mockStore({});

        const mapViewerPros = { match, onInit: () => {}, location};
        const cmpMapViewerPage = ReactDOM.render(
            <Provider store={store} key="1">
                <MapViewerPage {...mapViewerPros}/>
            </Provider>, document.getElementById("container"));
        expect(cmpMapViewerPage).toExist();
        setTimeout(() => {
            const actions = store.getActions();
            expect(actions[0].type).toBe(INIT_MAP);
            expect(actions[1].type).toBe(MAP_CONFIG_LOAD_ERROR);
            expect(actions[1].error.config.url).toBe("new.json");
            expect(actions[1].mapId).toBe(null);
            done();
        }, 300);

    });

    it('testing creation with mapId = 0', () => {
        const configureStore = require('redux-mock-store').default;

        // const middlewares = [];
        const thunkMiddleware = require('redux-thunk');
        const mockStore = configureStore([thunkMiddleware]);
        const location = document.location;
        const match = {params: {mapId: "new"}};
        const store = mockStore({});
        const mapViewerPros = { match, onInit: () => {}, location};
        const component = ReactTestUtils.renderIntoDocument(<Provider store={store} key="1">
            <MapViewerPage {...mapViewerPros}/>
        </Provider>);
        component.componentWillMount();

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
