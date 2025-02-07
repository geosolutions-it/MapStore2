
/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import DetailsThumbnail from '../DetailsThumbnail';
import { Simulate } from 'react-dom/test-utils';

describe('DetailsThumbnail component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<DetailsThumbnail />, document.getElementById('container'));
        const detailsThumbnail = document.querySelector('.ms-details-thumbnail');
        expect(detailsThumbnail).toBeTruthy();
    });
    it('should render an image while not editing', () => {
        ReactDOM.render(<DetailsThumbnail
            thumbnail={'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='}
        />, document.getElementById('container'));
        const detailsThumbnail = document.querySelector('.ms-details-thumbnail');
        expect(detailsThumbnail).toBeTruthy();
        const img = detailsThumbnail.querySelector('img');
        expect(img.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    });
    it('should render the thumbnail component while editing', (done) => {
        ReactDOM.render(<DetailsThumbnail
            editing
            onChange={(value) => {
                try {
                    expect(value.indexOf('data:image/png;base64')).toBe(0);
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const detailsThumbnail = document.querySelector('.ms-details-thumbnail');
        expect(detailsThumbnail).toBeTruthy();
        const buttons = detailsThumbnail.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        const input = detailsThumbnail.querySelectorAll('input');
        expect(input.length).toBe(1);
        fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "image", { type: "image/png" });
                Simulate.change(input[0], { target: { files: [file] } });
            });
    });
    it('should clear the thumbnail when clicking on the trash button', (done) => {
        ReactDOM.render(<DetailsThumbnail
            editing
            thumbnail={'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='}
            onChange={(value) => {
                try {
                    expect(value).toBe('');
                } catch (e) {
                    done(e);
                }
                done();
            }}
        />, document.getElementById('container'));
        const detailsThumbnail = document.querySelector('.ms-details-thumbnail');
        expect(detailsThumbnail).toBeTruthy();
        const buttons = detailsThumbnail.querySelectorAll('button');
        expect(buttons.length).toBe(2);
        Simulate.click(buttons[1]);
    });
});
