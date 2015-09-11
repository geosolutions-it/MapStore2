/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var ScaleBox = require('../ScaleBox.jsx');
var expect = require('expect');

describe('This test for ScaleBox', () => {
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

        expect(scaleboxDom.className).toNotExist();
        expect(scaleboxDom.id).toNotExist();

        const scalebarContr = scaleboxDom.getElementsByClassName('mapstore-scalebox-bar-main');
        expect(scalebarContr).toExist();
    });
});
