/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var expect = require('expect');
var ScaleBar = require('../ScaleBar.jsx');

describe('This test for ScaleBar', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const scalebar = React.render(<ScaleBar/>, document.body);
        expect(scalebar).toExist();

        const scalebarDom = React.findDOMNode(scalebar);
        expect(scalebarDom).toExist();

        expect(scalebarDom.className).toExist();
        expect(scalebarDom.className).toBe('mapstore-scalebox-bar-main');
        expect(scalebarDom.id).toNotExist();

        const scalebarDist = scalebarDom.getElementsByClassName('mapstore-scalebox-bar-dist')[0];
        expect(scalebarDist).toExist();

        const scalebarDistSpan = scalebarDist.getElementsByTagName('span');
        expect(scalebarDistSpan).toExist();
        expect(scalebarDistSpan.length).toBe(1);
    });
});
