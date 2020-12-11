/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import ReactDOM from 'react-dom';
import expect from 'expect';
import TestUtils from 'react-dom/test-utils';
import SwipeButton from '../SwipeButton';

const actions = {
    onSetActive: () => {},
    onSetSwipeMode: () => {}
};

describe('SwipeButton', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render MenuItems in dropdown', () => {
        const settings = {
            active: true,
            mode: "swipe"
        };

        ReactDOM.render(<SwipeButton
            onSetActive={actions.onSetActive}
            onSetSwipeMode={actions.onSetSwipeMode}
            swipeSettings={settings} />, document.getElementById("container"));

        const el = document.getElementById('container');
        const splitDropdownBtn = el.getElementsByClassName('dropdown-menu')[0];
        expect(splitDropdownBtn).toExist();
        expect(splitDropdownBtn.getElementsByTagName('a').length).toBe(3);
    });

    it('should set tool or configuring state active', () => {
        const spySetActive = expect.spyOn(actions, 'onSetActive');
        const spySetSwipeMode = expect.spyOn(actions, 'onSetSwipeMode');
        const settings = {
            active: true,
            mode: "swipe"
        };

        ReactDOM.render(<SwipeButton
            onSetActive={actions.onSetActive}
            onSetSwipeMode={actions.onSetSwipeMode}
            swipeSettings={settings} />, document.getElementById("container"));

        const el = document.getElementById('container');
        const splitDropdownBtn = el.getElementsByClassName('dropdown-menu')[0];
        const menuBtns = splitDropdownBtn.getElementsByTagName('a');

        TestUtils.Simulate.click(menuBtns[0]); // set swipe active
        expect(spySetActive).toHaveBeenCalledWith(true);
        expect(spySetSwipeMode).toHaveBeenCalledWith('swipe');

        TestUtils.Simulate.click(menuBtns[1]); // set spy active
        expect(spySetActive).toHaveBeenCalledWith(true);
        expect(spySetSwipeMode).toHaveBeenCalledWith('spy');

        TestUtils.Simulate.click(menuBtns[2]); // set spy active
        expect(spySetActive).toHaveBeenCalledWith(true, 'configuring');
    });
});
