/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var I18N = require('../I18N');

var ita = {
    "locale": "it-IT",
    "messages": {
        "aboutLbl": "<h2>Info</h2>"
    }
};
var eng = {
    "locale": "en-US",
    "messages": {
        "aboutLbl": "<h2>About</h2>"
    }
};

describe('This test for I18N.HTML', () => {
    const msgId = "aboutLbl";
    const data = {
        "en-US": eng,
        "it-IT": ita
    };

    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks if the component renders english messages in HTML', () => {
        var currentData = data["en-US"];
        var testMsg = currentData.messages[msgId];

        const cmp = React.render(<I18N.HTML msgId={msgId} messages={eng.messages} locale="en-US"/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toBe(testMsg);
    });

    it('checks if the component renders italian messages in HTML', () => {
        var currentData = data["it-IT"];
        var testMsg = currentData.messages[msgId];

        const cmp = React.render(<I18N.HTML msgId={msgId} messages={ita.messages} locale="it-IT"/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toBe(testMsg);
    });
});
