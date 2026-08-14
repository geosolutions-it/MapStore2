
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
import ALink, { sanitizeHref } from '../ALink';

describe('ALink component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should not render with default', () => {
        ReactDOM.render(<ALink />, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children.length).toBe(0);
    });
    it('should apply the link (a) tag if href is provided', () => {
        ReactDOM.render(<ALink href="#" className="link"><span className="child"></span></ALink>, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children[0].getAttribute('class')).toBe('link');
    });
    it('should not apply the link (a) tag if href is not provided', () => {
        ReactDOM.render(<ALink className="link"><span className="child"></span></ALink>, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children[0].getAttribute('class')).toBe('child');
    });
    it('should not apply the link (a) tag if href is provided and readOnly is true', () => {
        ReactDOM.render(<ALink href="#" readOnly className="link"><span className="child"></span></ALink>, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container.children[0].getAttribute('class')).toBe('child');
    });

    // ── Security regression: sanitizeHref allowlist (SM-19 / X-12) ──
    describe('sanitizeHref', () => {
        it('accepts safe relative and same-origin URLs', () => {
            expect(sanitizeHref('/viewer/42')).toBe('/viewer/42');
            expect(sanitizeHref('#section')).toBe('#section');
            expect(sanitizeHref('?q=foo')).toBe('?q=foo');
            expect(sanitizeHref('https://example.com/x')).toBe('https://example.com/x');
            expect(sanitizeHref('http://example.com/x')).toBe('http://example.com/x');
            expect(sanitizeHref('mailto:a@b.c')).toBe('mailto:a@b.c');
            expect(sanitizeHref('tel:+123')).toBe('tel:+123');
        });
        it('rejects javascript: and data: URIs', () => {
            // eslint-disable-next-line no-script-url
            expect(sanitizeHref('javascript:alert(1)')).toBe('');
            // eslint-disable-next-line no-script-url
            expect(sanitizeHref('JAVASCRIPT:alert(1)')).toBe('');
            expect(sanitizeHref('data:text/html,<script>alert(1)</script>')).toBe('');
            expect(sanitizeHref('vbscript:msgbox(1)')).toBe('');
            expect(sanitizeHref('file:///etc/passwd')).toBe('');
        });
        it('rejects protocol-relative and backslash variants', () => {
            expect(sanitizeHref('//evil.example')).toBe('');
            expect(sanitizeHref('/\\evil.example')).toBe('');
        });
        it('rejects non-string / empty', () => {
            expect(sanitizeHref(null)).toBe('');
            expect(sanitizeHref(undefined)).toBe('');
            expect(sanitizeHref('')).toBe('');
            expect(sanitizeHref('   ')).toBe('');
            expect(sanitizeHref(42)).toBe('');
        });
        it('rejects whitespace and control characters', () => {
            expect(sanitizeHref('/viewer /42')).toBe('');
            expect(sanitizeHref('/viewer\t42')).toBe('');
            expect(sanitizeHref('/viewer\n42')).toBe('');
        });
    });

    it('renders fallback when href is a javascript: URI (SM-19)', () => {
        // eslint-disable-next-line no-script-url
        ReactDOM.render(<ALink href="javascript:alert(1)" className="link"><span className="child"/></ALink>, document.getElementById('container'));
        const container = document.getElementById('container');
        // Sanitized href is empty → falls back to the child, no <a> is rendered
        expect(container.querySelector('a')).toBe(null);
        expect(container.children[0].getAttribute('class')).toBe('child');
    });
});
