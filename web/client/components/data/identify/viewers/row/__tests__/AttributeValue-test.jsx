/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import ReactDOM from 'react-dom';
import { waitFor } from '@testing-library/react';

import AttributeValue, { formatAttributeValue } from '../AttributeValue';
// preloads the lazy chunk, so the pannellum stub below survives the dynamic import
import '../PanoramaViewer';
import axios from '../../../../../../libs/ajax';

describe('AttributeValue', () => {
    let mockAxios;
    let originalPannellum;

    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
        mockAxios = new MockAdapter(axios);
        originalPannellum = window.pannellum;
        window.pannellum = { viewer: () => ({ on: () => {}, destroy: () => {} }) };
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        mockAxios.restore();
        window.pannellum = originalPannellum;
    });

    const render = (props) => ReactDOM.render(
        <AttributeValue {...props}/>,
        document.getElementById('container')
    );

    it('formats primitive, empty and structured values', () => {
        expect(formatAttributeValue('value')).toBe('value');
        expect(formatAttributeValue(null)).toBe('');
        expect(formatAttributeValue(undefined)).toBe('');
        expect(formatAttributeValue({ value: 1 })).toBe('{"value":1}');
    });

    it('renders an unconfigured value as text', () => {
        render({ value: 'https://example.com/image.jpg' });
        expect(document.getElementById('container').textContent).toBe('https://example.com/image.jpg');
        expect(document.querySelector('.ms-feature-info-attribute-media')).toNotExist();
    });

    it('renders configured image, video and audio values', () => {
        const container = document.getElementById('container');

        render({ value: 'https://example.com/image.jpg', attribute: { name: 'image', displayType: 'image' } });
        expect(container.querySelector('.ms-feature-info-attribute-image img').getAttribute('src')).toBe('https://example.com/image.jpg');

        render({ value: 'https://example.com/video.mp4', attribute: { name: 'video', displayType: 'video' } });
        expect(container.querySelector('.ms-feature-info-attribute-video')).toExist();

        render({ value: 'https://example.com/audio.mp3', attribute: { name: 'audio', displayType: 'audio' } });
        expect(container.querySelector('audio.ms-feature-info-attribute-media').getAttribute('src')).toBe('https://example.com/audio.mp3');
    });

    it('renders a configured panorama value once the lazy chunk resolves', () => {
        const container = document.getElementById('container');
        render({ value: 'https://example.com/panorama.jpg', attribute: { name: 'panorama', displayType: 'panorama' } });
        return waitFor(() => expect(container.querySelector('.ms-feature-info-attribute-panorama')).toExist());
    });

    it('renders configured iframe and URL values', () => {
        const container = document.getElementById('container');

        render({ value: 'https://example.com/page', attribute: { name: 'page', alias: {'default': 'Page'}, displayType: 'iframe' } });
        const iframe = container.querySelector('iframe');
        expect(iframe.getAttribute('src')).toBe('https://example.com/page');
        expect(iframe.getAttribute('title')).toBe('page');
        expect(iframe.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin');

        render({ value: 'https://example.com/page', attribute: { name: 'page', displayType: 'url' } });
        const link = container.querySelector('a');
        expect(link.getAttribute('href')).toBe('https://example.com/page');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('renders unsafe iframe, URL and PDF values as text', () => {
        const container = document.getElementById('container');
        const unsafeURL = ['java', 'script:alert(1)'].join('');

        render({ value: unsafeURL, attribute: { name: 'page', displayType: 'iframe' } });
        expect(container.querySelector('iframe')).toNotExist();
        expect(container.textContent).toBe(unsafeURL);

        render({ value: unsafeURL, attribute: { name: 'page', displayType: 'url' } });
        expect(container.querySelector('a')).toNotExist();
        expect(container.textContent).toBe(unsafeURL);

        render({ value: unsafeURL, attribute: { name: 'document', displayType: 'pdf' } });
        expect(container.querySelector('iframe')).toNotExist();
        expect(container.querySelector('.mapstore-medium-size-loader')).toNotExist();
        expect(container.textContent).toBe(unsafeURL);
    });

    it('renders the PDF loading state while the download is pending', () => {
        const value = 'https://example.com/file.pdf';
        mockAxios.onGet(value).reply(() => new Promise(() => {}));
        render({ value, attribute: { name: 'document', displayType: 'pdf' } });
        expect(document.querySelector('.mapstore-medium-size-loader')).toExist();
    });

    it('renders a link instead of an iframe when the PDF download fails', (done) => {
        const value = 'https://example.com/file.pdf';
        mockAxios.onGet(value).reply(500);
        render({ value, attribute: { name: 'document', displayType: 'pdf' } });

        setTimeout(() => {
            const container = document.getElementById('container');
            expect(container.querySelector('iframe')).toNotExist();
            expect(container.querySelector('a').getAttribute('href')).toBe(value);
            done();
        });
    });

    it('uses the configured media-type attribute', () => {
        render({
            value: 'https://example.com/resource',
            attribute: { name: 'resource', displayType: 'media', mediaTypeAttribute: 'mimeType' },
            mediaTypeValue: 'audio/mpeg'
        });
        expect(document.querySelector('audio.ms-feature-info-attribute-media')).toExist();
    });
});
