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
import VideoPreview from '../VideoPreview';

describe('VideoPreview component', () => {
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
        ReactDOM.render(<VideoPreview mediaType="video"/>, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.glyphicon-play')).toBeTruthy();
    });
    it('should render with preview', () => {
        ReactDOM.render(<VideoPreview
            mediaType="video"
            selectedItem={{
                id: 'video-01',
                data: {
                    thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
                    title: 'title-1',
                    description: 'description-1'
                }
            }}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-video-preview')).toBeTruthy();
    });
});
