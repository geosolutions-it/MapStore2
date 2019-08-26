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
import Title from '../Title';
describe('Title component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Title rendering with defaults', () => {
        ReactDOM.render(<Title />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title');
        expect(el).toExist();
    });
    it('Title background rendering (image)', () => {
        const IMAGE_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const CONTENTS = [
            {
                id: '000',
                type: 'column',
                background: {
                    type: 'image',
                    src: IMAGE_SRC
                },
                html: '<h1>Title</h1>'
            }
        ];
        ReactDOM.render(<Title contents={CONTENTS}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title');
        expect(el).toExist();
        const img = el.querySelector('img');
        expect(img).toExist();
        expect(img.getAttribute('src')).toBe(IMAGE_SRC);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
    });
    it('Title rendering cover set to true', () => {
        const VIEW_HEIGHT = 500;
        const CONTENTS = [
            {
                id: '000',
                type: 'text',
                html: '<h1>Title</h1>'
            }
        ];
        ReactDOM.render(<Title contents={CONTENTS} viewHeight={VIEW_HEIGHT} cover />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title');
        expect(el).toExist();

        const sectionContents = container.querySelector('.ms-section-contents');
        expect(sectionContents).toExist();
        expect(sectionContents.clientHeight).toBe(VIEW_HEIGHT);

        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(VIEW_HEIGHT);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
    });

    it('Title rendering cover set to false', () => {
        const VIEW_HEIGHT = 500;
        const CONTENTS = [
            {
                id: '000',
                type: 'text',
                html: '<h1>Title</h1>'
            }
        ];
        ReactDOM.render(<Title contents={CONTENTS} viewHeight={VIEW_HEIGHT} cover={false} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-section-title');
        expect(el).toExist();

        const sectionContents = container.querySelector('.ms-section-contents');
        expect(sectionContents).toExist();
        expect(sectionContents.clientHeight < VIEW_HEIGHT).toBe(true);

        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(sectionContents.clientHeight);
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(contentToolbar).toExist();
    });
});
