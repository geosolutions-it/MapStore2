/**
 * Copyright 2015, Marko Polovina
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react/addons');
var expect = require('expect');
var ScaleCombo = require('../ScaleCombo.jsx');

describe('This test for ScaleCombo', () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    // test DEFAULTS
    it('creates the component with defaults', () => {
        const scalecombo = React.render(<ScaleCombo/>, document.body);
        expect(scalecombo).toExist();

        const scalecomboDom = React.findDOMNode(scalecombo);
        expect(scalecomboDom).toExist();
        expect(scalecomboDom.id).toNotExist();

        const scalecomboMain = scalecomboDom.getElementsByClassName('mapstore-scalebox-combo-main')[0];
        expect(scalecomboMain).toExist();

        const scalecomboMainBtn = scalecomboMain.getElementsByTagName('button');
        expect(scalecomboMainBtn).toExist();

        const scalecomboMainUl = scalecomboMain.getElementsByTagName('ul')[0];
        expect(scalecomboMainUl).toExist();

        const scalecomboMainLi = scalecomboMainUl.getElementsByTagName('li');
        expect(scalecomboMainLi.length).toBe(19);

        const scalecomboBtn = scalecomboDom.getElementsByTagName('button')[0];
        expect(scalecomboBtn).toExist();
        expect(scalecomboBtn.className).toBe('dropdown-toggle btn btn-default');
    });
});
