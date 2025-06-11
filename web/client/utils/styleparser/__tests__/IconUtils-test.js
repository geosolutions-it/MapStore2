import expect from 'expect';
import { drawIcons } from '../IconUtils';

describe('IconUtils', () => {
    it('should preload images and marker from a style', (done) => {
        const geoStylerStyle = {
            name: '',
            rules: [
                {
                    filter: undefined,
                    name: '',
                    symbolizers: [
                        {
                            kind: 'Mark',
                            wellKnownName: 'Circle',
                            color: '#ff0000',
                            fillOpacity: 0.5,
                            strokeColor: '#00ff00',
                            strokeOpacity: 0.25,
                            strokeWidth: 3,
                            radius: 16,
                            rotate: 90
                        }
                    ]
                },
                {
                    filter: undefined,
                    name: '',
                    symbolizers: [
                        {
                            kind: 'Icon',
                            image: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
                            opacity: 0.5,
                            size: 32,
                            rotate: 90
                        }
                    ]
                }
            ]
        };
        drawIcons(geoStylerStyle)
            .then((images) => {
                try {
                    expect(images[0].id).toEqual('Circle:#ff0000:0.5:#00ff00:0.25::3:16');
                    expect(images[1].id).toEqual('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
                } catch (e) {
                    done(e);
                }
                done();
            });
    });
    it('should preload images and marker from a style that use property expressions', (done) => {
        const geoStylerStyle = {
            name: '',
            rules: [
                {
                    filter: undefined,
                    name: '',
                    symbolizers: [
                        {
                            kind: 'Mark',
                            wellKnownName: 'Circle',
                            color: {
                                name: 'property',
                                args: ['color']
                            },
                            fillOpacity: 0.5,
                            strokeColor: '#00ff00',
                            strokeOpacity: 0.25,
                            strokeWidth: 3,
                            radius: 16,
                            rotate: 90
                        }
                    ]
                }
            ]
        };
        const feature = {
            type: 'Feature',
            properties: {
                color: '#ff0000',
                opacity: 0.5,
                size: 2
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[[7, 41], [14, 41], [14, 46], [7, 46], [7, 41]]]
            }
        };
        drawIcons(geoStylerStyle, { features: [feature] })
            .then((images) => {
                try {
                    expect(images[0].id).toEqual('Circle:#ff0000:0.5:#00ff00:0.25::3:16');
                } catch (e) {
                    done(e);
                }
                done();
            });
    });
});
