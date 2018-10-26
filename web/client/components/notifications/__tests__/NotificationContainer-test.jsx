/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {IntlProvider} = require('react-intl');
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
        const item = ReactDOM.render(<IntlProvider><NotificationContainer /></IntlProvider>, document.getElementById("container"));
        expect(item).toExist();

    });
    it('creates the component with notifications', () => {
        const item = ReactDOM.render(<IntlProvider><NotificationContainer notifications={[N1]} /></IntlProvider>, document.getElementById("container"));
        expect(item).toExist();
        let elems = TestUtils.scryRenderedDOMComponentsWithClass(item, "notifications-tr");
        expect(elems.length).toBe(1);
    });
    it('update notifications', () => {
        let item = ReactDOM.render(<IntlProvider><NotificationContainer notifications={[N1]} /></IntlProvider>, document.getElementById("container"));
        expect(item).toExist();
        let elems = TestUtils.scryRenderedDOMComponentsWithClass(item, "notification");
        expect(elems.length).toBe(1);

        // add notification
        item = ReactDOM.render(<IntlProvider><NotificationContainer notifications={[N1, N2]} /></IntlProvider>, document.getElementById("container"));
        elems = TestUtils.scryRenderedDOMComponentsWithClass(item, "notification");
        expect(elems.length).toBe(2);

        // remove notification
        item = ReactDOM.render(<IntlProvider><NotificationContainer notifications={[N2]} /></IntlProvider>, document.getElementById("container"));
        elems = TestUtils.scryRenderedDOMComponentsWithClass(item, "notification").filter( (e) => e.className.indexOf("notification-hidden") < 0);
        expect(elems.length).toBe(1);
    });
    it('creates the component with notifications and a templating string', () => {
        const directTemplating = {
            uid: "2",
            title: "test 2",
            message: "i'm using a {variable}!",
            autodismiss: 0,
            values: {variable: "variable"},
            level: "success"
        };

        let item = ReactDOM.render(
            <IntlProvider>
                <NotificationContainer notifications={[directTemplating]} />
            </IntlProvider>, document.getElementById("container"));
        expect(item).toExist();
        let elem = TestUtils.findRenderedDOMComponentWithClass(item, "notification-message");
        expect(elem.innerText).toBe("i'm using a variable!");

    });
});
