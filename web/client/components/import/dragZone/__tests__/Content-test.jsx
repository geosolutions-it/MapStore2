/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const Content = require('../Content');
describe('Content component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults', () => {
        ReactDOM.render(<Content />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.glyphicon-upload');
        expect(el).toExist();
    });
    it('rendering with loading', () => {
        ReactDOM.render(<Content loading/>, document.getElementById("container"));
        const container = document.getElementById('container');

        expect(container.querySelector('.glyphicon-upload')).toNotExist();
        expect(container.querySelector('.mapstore-medium-size-loader')).toExist();
    });
    it('rendering with error', () => {
        ReactDOM.render(<Content error={{message: "ERROR"}} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-upload')).toNotExist();
        expect(container.querySelector('.glyphicon-exclamation-mark')).toExist();
    });
});
