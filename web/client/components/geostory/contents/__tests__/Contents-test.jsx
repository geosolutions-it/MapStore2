/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import Content from '../Content';
import STORY from 'json-loader!../../../../test-resources/geostory/sampleStory_1.json';

describe('Content component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Content rendering with defaults', () => {
        ReactDOM.render(<Content />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-content-unknown')).toExist();
    });
    it('Content rendering known type (text)', () => {
        ReactDOM.render(<Content {...STORY.sections[0].contents[0]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-content-text');
        expect(el).toExist();
    });
});
