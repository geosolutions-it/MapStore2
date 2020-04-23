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
import MediaPreview from '../MediaPreview';
import { MediaTypes } from '../../../utils/GeoStoryUtils';

describe('MediaPreview component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('MediaPreview rendering with defaults', () => {
        ReactDOM.render(<MediaPreview />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-preview')).toNotExist();
    });
    it('MediaPreview for image', () => {
        ReactDOM.render(<MediaPreview mediaType={MediaTypes.IMAGE} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-preview')).toExist();
        expect(container.querySelector('.glyphicon-picture')).toExist();
    });
    it('MediaPreview for map', () => {
        ReactDOM.render(<MediaPreview mediaType={MediaTypes.MAP} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-preview')).toExist();
        expect(container.querySelector('.glyphicon-1-map')).toExist();
    });
    it('MediaPreview video', () => {
        ReactDOM.render(<MediaPreview mediaType={MediaTypes.VIDEO} />, document.getElementById("container"));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-media-preview')).toExist();
        expect(container.querySelector('.glyphicon-play')).toExist();
    });
});
