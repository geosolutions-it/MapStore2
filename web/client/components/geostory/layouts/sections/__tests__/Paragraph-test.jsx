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
import Paragraph from '../Paragraph';
import STORY from '../../../../../test-resources/geostory/sampleStory_1.json';

describe('Paragraph component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Paragraph rendering with of known section (paragraph)', () => {
        ReactDOM.render(<Paragraph {...STORY.sections[0]} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-section-paragraph > .ms-section-contents')).toExist();

        expect(container.querySelector('.ms-content-text')).toExist();
        expect(container.querySelector('.ms-content-image')).toExist();
    });
});
