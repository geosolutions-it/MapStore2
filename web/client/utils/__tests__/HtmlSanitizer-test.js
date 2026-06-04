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
