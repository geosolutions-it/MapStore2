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
import Background from '../Background';
import {Provider} from 'react-redux';

describe('Background component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render and verify the props hight on background container node', () => {
        const VIEW_HEIGHT = 800;
        ReactDOM.render(<Background
            width={1024}
            height={VIEW_HEIGHT}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const backgroundContainer = container.querySelector('.ms-section-background-container');
        expect(backgroundContainer).toExist();
        expect(backgroundContainer.clientHeight).toBe(VIEW_HEIGHT);
    });

    it('render background with media (image)', () => {
        const VIEW_HEIGHT = 800;
        ReactDOM.render(
            <Provider store={{subscribe: () => {}, getState: () => ({mediaEditor: {open: true}})}}>
                <Background
                    width={1024}
                    mode="edit"
                    height={VIEW_HEIGHT}
                    type="image"
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                />
            </Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const backgroundContainer = container.querySelector('.ms-section-background-container');
        const imageMedia = container.querySelector('.ms-media-image');
        const image = imageMedia.querySelector('img');
        const contentToolbar = container.querySelector('.ms-content-toolbar');
        expect(backgroundContainer).toExist();
        expect(imageMedia).toExist();
        expect(contentToolbar).toExist();
        expect(backgroundContainer.clientHeight).toBe(VIEW_HEIGHT);
        expect(image.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    });
});
