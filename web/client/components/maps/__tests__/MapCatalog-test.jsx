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
const ConfigUtils = require('../../../utils/ConfigUtils');
const rxjsConfig = require('recompose/rxjsObservableConfig').default;
setObservableConfig(rxjsConfig);
const expect = require('expect');
const MapCatalog = require('../MapCatalog');
const enhancer = require('../enhancers/mapCatalog');

describe('MapCatalog component', () => {
    let defaultUrl = ConfigUtils.getConfigProp("geoStoreUrl");
    beforeEach((done) => {
        defaultUrl = ConfigUtils.getConfigProp("geoStoreUrl");
        ConfigUtils.setConfigProp("geoStoreUrl", "base/web/client/test-resources/geostore/extjs/search/category/MAP/1.json#");
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ConfigUtils.setConfigProp("geoStoreUrl", defaultUrl);
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

    it('mapCatalog enhancer', (done) => {
        const Sink = enhancer(createSink( props => {
            if (props.items && props.items.length > 0) {
                expect(props).toExist();
                const item = props.items[0];
                expect(item).toExist();
                expect(item.title).toExist();
                done();
            }
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
});
