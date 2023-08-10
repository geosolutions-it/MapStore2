import expect from 'expect';
import {getHighlightLayerOptions, GEOMETRY_PROPERTY, HIGH_LIGHT_STYLE} from '../HighlightUtils';

describe('HighlightUtils', () => {
    it('getHighlightLayerOptions', () => {
        // adds standard options
        const options = getHighlightLayerOptions({
            features: [{
                type: 'Feature',
                properties: {
                    id: '1'
                },
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                }
            }]
        });
        expect(options).toEqual({
            visibility: true, // required by cesium
            features: [{
                type: 'Feature',
                properties: {
                    id: '1',
                    [GEOMETRY_PROPERTY]: 'Point' // required by default style
                },
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                }
            }],
            style: HIGH_LIGHT_STYLE
        });
    });
});
