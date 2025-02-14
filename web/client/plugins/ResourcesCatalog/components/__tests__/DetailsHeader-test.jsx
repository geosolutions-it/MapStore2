
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
import DetailsHeader from '../DetailsHeader';
import { Simulate } from 'react-dom/test-utils';

describe('DetailsHeader component', () => {
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
        ReactDOM.render(<DetailsHeader />, document.getElementById('container'));
        const detailsHeader = document.querySelector('.ms-details-header');
        expect(detailsHeader).toBeTruthy();
    });
    it('should display the resource information', () => {
        ReactDOM.render(<DetailsHeader
            getResourceTypesInfo={(resource) => {
                return {
                    icon: {
                        glyph: 'map',
                        type: 'glyphicon'
                    },
                    title: resource.name,
                    thumbnailUrl: resource.attributes.thumbnail
                };
            }}
            resource={{
                name: 'Resource Title',
                attributes: {
                    thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
                }
            }}/>, document.getElementById('container'));
        const detailsHeader = document.querySelector('.ms-details-header-info');
        expect(detailsHeader).toBeTruthy();
        const texts = detailsHeader.querySelectorAll('.ms-text');
        expect(texts[0].innerHTML).toBe('<span class="glyphicon glyphicon-map"></span> Resource Title');
        const imgs = document.querySelectorAll('img');
        expect(imgs.length).toBe(1);
        expect(imgs[0].getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    });
    it('should trigger onClose', (done) => {
        ReactDOM.render(<DetailsHeader
            onClose={() => {
                done();
            }}
        />, document.getElementById('container'));
        const detailsHeader = document.querySelector('.ms-details-header');
        expect(detailsHeader).toBeTruthy();
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(1);
        Simulate.click(buttons[0]);
    });
    it('should trigger onChangeThumbnail', (done) => {
        ReactDOM.render(<DetailsHeader
            editing
            onChangeThumbnail={() => {
                done();
            }}
        />, document.getElementById('container'));
        const detailsHeader = document.querySelector('.ms-details-header');
        expect(detailsHeader).toBeTruthy();
        const input = document.querySelectorAll('input');
        expect(input.length).toBe(1);
        fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "image", { type: "image/png" });
                Simulate.change(input[0], { target: { files: [file] } });
            });
    });
});
