/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import HelpBadge from '../HelpBadge';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';

describe('Test for HelpBadge', () => {
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
        const helpBadge = ReactDOM.render(<HelpBadge/>, document.getElementById("container"));
        expect(helpBadge).toExist();

        const helpToggleBtnDom = ReactDOM.findDOMNode(helpBadge);
        expect(helpToggleBtnDom).toExist();
        expect(helpToggleBtnDom.className.indexOf('badge') >= 0).toBe(true);
        expect(helpToggleBtnDom.className.indexOf('hidden') >= 0).toBe(true);
        expect(helpToggleBtnDom.innerHTML).toBe("?");
    });

    it('creates the component with custom props', () => {
        const helpBadge = ReactDOM.render(<HelpBadge
            id="fooid"
            isVisible
            className="foofoo"
        />, document.getElementById("container"));
        expect(helpBadge).toExist();

        const helpBadgeDom = ReactDOM.findDOMNode(helpBadge);
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
        const helpBadge = ReactDOM.render(<HelpBadge
            changeHelpText={onMouseOverFn.changeHelpText}
            changeHelpwinVisibility={onMouseOverFn.changeHelpwinVisibility}/>, document.getElementById("container"));
        expect(helpBadge).toExist();
        const helpBadgeDom = ReactDOM.findDOMNode(helpBadge);
        expect(helpBadgeDom).toExist();

        TestUtils.Simulate.mouseOver(helpBadgeDom);

        expect(triggered).toBe(2);
    });

});
