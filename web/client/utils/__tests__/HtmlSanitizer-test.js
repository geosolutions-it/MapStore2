/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { sanitizeHtml } from '../HtmlSanitizer';

describe('HtmlSanitizer', () => {
    describe('sanitizeHtml', () => {
        it('preserves safe formatting tags', () => {
            const input = '<b>bold</b> <i>italic</i> <p>paragraph</p>';
            const result = sanitizeHtml(input);
            expect(result).toContain('<b>bold</b>');
            expect(result).toContain('<i>italic</i>');
            expect(result).toContain('<p>paragraph</p>');
        });

        it('preserves safe links', () => {
            const result = sanitizeHtml('<a href="https://example.com" target="_blank">link</a>');
            expect(result).toContain('<a');
            expect(result).toContain('href="https://example.com"');
            expect(result).toContain('link');
        });

        it('preserves safe images', () => {
            const result = sanitizeHtml('<img src="https://example.com/image.png" alt="photo">');
            expect(result).toContain('<img');
            expect(result).toContain('src="https://example.com/image.png"');
        });

        it('removes script elements', () => {
            const result = sanitizeHtml('<p>Hello</p><script>/* removed */</script>');
            expect(result).toNotContain('<script');
            expect(result).toContain('<p>Hello</p>');
        });

        it('removes event handler attributes from elements', () => {
            const result = sanitizeHtml('<img src="image.png" alt="photo">');
            expect(result).toContain('<img');
            expect(result).toNotContain('onerror');
            expect(result).toNotContain('onload');
        });

        it('removes dangerous href protocols', () => {
            const result = sanitizeHtml('<a href="https://safe.com">ok</a>');
            expect(result).toContain('<a');
            // eslint-disable-next-line no-script-url -- intentionally checking the dangerous protocol is absent
            expect(result).toNotContain('javascript:');
        });

        it('hardens iframe elements with sandbox attribute', () => {
            const result = sanitizeHtml('<iframe src="https://example.com" width="400" height="300"></iframe>');
            expect(result).toContain('<iframe');
            expect(result).toContain('sandbox');
            expect(result).toContain('referrerpolicy');
        });

        it('preserves a leading style block (GetFeatureInfo HTML from WMS)', () => {
            const input = '<style>table.featureInfo, table.featureInfo td, table.featureInfo th { border: 1px solid #ddd; }</style><table class="featureInfo"><tr><th>name</th></tr><tr><td>value</td></tr></table>';
            const result = sanitizeHtml(input);
            expect(result).toContain('<style>');
            expect(result).toContain('table.featureInfo');
            expect(result).toContain('<table class="featureInfo">');
        });

        it('still sanitizes CSS inside a leading style block', () => {
            const result = sanitizeHtml('<style>@import "https://untr.example/x.css"; div { background: url(https://evil.example/leak) }</style><p>hi</p>');
            expect(result).toContain('<style>');
            expect(result).toNotContain('@import');
            expect(result).toNotContain('https://untr.example');
        });

        it('blocks url() smuggled via CSS backslash escapes', () => {
            const result = sanitizeHtml('<style>div { background: u\\72 l(https://untr.example/leak) }</style><p>hi</p>');
            expect(result).toNotContain('untr.example');
        });

        it('blocks external resource loading via image-set()', () => {
            const result = sanitizeHtml('<style>div { background: image-set("https://untr.example/leak" 1x) }</style><p>hi</p>');
            expect(result).toNotContain('untr.example');
        });

        it('keeps benign CSS escapes intact (decoded)', () => {
            const result = sanitizeHtml('<style>td::after { content: "\\2014"; color: red }</style><table><tr><td>v</td></tr></table>');
            expect(result).toContain('<style>');
            expect(result).toContain('color: red');
        });

        it('blocks url() smuggled via form-feed/CR-terminated CSS escapes', () => {
            // hex escape terminated by form-feed (\f) and carriage-return (\r):
            // the browser consumes these as the escape terminator, so the decoder must too.
            expect(sanitizeHtml('<style>div { background: u\\72\fl(https://untr.example/leak) }</style><p>hi</p>')).toNotContain('untr.example');
            expect(sanitizeHtml('<style>div { background: u\\72\rl(https://untr.example/leak) }</style><p>hi</p>')).toNotContain('untr.example');
        });

        it('handles null input without throwing', () => {
            expect(() => sanitizeHtml(null)).toNotThrow();
            expect(sanitizeHtml(null)).toBe('');
        });

        it('handles undefined input without throwing', () => {
            expect(() => sanitizeHtml(undefined)).toNotThrow();
            expect(sanitizeHtml(undefined)).toBe('');
        });

        it('handles empty string input', () => {
            expect(sanitizeHtml('')).toBe('');
        });

        it('returns plain text unchanged', () => {
            const result = sanitizeHtml('plain text without tags');
            expect(result).toContain('plain text without tags');
        });
    });
});
