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
var I18NActions = require('../../../actions/I18NActions');
var LangSelector = require('../LangSelector');

describe('LangSelector', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks default', () => {
        var lbl;
        var value;

        const cmp = React.render(<LangSelector/>, document.body);
        expect(cmp).toExist();

        const cmpDom = React.findDOMNode(cmp);
        expect(cmpDom).toExist();
        expect(cmpDom.id).toNotExist();

        const select = cmpDom.getElementsByTagName("select").item(0);
        const opts = select.childNodes;
        const langs = I18NStore.getSupportedLocales();

        for (let i = 0; i < opts.length; i++) {
            lbl = opts[i].innerHTML;
            value = opts[i].value;
            expect(langs.hasOwnProperty(lbl)).toBe(true);
            expect(langs[lbl]).toBe(value);
        }
    });

    it('checks if a change of the compo fires the proper action', () => {
        const spy = expect.spyOn(I18NActions, 'launch');

        const cmp = React.render(<LangSelector/>, document.body);
        const cmpDom = React.findDOMNode(cmp);
        const select = cmpDom.getElementsByTagName("select").item(0);

        select.value = "it-IT";
        React.addons.TestUtils.Simulate.change(select, {target: {value: 'it-IT'}});
        // select.children[1].click();

        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].arguments).toEqual([I18NActions.CHANGE_LANG, {locale: "it-IT"}]);
    });
});
