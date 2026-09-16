/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import PanoramaViewer from '../PanoramaViewer';

const VALUE = 'https://example.com/panorama.jpg';

describe('PanoramaViewer', () => {
    let originalPannellum;
    let viewerStub;
    let viewerSpy;

    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
        originalPannellum = window.pannellum;
        const handlers = {};
        viewerStub = {
            handlers,
            on: (name, handler) => { handlers[name] = handler; },
            destroy: expect.createSpy()
        };
        viewerSpy = expect.createSpy().andReturn(viewerStub);
        window.pannellum = { viewer: viewerSpy };
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        window.pannellum = originalPannellum;
    });

    const render = (props) => act(() => {
        ReactDOM.render(<PanoramaViewer {...props}/>, document.getElementById('container'));
    });

    it('creates an equirectangular viewer on the mount node', () => {
        render({ value: VALUE, alt: 'Sample panorama' });
        const container = document.getElementById('container');
        const viewerNode = container.querySelector('.ms-feature-info-attribute-panorama-viewer');
        expect(viewerNode).toExist();
        expect(viewerNode.getAttribute('aria-label')).toBe('Sample panorama');
        expect(container.querySelector('.ms-feature-info-attribute-panorama-loading')).toExist();
        expect(viewerSpy.calls.length).toBe(1);
        expect(viewerSpy.calls[0].arguments[0]).toBe(viewerNode);
        expect(viewerSpy.calls[0].arguments[1]).toEqual({
            type: 'equirectangular',
            panorama: VALUE,
            autoLoad: true
        });
    });

    it('hides the loading state once the panorama is loaded', () => {
        render({ value: VALUE });
        act(() => viewerStub.handlers.load());
        expect(document.querySelector('.ms-feature-info-attribute-panorama-loading')).toNotExist();
    });

    it('falls back to the plain image when the panorama fails', () => {
        render({ value: VALUE, alt: 'Sample panorama' });
        act(() => viewerStub.handlers.error('Invalid image'));
        const container = document.getElementById('container');
        expect(container.querySelector('.ms-feature-info-attribute-panorama-loading')).toNotExist();
        expect(container.querySelector('.ms-feature-info-attribute-panorama-error').textContent).toInclude('Invalid image');
        expect(container.querySelector('img').getAttribute('src')).toBe(VALUE);
    });

    it('destroys the viewer on unmount', () => {
        render({ value: VALUE });
        act(() => {
            ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        });
        expect(viewerStub.destroy.calls.length).toBe(1);
    });
});
