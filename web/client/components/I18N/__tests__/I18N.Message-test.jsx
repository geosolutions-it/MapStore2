/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var I18NStore = require('../../../stores/I18NStore');
var I18N = require('../I18N');
var I18NActions = require('../../../actions/I18NActions');

var ita = require('../../../stores/data.it-IT');
var eng = require('../../../stores/data.en-US');

describe('This test for I18N.Message', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks if the component reacts at I18NStore edits', () => {
        var testMsg;
        var currentData;
        const msgId = "aboutLbl";
        const data = {
            "en-US": eng,
            "it-IT": ita
        };
        currentData = data[I18NStore.getCurrentLocale()];
        testMsg = currentData.messages[msgId];

        const cmp = React.render(<I18N.Message msgId={msgId}/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.innerHTML).toBe(testMsg);

        const nextLocale = I18NStore.getCurrentLocale() === "it-It" ? "en-US" : "it-IT";
        I18NStore._emulate_dispatcher({
            locale: nextLocale,
            type: I18NActions.CHANGE_LANG
        });

        currentData = data[I18NStore.getCurrentLocale()];
        testMsg = currentData.messages[msgId];
        expect(cmpDom.innerHTML).toBe(testMsg);
    });
});
