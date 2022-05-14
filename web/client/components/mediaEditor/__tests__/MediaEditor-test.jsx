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
import MediaEditor from '../MediaEditor';
import {Provider} from 'react-redux';

describe('MediaEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MediaEditor rendering with defaults', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaEditor />
            </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-mediaEditor')).toExist();
    });
    it('MediaEditor rendering toolbar', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaEditor />
            </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-mediaEditor')).toExist();
        const buttons = container.querySelectorAll('.ms-border-layout-header > .btn-group button');
        expect(buttons.length).toBe(3);
        const btnTooltip = ['mediaEditor.images', 'mediaEditor.videos', 'mediaEditor.maps'];
        buttons.forEach(button => {
            expect(btnTooltip.includes(button.textContent)).toBeTruthy();
            expect(button.classList.contains('disabled')).toBeFalsy();
        });
    });
    it('MediaEditor rendering toolbar with disabled media types', () => {
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({})}}>
                <MediaEditor mediaType={'map'} disabledMediaType={['image', 'video']} />
            </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-mediaEditor')).toExist();
        const buttons = container.querySelectorAll('.ms-border-layout-header > .btn-group button');
        expect(buttons.length).toBe(3);
        expect(buttons[0].classList.contains('disabled')).toBeTruthy();
        expect(buttons[1].classList.contains('disabled')).toBeTruthy();
        expect(buttons[2].classList.contains('disabled')).toBeFalsy();
        expect(buttons[2].classList.contains('active')).toBeTruthy();
    });
});
