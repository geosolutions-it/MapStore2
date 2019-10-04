/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink, setObservableConfig} = require('recompose');
const rxjsConfig = require('recompose/rxjsObservableConfig').default;
setObservableConfig(rxjsConfig);
const expect = require('expect');
const MapCatalog = require('../MapCatalog');
const mapCatalog = require('../enhancers/mapCatalog');
const mapCatalogWithEmptymap = require('../enhancers/mapCatalogWithEmptyMap');
const GeoStoreDAO = require('../../../api/GeoStoreDAO');

describe('MapCatalog component', () => {
    let oldAddBaseUri;
    beforeEach((done) => {
        oldAddBaseUri = GeoStoreDAO.addBaseUrl;
        GeoStoreDAO.addBaseUrl = (options) => {
            return {...options, baseURL: 'base/web/client/test-resources/geostore/extjs/search/category/MAP/1.json#' };
        };
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        GeoStoreDAO.addBaseUrl = oldAddBaseUri;
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MapCatalog rendering with defaults', () => {
        ReactDOM.render(<MapCatalog />, document.getElementById("container"));
        expect(document.querySelector('input')).toExist();
        expect(document.querySelector('.map-catalog')).toExist();
    });
    it('MapCatalog rendering with items and text', () => {
        ReactDOM.render(<MapCatalog searchText="MAP" items={[{
            title: "MAP",
            description: "description"
        }]}/>, document.getElementById("container"));
        expect(document.querySelector('input')).toExist();
        expect(document.querySelector('input').value).toBe("MAP");
        expect(document.querySelector('.map-catalog')).toExist();
        expect(document.querySelectorAll('.mapstore-side-card').length).toBe(1);
    });

    it('MapCatalog rendering with items and text, with null title', () => {
        ReactDOM.render(<MapCatalog searchText="MAP" title={null} items={[{
            title: "",
            description: "description"
        }]}/>, document.getElementById("container"));
        expect(document.querySelector('input')).toExist();
        expect(document.querySelector('input').value).toBe("MAP");
        expect(document.querySelector('.map-catalog')).toExist();
        const h4 = document.querySelector('.text-center h4');
        expect(h4).toNotExist();
        expect(document.querySelectorAll('.mapstore-side-card').length).toBe(1);
    });

    it('mapCatalog enhancer', (done) => {
        const Sink = mapCatalog(createSink( props => {
            if (props.items && props.items.length > 0) {
                expect(props).toExist();
                const item = props.items[0];
                expect(props.skip).toNotExist();
                expect(item).toExist();
                expect(item.title).toExist();
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('mapCatalogWithEmptyMap enhancer', (done) => {
        const Sink = mapCatalogWithEmptymap(createSink(props => {
            if (props.items && props.items.length > 0) {
                expect(props).toExist();
                const item = props.items[0];
                expect(props.skip).toBe(1);
                expect(item).toExist();
                expect(item.title).toExist();
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
});
