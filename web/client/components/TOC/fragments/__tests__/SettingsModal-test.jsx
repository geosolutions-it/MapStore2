/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const SettingsModal = require('../SettingsModal');
const expect = require('expect');

// const TestUtils = require('react-dom/test-utils');

describe('TOC SettingsModal', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render component', () => {

        const cmp = ReactDOM.render(<SettingsModal/>, document.getElementById("container"));
        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();

    });
});
