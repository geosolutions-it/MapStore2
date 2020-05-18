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

const SAMPLE_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
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
        expect(container.querySelector('.ms-media-image')).toBeTruthy();
    });
    it('Image rendering with to contain', () => {
        ReactDOM.render(<Image
            fit="contain"
            src={SAMPLE_SRC}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const image = container.querySelector('.ms-media-image > img');
        expect(image).toExist();
        expect(image.style.objectFit).toBe('contain');
    });
    it('Image rendering with to cover', () => {
        ReactDOM.render(<Image
            fit="cover"
            src={SAMPLE_SRC}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const image = container.querySelector('.ms-media-image > img');
        expect(image).toExist();
        expect(image.style.objectFit).toBe('cover');
    });
    it.skip('Image rendering with enabled fullscreen preview', () => {
        ReactDOM.render(<Image
            src={SAMPLE_SRC}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const image = container.querySelector('.ms-media-image > img');
        expect(image).toExist();
        expect(image.style.objectFit).toBe('cover');
        ReactTestUtils.Simulate.click(image);
        expect(document.querySelector('.ReactModalPortal')).toExist();
    });
    it('Image rendering with disabled fullscreen preview', () => {
        ReactDOM.render(<Image
            src={SAMPLE_SRC}
            enableFullscreen={false}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const image = container.querySelector('.ms-media-image > img');
        expect(image).toExist();
        expect(image.style.objectFit).toBe('cover');
        ReactTestUtils.Simulate.click(image);
        expect(document.querySelector('.ReactModalPortal')).toNotExist();
    });
});
