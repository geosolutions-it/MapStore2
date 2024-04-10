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

const TestItemComponent = ({ glyph, onClick }) => <button className={glyph} onClick={() => onClick()}></button>;

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

    it('should render buttons', () => {
        const settings = {
            active: true,
            mode: "swipe"
        };
        ReactDOM.render(<SwipeButton
            status={'layer'}
            statusTypes={{
                LAYER: 'layer'
            }}
            itemComponent={TestItemComponent}
            onSetActive={actions.onSetActive}
            onSetSwipeMode={actions.onSetSwipeMode}
            swipeSettings={settings} />, document.getElementById("container"));

        const el = document.getElementById('container');
        const buttons = el.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        expect([...buttons].map(button => button.getAttribute('class'))).toEqual([
            'transfer', 'search'
        ]);
    });

    it('should set tool', () => {
        const spySetActive = expect.spyOn(actions, 'onSetActive');
        const spySetSwipeMode = expect.spyOn(actions, 'onSetSwipeMode');
        const settings = {};

        ReactDOM.render(<SwipeButton
            status={'layer'}
            statusTypes={{
                LAYER: 'layer'
            }}
            itemComponent={TestItemComponent}
            onSetActive={actions.onSetActive}
            onSetSwipeMode={actions.onSetSwipeMode}
            swipeSettings={settings} />, document.getElementById("container"));

        const el = document.getElementById('container');
        const buttons = el.querySelectorAll('button');
        expect(buttons.length).toBe(2);

        TestUtils.Simulate.click(buttons[0]); // set swipe active
        expect(spySetActive).toHaveBeenCalledWith(true);
        expect(spySetSwipeMode).toHaveBeenCalledWith('swipe');

        TestUtils.Simulate.click(buttons[1]); // set spy active
        expect(spySetActive).toHaveBeenCalledWith(true);
        expect(spySetSwipeMode).toHaveBeenCalledWith('spy');
    });
});
