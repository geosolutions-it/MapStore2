import expect from 'expect';
import {
    getDisplayTypeFromExtension,
    getDisplayTypeFromMediaType,
    isSafeFeatureInfoURL,
    resolveAttributeDisplayType
} from '../FeatureInfoAttributeUtils';

describe('FeatureInfoAttributeUtils', () => {
    it('normalizes configured media types and MIME types', () => {
        expect(getDisplayTypeFromMediaType(' VIDEO ')).toBe('video');
        expect(getDisplayTypeFromMediaType('image/jpeg')).toBe('image');
        expect(getDisplayTypeFromMediaType('application/pdf')).toBe('pdf');
        expect(getDisplayTypeFromMediaType('application/octet-stream')).toBe(null);
    });

    it('infers display types from URL extensions', () => {
        expect(getDisplayTypeFromExtension('https://example.com/file.pdf?download=true')).toBe('pdf');
        expect(getDisplayTypeFromExtension('https://example.com/file.jpg')).toBe('image');
    });

    it('uses the configured media type attribute before URL inference', () => {
        expect(resolveAttributeDisplayType({
            value: 'https://example.com/resource',
            attribute: { displayType: 'media', mediaTypeAttribute: 'mimeType' },
            mediaTypeValue: 'audio/mpeg'
        })).toBe('audio');
    });

    it('accepts same-origin and HTTPS URLs while rejecting insecure cross-origin URLs and unsafe protocols', () => {
        expect(isSafeFeatureInfoURL('https://example.com/page')).toBe(true);
        expect(isSafeFeatureInfoURL('/relative/page')).toBe(true);
        expect(isSafeFeatureInfoURL(`${window.location.origin}/same-origin/page`)).toBe(true);
        expect(isSafeFeatureInfoURL('http://example.com/page')).toBe(false);
        expect(isSafeFeatureInfoURL(['java', 'script:alert(1)'].join(''))).toBe(false);
        expect(isSafeFeatureInfoURL('data:text/html,<script>alert(1)</script>')).toBe(false);
        expect(isSafeFeatureInfoURL('')).toBe(false);
    });
});
