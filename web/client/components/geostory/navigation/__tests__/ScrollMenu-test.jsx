/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

import STORY from '../../../../test-resources/geostory/sampleStory_1.json';
import { navigableItemsSelector } from '../../../../selectors/geostory';

import ScrollMenu from '../ScrollMenu';

describe('ScrollMenu component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Rendering with defaults', () => {
        ReactDOM.render(<ScrollMenu items={navigableItemsSelector({geostory: {currentStory: STORY}})} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-horizontal-menu');
        expect(el).toExist();
        const buttons = container.querySelectorAll('button.menu-item');
        expect(buttons).toExist();
        expect(buttons.length).toBe(4);
    });

});
