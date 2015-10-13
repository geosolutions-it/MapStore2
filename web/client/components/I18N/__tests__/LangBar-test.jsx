/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var LangBar = require('../LangBar');
var LocaleUtils = require('../../../utils/LocaleUtils');

describe('LangBar', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks default', () => {

        const cmp = React.render(<LangBar/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const buttons = cmpDom.getElementsByTagName("button");

        expect(buttons.length === LocaleUtils.getSupportedLocales().length);

    });

    it('checks button click fires the proper action', () => {
        let newLang;
        const cmp = React.render(<LangBar onLanguageChange={ (lang) => {newLang = lang; }}/>, document.body);
        const cmpDom = React.findDOMNode(cmp);
        const select = cmpDom.getElementsByTagName("button").item(0);

        select.value = "it-IT";
        React.addons.TestUtils.Simulate.click(select, {target: {value: 'it-IT'}});
        // select.children[1].click();

        expect(newLang).toBe('it-IT');
    });
});
