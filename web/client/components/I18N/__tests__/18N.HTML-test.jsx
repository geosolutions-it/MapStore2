/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import I18N from '../I18N';
import Localized from '../Localized';

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
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks if the component renders english messages in HTML', () => {
        var currentData = data["en-US"];
        var testMsg = currentData.messages[msgId];

        const cmp = ReactDOM.render(<Localized messages={eng.messages} locale="en-US"><I18N.HTML msgId={msgId}/></Localized>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toBe(testMsg);
    });

    it('checks if the component renders italian messages in HTML', () => {
        var currentData = data["it-IT"];
        var testMsg = currentData.messages[msgId];

        const cmp = ReactDOM.render(<Localized messages={ita.messages} locale="it-IT"><I18N.HTML msgId={msgId}/></Localized>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toBe(testMsg);
    });
});
