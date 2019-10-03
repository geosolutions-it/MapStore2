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
const Sidebar = require('../Sidebar');
const SidebarHeader = require('../SidebarHeader');

describe("Sidebar component", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('create Sidebar with content', () => {
        ReactDOM.render(<Sidebar open>
            <div id="content" />
        </Sidebar>, document.getElementById("container"));
        const el = document.getElementById('content');
        expect(el).toExist();
    });
    it('create Sidebar wjth title and content', () => {
        ReactDOM.render(<Sidebar open>
            <SidebarHeader title={<span id="content">content</span>} />
        </Sidebar>, document.getElementById("container"));
        const titleContainer = document.getElementsByClassName('sidebar-title')[0];
        expect(titleContainer).toExist();
        const content = document.getElementById("content");
        expect(content).toExist();
    });

});
