/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ReactDOM from 'react-dom';
import IconInput from '../IconInput';
import { act } from 'react-dom/test-utils';
import expect from 'expect';

describe('IconInput component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('should render with default', () => {
        ReactDOM.render(<IconInput />, document.getElementById("container"));
        const iconInputNode = document.querySelector('.ms-style-editor-icon-input');
        expect(iconInputNode).toBeTruthy();
    });

    it('should load image and display it', (done) => {
        const value = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        act(() => {
            ReactDOM.render(<IconInput
                value={value}
                onLoad={(error, imageUrl) => {
                    try {
                        expect(imageUrl).toBe(value);
                        expect(error.type).toBe('warning');
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        });
        const iconInputNode = document.querySelector('.ms-style-editor-icon-input');
        expect(iconInputNode).toBeTruthy();
    });
    it('should load image with error', (done) => {
        const value = '';
        act(() => {
            ReactDOM.render(<IconInput
                value={value}
                onLoad={(error, imageUrl) => {
                    try {
                        expect(error).toEqual({ type: 'error', messageId: 'imageSrcEmpty' });
                        expect(imageUrl).toBe('');
                        const errorIconNode = document.querySelector('.glyphicon-exclamation-sign');
                        expect(errorIconNode).toBeTruthy();
                    } catch (e) {
                        done(e);
                    }
                    done();
                }}
            />, document.getElementById("container"));
        });
        const iconInputNode = document.querySelector('.ms-style-editor-icon-input');
        expect(iconInputNode).toBeTruthy();
    });
});
