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
import Image from '../Image';
import ReactTestUtils from 'react-dom/test-utils';

describe('Image component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Image rendering with defaults', () => {
        ReactDOM.render(<Image />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-image')).toExist();
    });
    it('Image rendering with to contain', () => {
        ReactDOM.render(<Image
            fit="contain"
            src="path/to/image.png"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const image = container.querySelector('.ms-media-image > img');
        expect(image).toExist();
        expect(image.style.objectFit).toBe('contain');
    });
    it('Image rendering with to cover', () => {
        ReactDOM.render(<Image
            fit="cover"
            src="path/to/image.png"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const image = container.querySelector('.ms-media-image > img');
        expect(image).toExist();
        expect(image.style.objectFit).toBe('cover');
    });
    it('Image rendering with enable fullscreen preview', () => {
        ReactDOM.render(<Image
            src="path/to/image.png"
            enableFullscreen/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const image = container.querySelector('.ms-media-image > img');
        expect(image).toExist();
        expect(image.style.objectFit).toBe('cover');
        ReactTestUtils.Simulate.click(image);
        expect(document.querySelector('.ReactModalPortal')).toExist();
    });
});
