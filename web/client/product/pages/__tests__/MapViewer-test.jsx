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
const assign = require('object-assign');
const Provider = require('react-redux').Provider;
const MapViewerPage = require('../MapViewer');

/*  setting props */
const store = require('../../../examples/myapp/stores/myappstore');
const location = document.location;
const actions = {
    loadMapConfig: () => {}
};
const spyLoadMapConfig = expect.spyOn(actions, 'loadMapConfig');
const match = {params: {mapId: "new"}};

const mapViewerPros = {loadMapConfig: spyLoadMapConfig, match, onInit: () => {}, location};
describe("The MapViewerPage component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('testing creation with mapId = new or 0', (done) => {
        setTimeout(() => {
            const cmpMapViewerPage = ReactDOM.render(
            <Provider store={store}>
                <MapViewerPage {...mapViewerPros}/>
            </Provider>, document.getElementById("container"));
            expect(cmpMapViewerPage).toExist();
            expect(spyLoadMapConfig).toHaveBeenCalled();
            expect(spyLoadMapConfig).toHaveBeenCalledWith("config.json", null);

            const props = assign({}, {...mapViewerPros}, {match: {params: {mapId: 0}}});

            const cmpMapViewerPage2 = ReactDOM.render(
                <Provider store={store}>
                    <MapViewerPage {...props}/>
                </Provider>, document.getElementById("container"));
            expect(cmpMapViewerPage2).toExist();
            expect(spyLoadMapConfig).toHaveBeenCalled();
            expect(spyLoadMapConfig).toHaveBeenCalledWith("config.json", null);
        }, 150);
        done();
    });

    it('testing creation with mapId = 1', (done) => {
        setTimeout(() => {
            const props = assign({}, {...mapViewerPros}, {match: {params: {mapId: 1}}});
            const cmpMapViewerPage1 = ReactDOM.render(
                <Provider store={store}>
                    <MapViewerPage {...props}/>
                </Provider>, document.getElementById("container"));
            expect(cmpMapViewerPage1).toExist();
            expect(spyLoadMapConfig).toHaveBeenCalled();
            expect(spyLoadMapConfig).toHaveBeenCalledWith("/mapstore/rest/geostore/data/1", 1);
        }, 150);
        done();
    });

    it('is created with defaults', (done) => {
        setTimeout(() => {
            const cmpMapViewerPage = ReactDOM.render( <Provider store={store}><MapViewerPage/></Provider>, document.getElementById("container"));
            expect(cmpMapViewerPage).toExist();
        }, 150);
        done();
    });


});
