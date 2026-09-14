import expect from 'expect';
import {
    getDisplayTypeFromExtension,
    getDisplayTypeFromMediaType,
    resolveAttributeDisplayType
} from '../FeatureInfoAttributeUtils';
import ConfigUtils from '../ConfigUtils';

describe('FeatureInfoAttributeUtils', () => {
    afterEach(() => ConfigUtils.removeConfigProp('featureInfoMediaTypeAliases'));

    it('normalizes configured media types and MIME types', () => {
        expect(getDisplayTypeFromMediaType(' VIDEO ')).toBe('video');
        expect(getDisplayTypeFromMediaType('image/jpeg')).toBe('image');
        expect(getDisplayTypeFromMediaType('application/pdf')).toBe('pdf');
        expect(getDisplayTypeFromMediaType('text/html')).toBe('iframe');
        expect(getDisplayTypeFromMediaType('panorama')).toBe('panorama');
        expect(getDisplayTypeFromMediaType('png')).toBe('image');
        expect(getDisplayTypeFromMediaType('mp4')).toBe('video');
        expect(getDisplayTypeFromMediaType('mp3')).toBe('audio');
        expect(getDisplayTypeFromMediaType(null)).toBe(null);
        expect(getDisplayTypeFromMediaType(undefined)).toBe(null);
        expect(getDisplayTypeFromMediaType(123)).toBe(null);
        expect(getDisplayTypeFromMediaType('')).toBe(null);
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

    it('resolves configured media type aliases', () => {
        ConfigUtils.setConfigProp('featureInfoMediaTypeAliases', {
            panorama: ['PAN', 'PANO', '360'],
            image: ['IMG', 'FOTO'],
            video: ['VID']
        });

        expect(resolveAttributeDisplayType({
            value: 'https://example.com/resource.jpg',
            attribute: { displayType: 'media', mediaTypeAttribute: 'mediaType' },
            mediaTypeValue: ' pano '
        })).toBe('panorama');
        expect(resolveAttributeDisplayType({
            value: 'https://example.com/resource.jpg',
            attribute: { displayType: 'media', mediaTypeAttribute: 'mediaType' },
            mediaTypeValue: 360
        })).toBe('panorama');
    });

    it('ignores aliases with unsupported display types', () => {
        ConfigUtils.setConfigProp('featureInfoMediaTypeAliases', {
            unsupported: ['PAN'],
            image: ['IMG']
        });

        expect(resolveAttributeDisplayType({
            value: 'https://example.com/resource.jpg',
            attribute: { displayType: 'media' },
            mediaTypeValue: 'PAN'
        })).toBe('image');
    });
});
