/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const QueryToolbar = require('../QueryToolbar');
describe('QueryToolbar component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('QueryToolbar rendering with defaults', () => {
        ReactDOM.render(<QueryToolbar />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.query-toolbar');
        expect(el).toExist();
    });
    it('QueryToolbar check empty filter warning', () => {
        ReactDOM.render(<QueryToolbar emptyFilterWarning allowEmptyFilter spatialField={{}} crossLayerFilter={{attribute: "ATTR", operation: undefined}}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#query-toolbar-query.showWarning');
        expect(el).toExist();
        ReactDOM.render(<QueryToolbar emptyFilterWarning allowEmptyFilter spatialField={{}} crossLayerFilter={{attribute: "ATTR", operation: "INTERSECT"}}/>, document.getElementById("container"));
        expect(container.querySelector('#query-toolbar-query.showWarning')).toNotExist();
        expect(container.querySelector('#query-toolbar-query')).toExist();
        ReactDOM.render(<QueryToolbar emptyFilterWarning allowEmptyFilter spatialField={{geometry: {}}} crossLayerFilter={{attribute: "ATTR", operation: undefined}}/>, document.getElementById("container"));
        expect(container.querySelector('#query-toolbar-query.showWarning')).toNotExist();

    });
});
