/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const SearchResultList = require('../SearchResultList');
const SearchResult = require('../SearchResult');
const TestUtils = require('react-dom/test-utils');

const results = [{
    id: "ID",
    properties: {
        prop1: 1
    },
    __SERVICE__: {
        subTitle: "TEST",
        displayName: "${properties.prop1}",
        idField: "id"
    }
}];

describe("test the SearchResultList", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test component creation', () => {
        const tb = ReactDOM.render(<SearchResultList results={results}/>, document.getElementById("container"));
        expect(tb).toExist();
    });

    it('create component without items', () => {
        const tb = ReactDOM.render(<SearchResultList />, document.getElementById("container"));
        expect(tb).toExist();
    });

    it('create component with empty items array', () => {
        const tb = ReactDOM.render(<SearchResultList results={[]} notFoundMessage="not found"/>, document.getElementById("container"));
        expect(tb).toExist();
    });


    it('test fit map Size', () => {
        const res = Array.from(Array(100).keys()).map((i) => ({
            id: i,
            properties: {
                prop: i
            }
        }));
        const cmp = ReactDOM.render(<SearchResultList mapConfig={{size: {width: 200, height: 200}}} sizeAdjustment={{width: 100, height: 120}} fitToMapSize results={res} notFoundMessage="not found"/>, document.getElementById("container"));
        expect(cmp).toExist();
        let list = TestUtils.findRenderedDOMComponentWithClass(cmp, "search-result-list");
        expect(list.offsetHeight).toBe(80);
        expect(list.offsetWidth).toBe(100);
    });
    it('get service info from internal object', () => {
        let tb = ReactDOM.render(<SearchResultList results={results} notFoundMessage="not found"/>, document.getElementById("container"));
        expect(tb).toExist();

        let title = TestUtils.findRenderedDOMComponentWithClass(tb, "text-result-title");
        let subTitle = TestUtils.findRenderedDOMComponentWithClass(tb, "text-info");

        expect(title.textContent).toBe("1");
        expect(subTitle.textContent).toBe("TEST");

    });
    it('get service info from search Options by id', () => {
        const tb = ReactDOM.render(<SearchResultList searchOptions={{
            services: [{
                id: "S1",
                displayName: "S1",
                subTitle: "S1"
            }]
        }} results={[{
            id: "ID",
            properties: {
                prop1: 1
            },
            __SERVICE__: "S1"
        }]} notFoundMessage="not found"/>, document.getElementById("container"));
        expect(tb).toExist();

        let title = TestUtils.findRenderedDOMComponentWithClass(tb, "text-result-title");
        let subTitle = TestUtils.findRenderedDOMComponentWithClass(tb, "text-info");

        expect(title.textContent).toBe("S1");
        expect(subTitle.textContent).toBe("S1");

    });
    it('get service info from search Options by type', () => {
        const tb = ReactDOM.render(<SearchResultList searchOptions={{
            services: [{
                id: "S1",
                displayName: "S1",
                subTitle: "S1"
            }]
        }} results={[{
            id: "ID",
            properties: {
                prop1: 1
            },
            __SERVICE__: "S1"
        }]} notFoundMessage="not found"/>, document.getElementById("container"));
        expect(tb).toExist();

        let title = TestUtils.findRenderedDOMComponentWithClass(tb, "text-result-title");
        let subTitle = TestUtils.findRenderedDOMComponentWithClass(tb, "text-info");

        expect(title.textContent).toBe("S1");
        expect(subTitle.textContent).toBe("S1");

    });

    it('test click handler', () => {
        const testHandlers = {
            clickHandler: () => {},
            afterClick: () => {}
        };
        var items = [{
            osm_id: 1,
            display_name: "Name",
            boundingbox: [1, 2, 3, 4]
        }];
        const spy = expect.spyOn(testHandlers, 'clickHandler');
        const mapConfig = {size: 100, projection: "EPSG:4326"};
        const resultsStyle = {color: '#ff0000'};
        var tb = ReactDOM.render(<SearchResultList results={items} mapConfig={mapConfig} resultsStyle={resultsStyle}
            onItemClick={testHandlers.clickHandler}
            afterItemClick={testHandlers.afterItemClick}/>, document.getElementById("container"));
        let elem = TestUtils.scryRenderedComponentsWithType(tb, SearchResult);
        expect(elem.length).toBe(1);

        let elem1 = TestUtils.findRenderedDOMComponentWithClass(elem[0], "search-result");
        ReactDOM.findDOMNode(elem1).click();
        expect(spy.calls.length).toEqual(1);
        expect(spy).toHaveBeenCalledWith(items[0], mapConfig, resultsStyle);
    });


});
