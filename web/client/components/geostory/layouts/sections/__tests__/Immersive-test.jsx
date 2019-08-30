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
import Immersive from '../Immersive';

// TODO: externalize
import {setObservableConfig} from 'recompose';
import rxjsConfig from 'recompose/rxjsObservableConfig';
setObservableConfig(rxjsConfig);

describe('Immersive component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Immersive rendering with defaults', () => {
        ReactDOM.render(<Immersive mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-immersive');
        expect(el).toExist();
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
    });
    it('Immersive background rendering (image)', () => {
        const IMAGE_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const CONTENTS = [
            {
                id: '000',
                type: 'column',
                background: {
                    type: 'image',
                    src: IMAGE_SRC
                },
                html: '<p>column</p>'
            },
            {
                id: '001',
                type: 'column',
                background: {
                    type: 'image',
                    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
                },
                html: '<p>column</p>'
            }
        ];
        ReactDOM.render(<Immersive contents={CONTENTS} mode="edit"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-immersive');
        expect(el).toExist();
        const img = el.querySelector('img');
        expect(img).toExist();
        expect(img.getAttribute('src')).toBe(IMAGE_SRC);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
    });
});
