/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var Localized = require('../Localized');
var Message = require('../Message');
var HTML = require('../HTML');

const messages = {
    "testMsg": "my message"
};

describe('Test the localization support HOC', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('localizes wrapped Message component', () => {
        var localized = React.render(
            <Localized locale="it-IT" messages={messages}>
                {() => <Message msgId="testMsg"/> }
            </Localized>
            , document.body);
        var dom = React.findDOMNode(localized);
        expect(dom).toExist();
        expect(dom.innerHTML).toBe("my message");
    });

    it('localizes wrapped HTML component', () => {
        var localized = React.render(
            <Localized locale="it-IT" messages={messages}>
                {() => <HTML msgId="testMsg"/> }
            </Localized>
            , document.body);
        var dom = React.findDOMNode(localized);
        expect(dom).toExist();
        expect(dom.innerHTML).toBe("my message");
    });

    it('tests localized component without messages', () => {
        var localized = React.render(
            <Localized locale="it-IT">
                {() => <HTML msgId="testMsg"/> }
            </Localized>
            , document.body);
        var dom = React.findDOMNode(localized);
        expect(dom).toNotExist();
    });
});
