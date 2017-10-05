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
const EmptyView = require('../EmptyView');

describe("EmptyView component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('create EmptyView with defaults', () => {
        ReactDOM.render(<EmptyView />, document.getElementById("container"));
        const el = document.getElementsByClassName('glyphicon')[0];
        expect(el).toExist();
    });
    it('create EmptyView title, description and content', () => {
        ReactDOM.render(<EmptyView title="Title" description="description" content={<div id="content" >TEST</div>}/>, document.getElementById("container"));
        const description = document.getElementsByTagName('p')[0];
        expect(description).toExist();
        const content = document.getElementById("content");
        expect(content).toExist();
    });

});
