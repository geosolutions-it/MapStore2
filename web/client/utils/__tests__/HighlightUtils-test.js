import expect from 'expect';
import {getHighlightLayerOptions, GEOMETRY_PROPERTY, createHighlightStyle} from '../HighlightUtils';

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
            style: createHighlightStyle()
        });
    });

    it('getHighlightLayerOptions with custom highlight style', () => {
        const costumHighlightStyle = {
            color: '#33eeff',
            width: 4
        };
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
        }, costumHighlightStyle);
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
            style: createHighlightStyle(costumHighlightStyle)
        });
    });
});
