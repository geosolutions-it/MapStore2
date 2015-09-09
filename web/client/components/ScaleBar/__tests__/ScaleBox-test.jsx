/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var expect = require('expect');
var ScaleBox = require('../ScaleBox.jsx');

describe('This test for ScaleBar', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const scalebox = React.render(<ScaleBox/>, document.body);
        expect(scalebox).toExist();

        const scaleboxDom = React.findDOMNode(scalebox);
        expect(scaleboxDom).toExist();

        expect(scaleboxDom.className).toExist();
        expect(scaleboxDom.className).toBe("mapstore-scalebox-main");
        expect(scaleboxDom.id).toNotExist();

        const scalebarContr = scaleboxDom.getElementsByClassName('mapstore-scalebox-bar-main');
        expect(scalebarContr).toExist();
    });

    // test CUSTOM
    it('checks the custom element visibility', () => {
        var scaleboxVar = {
            combo: true,
            bar: false
        };

        const scalebox = React.render(<ScaleBox scalebox={scaleboxVar}/>, document.body);
        const scaleboxDom = React.findDOMNode(scalebox);
        const scalebarContr = scaleboxDom.getElementsByClassName('mapstore-scalebox-bar-main');

        expect(scalebarContr.length).toBe(0);
    });
});
