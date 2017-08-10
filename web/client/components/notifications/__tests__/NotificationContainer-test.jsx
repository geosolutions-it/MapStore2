/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const NotificationContainer = require('../NotificationContainer.jsx');
const expect = require('expect');

const TestUtils = require('react-dom/test-utils');
const N1 = {
    uid: "1",
    title: "test 1",
    message: "test 1",
    autodismiss: 0,
    level: "success"
};

const N2 = {
    uid: "2",
    title: "test 2",
    message: "test 2",
    autodismiss: 0,
    level: "success"
};

describe('NotificationContainer tests', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    // test DEFAULTS
    it('creates the component with defaults', () => {
        const item = ReactDOM.render(<NotificationContainer />, document.getElementById("container"));
        expect(item).toExist();

    });
    it('creates the component with notifications', () => {
        const item = ReactDOM.render(<NotificationContainer notifications={[N1]} />, document.getElementById("container"));
        expect(item).toExist();
        let elems = TestUtils.scryRenderedDOMComponentsWithClass(item, "notifications-tr");
        expect(elems.length).toBe(1);
    });
    it('update notifications', () => {
        let item = ReactDOM.render(<NotificationContainer notifications={[N1]} />, document.getElementById("container"));
        expect(item).toExist();
        let elems = TestUtils.scryRenderedDOMComponentsWithClass(item, "notification");
        expect(elems.length).toBe(1);

        // add notification
        item = ReactDOM.render(<NotificationContainer notifications={[N1, N2]} />, document.getElementById("container"));
        elems = TestUtils.scryRenderedDOMComponentsWithClass(item, "notification");
        expect(elems.length).toBe(2);

        // remove notification
        item = ReactDOM.render(<NotificationContainer notifications={[N2]} />, document.getElementById("container"));
        elems = TestUtils.scryRenderedDOMComponentsWithClass(item, "notification").filter( (e) => e.className.indexOf("notification-hidden") < 0);
        expect(elems.length).toBe(1);
    });
});
