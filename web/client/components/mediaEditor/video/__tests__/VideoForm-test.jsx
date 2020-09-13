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
import VideoForm from '../VideoForm';
import { Simulate, act } from 'react-dom/test-utils';

describe('VideoForm component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with thumbnail', () => {
        ReactDOM.render(<VideoForm
            editing
            selectedItem={ {
                data: {
                    thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII='
                }
            }}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const inputsNodes = container.querySelectorAll('input');
        expect(inputsNodes.length).toBe(5);
        expect([...inputsNodes].map(input => input.getAttribute('type')))
            .toEqual([
                'file', // thumbnail
                'text',
                'text',
                'text',
                'text'
            ]);
        expect([...inputsNodes].map(input => input.getAttribute('placeholder')))
            .toEqual([
                null, // thumbnail
                'mediaEditor.mediaPicker.videoUrlPlaceholder',
                'mediaEditor.mediaPicker.titlePlaceholder',
                'mediaEditor.mediaPicker.descriptionPlaceholder',
                'mediaEditor.mediaPicker.creditsPlaceholder'
            ]);
    });

    it('should render refresh button to create thumbnail from video source', () => {
        ReactDOM.render(<VideoForm
            editing
            selectedItem={ {
                data: {
                    thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII='
                }
            }}
        />, document.getElementById("container"));
        const container = document.getElementById('container');

        const thumbnailNode = container.querySelector('.ms-thumbnail');
        expect(thumbnailNode).toBeTruthy();

        const removeButtonNode = thumbnailNode.querySelector('.btn');
        expect(removeButtonNode.querySelector('.glyphicon-trash')).toBeTruthy();

        act(() => {
            Simulate.click(removeButtonNode);
        });

        const refreshButtonNode = thumbnailNode.querySelector('.btn');
        expect(refreshButtonNode.querySelector('.glyphicon-refresh')).toBeTruthy();

    });
});
