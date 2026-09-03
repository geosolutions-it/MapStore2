import expect from 'expect';
import {
    getDisplayTypeFromExtension,
    getDisplayTypeFromMediaType,
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
});
