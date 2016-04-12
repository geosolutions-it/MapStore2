/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {layersSelector, layerSelectorWithMarkers} = require('../layers');

describe('Test layers selectors', () => {
    it('test layersSelector from config', () => {
        const props = layersSelector({config: {layers: [{type: "osm"}]}});

        expect(props.length).toBe(1);
        expect(props[0].type).toBe("osm");
    });

    it('test layersSelector from layers', () => {
        const props = layersSelector({layers: [{type: "osm"}]});

        expect(props.length).toBe(1);
        expect(props[0].type).toBe("osm");
    });

    it('test layersSelector from layers flat', () => {
        const props = layersSelector({layers: {flat: [{type: "osm"}]}});

        expect(props.length).toBe(1);
        expect(props[0].type).toBe("osm");
    });

    it('test layerSelectorWithMarkers with no markers', () => {
        const props = layerSelectorWithMarkers({config: {layers: [{type: "osm"}]}});

        expect(props.length).toBe(1);
        expect(props[0].type).toBe("osm");
    });

    it('test layerSelectorWithMarkers with a marker', () => {
        const props = layerSelectorWithMarkers({config: {layers: [{type: "osm"}]}, mapInfo: {
            showMarker: true,
            clickPoint: {
                latlng: {lat: 45, lng: 43}
            }
        }});

        expect(props.length).toBe(2);
        expect(props[1].type).toBe("vector");
    });
});
