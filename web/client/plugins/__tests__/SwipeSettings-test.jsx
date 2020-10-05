/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';

import { SwipeSettings } from '../SwipeSettings';

describe('SwipeSettings', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render configuration UI for swipe', () => {
        const props = {
            configuring: true,
            toolMode: "swipe",
            swipeModeSettings: { direction: "cut-vertical"}
        };

        ReactDOM.render(<SwipeSettings {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector('.mapstore-swipe-settings-slider')).toExist();
        expect(container.querySelector('.mapstore-swipe-settings-spy')).toNotExist();
    });

    it('should render configuration UI for spy', () => {
        const props = {
            configuring: true,
            toolMode: "spy",
            spyModeSettings: { radius: 80}
        };

        ReactDOM.render(<SwipeSettings {...props} />, document.getElementById("container"));
        const container = document.getElementById("container");
        expect(container.querySelector('.mapstore-swipe-settings-slider')).toNotExist();
        expect(container.querySelector('.mapstore-swipe-settings-spy')).toExist();
    });
});
