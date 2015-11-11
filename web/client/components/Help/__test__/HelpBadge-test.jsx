/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var HelpBadge = require('../HelpBadge');
var expect = require('expect');
var ReactTestUtils = React.addons.TestUtils;

describe('Test for HelpBadge', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const helpBadge = React.render(<HelpBadge/>, document.body);
        expect(helpBadge).toExist();

        const helpToggleBtnDom = React.findDOMNode(helpBadge);
        expect(helpToggleBtnDom).toExist();
        expect(helpToggleBtnDom.className.indexOf('badge') >= 0).toBe(true);
        expect(helpToggleBtnDom.className.indexOf('hidden') >= 0).toBe(true);
        expect(helpToggleBtnDom.innerHTML).toBe("?");
    });

    it('creates the component with custom props', () => {
        const helpBadge = React.render(<HelpBadge
                        id="fooid"
                        isVisible={true}
                        className="foofoo"
                        />, document.body);
        expect(helpBadge).toExist();

        const helpBadgeDom = React.findDOMNode(helpBadge);
        expect(helpBadgeDom).toExist();
        expect(helpBadgeDom.id).toExist();
        expect(helpBadgeDom.className.indexOf('foofoo') >= 0).toBe(true);
        expect(helpBadgeDom.className.indexOf('hidden') < 0).toBe(true);
    });

    it('test mouseover triggers correct functions', () => {
        var triggered = 0;
        const onMouseOverFn = {
            changeHelpText: () => {triggered++; },
            changeHelpwinVisibility: () => {triggered++; }
        };
        const helpBadge = React.render(<HelpBadge
            changeHelpText={onMouseOverFn.changeHelpText}
            changeHelpwinVisibility={onMouseOverFn.changeHelpwinVisibility}/>, document.body);
        expect(helpBadge).toExist();
        const helpBadgeDom = React.findDOMNode(helpBadge);
        expect(helpBadgeDom).toExist();

        ReactTestUtils.Simulate.mouseOver(helpBadgeDom);

        expect(triggered).toBe(2);
    });

});
