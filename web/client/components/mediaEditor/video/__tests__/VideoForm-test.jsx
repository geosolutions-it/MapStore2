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
import VideoForm from '../VideoForm';

describe('VideoForm component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with empty preview', () => {
        ReactDOM.render(<VideoForm/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const inputsNodes = container.querySelectorAll('input');
        expect(inputsNodes.length).toBe(6);
        expect([...inputsNodes].map(input => input.getAttribute('type')))
            .toEqual([
                'file', // thumbnail
                'text',
                'text',
                'text',
                'text',
                'checkbox' // autoplay
            ]);
        expect([...inputsNodes].map(input => input.getAttribute('placeholder')))
            .toEqual([
                null, // thumbnail
                'mediaEditor.mediaPicker.videoUrlPlaceholder',
                'mediaEditor.mediaPicker.titlePlaceholder',
                'mediaEditor.mediaPicker.descriptionPlaceholder',
                'mediaEditor.mediaPicker.creditsPlaceholder',
                null // autoplay
            ]);
    });
});
