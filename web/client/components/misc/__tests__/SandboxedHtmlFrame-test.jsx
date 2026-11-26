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

import SandboxedHtmlFrame, {
    HTML_FRAME_SANDBOX,
    HTML_FRAME_HEIGHT_MESSAGE,
    HTML_FRAME_MIN_HEIGHT,
    HTML_FRAME_MAX_HEIGHT
} from '../SandboxedHtmlFrame';

const postHeight = (source, height, type = HTML_FRAME_HEIGHT_MESSAGE) => act(() => {
    window.dispatchEvent(new MessageEvent('message', { data: { type, height }, source }));
});

describe('SandboxedHtmlFrame', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    const render = (html) => {
        act(() => {
            ReactDOM.render(<SandboxedHtmlFrame html={html} title="Feature info" />, document.getElementById('container'));
        });
        return document.querySelector('#container iframe');
    };

    it('renders the document in an iframe with fixed sandbox flags', () => {
        const html = '<html><body><button onclick="run()">Run</button></body></html>';
        const frame = render(html);
        expect(frame.getAttribute('sandbox')).toBe('allow-scripts allow-popups allow-popups-to-escape-sandbox');
        expect(frame.getAttribute('sandbox')).toBe(HTML_FRAME_SANDBOX);
        expect(frame.hasAttribute('allow')).toBe(false);
        expect(frame.getAttribute('referrerpolicy')).toBe('no-referrer');
        expect(frame.getAttribute('title')).toBe('Feature info');
        expect(frame.getAttribute('srcdoc').indexOf(html)).toBe(0);
        expect(frame.style.height).toBe(`${HTML_FRAME_MIN_HEIGHT}px`);
        expect(frame.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('opaque origin: the frame document is not reachable from the application', () => {
        const frame = render('<html><body><p id="inner">text</p></body></html>');
        expect(frame.contentDocument).toBe(null);
    });

    it('applies the height reported by the frame, within limits', () => {
        const frame = render('<p>text</p>');
        postHeight(frame.contentWindow, 321.4);
        expect(frame.style.height).toBe('321px');
        postHeight(frame.contentWindow, 99999);
        expect(frame.style.height).toBe(`${HTML_FRAME_MAX_HEIGHT}px`);
        postHeight(frame.contentWindow, 3);
        expect(frame.style.height).toBe(`${HTML_FRAME_MIN_HEIGHT}px`);
    });

    it('reports the content height from inside the frame, once per change', (done) => {
        const frame = render('<div style="height:420px">tall</div>');
        const heights = [];
        const onMessage = (event) => {
            if (event.source === frame.contentWindow && event.data?.type === HTML_FRAME_HEIGHT_MESSAGE) {
                heights.push(event.data.height);
            }
        };
        window.addEventListener('message', onMessage);
        setTimeout(() => {
            window.removeEventListener('message', onMessage);
            expect(heights.length).toBe(1);
            expect(heights[0] >= 420).toBe(true);
            done();
        }, 600);
    });

    it('ignores messages from other windows, other types and invalid heights', () => {
        const frame = render('<p>text</p>');
        postHeight(window, 400);
        expect(frame.style.height).toBe(`${HTML_FRAME_MIN_HEIGHT}px`);
        postHeight(frame.contentWindow, 400, 'other-message');
        expect(frame.style.height).toBe(`${HTML_FRAME_MIN_HEIGHT}px`);
        postHeight(frame.contentWindow, 'abc');
        expect(frame.style.height).toBe(`${HTML_FRAME_MIN_HEIGHT}px`);
        postHeight(frame.contentWindow, -10);
        expect(frame.style.height).toBe(`${HTML_FRAME_MIN_HEIGHT}px`);
    });
});
