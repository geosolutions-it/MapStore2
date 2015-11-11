/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var HelpToggleBtn = require('../HelpToggleBtn');
var expect = require('expect');

describe('Test for HelpToggleBtn', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const helpToggleBtn = React.render(<HelpToggleBtn/>, document.body);
        expect(helpToggleBtn).toExist();

        const helpToggleBtnDom = React.findDOMNode(helpToggleBtn);
        expect(helpToggleBtnDom).toExist();

        const icons = helpToggleBtnDom.getElementsByTagName('span');
        expect(icons.length).toBe(1);

        expect(helpToggleBtnDom.className.indexOf('default') >= 0).toBe(true);
        expect(helpToggleBtnDom.innerHTML).toExist();
    });

    it('test button state', () => {
        const helpToggleBtn = React.render(<HelpToggleBtn pressed/>, document.body);
        expect(helpToggleBtn).toExist();

        const helpToggleBtnDom = React.findDOMNode(helpToggleBtn);

        expect(helpToggleBtnDom.className.indexOf('primary') >= 0).toBe(true);
    });

    it('test click handler calls right functions', () => {
        var triggered = 0;
        const clickFn = {
            changeHelpState: () => {triggered++; },
            changeHelpwinVisibility: () => {triggered++; }
        };
        // const spy = expect.spyOn(testHandlers, 'onClick');
        const helpToggleBtn = React.render(<HelpToggleBtn
            pressed
            changeHelpState={clickFn.changeHelpState}
            changeHelpwinVisibility={clickFn.changeHelpwinVisibility}/>, document.body);

        const helpToggleBtnDom = React.findDOMNode(helpToggleBtn);
        helpToggleBtnDom.click();

        expect(triggered).toEqual(2);
    });

});
