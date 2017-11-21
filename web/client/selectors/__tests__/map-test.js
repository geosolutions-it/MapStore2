/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {mapSelector, projectionSelector, mapVersionSelector, mapIdSelector, projectionDefsSelector, mapNameSelector} = require('../map');
const center = {x: 1, y: 1};
let state = {
        map: {center: center},
        mapInitialConfig: {
            mapId: 123
        }
    };

describe('Test map selectors', () => {
    it('test mapSelector from config', () => {
        const props = mapSelector({config: state});

        expect(props.center).toExist();
        expect(props.center.x).toBe(1);
    });

    it('test mapSelector from map', () => {
        const props = mapSelector(state);

        expect(props.center).toExist();
        expect(props.center.x).toBe(1);
    });
    it('test projectionSelector from map', () => {
        let proj = "EPSG:3857";
        state.map.projection = proj;
        const projection = projectionSelector(state);

        expect(projection).toExist();
        expect(projection).toBe(proj);
    });

    it('test mapSelector from map with history', () => {
        const props = mapSelector({map: {present: {center}}});

        expect(props.center).toExist();
        expect(props.center.x).toBe(1);
    });

    it('test projectionDefsSelector ', () => {
        const props = projectionDefsSelector({localConfig: {projectionDefs: [{code: "some"}, {code: "another"}]}});

        expect(props.length).toBe(2);
    });

    it('test mapSelector from map non configured', () => {
        const props = mapSelector({config: null});

        expect(props).toNotExist();
    });

    it('test mapIdSelector', () => {
        const props = mapIdSelector(state);
        expect(props).toBe(123);
    });

    it('test mapVersionSelector', () => {
        const props = mapVersionSelector({map: {present: {version: 2}}});
        expect(props).toBe(2);
    });

    it('test mapNameSelector', () => {
        const props = mapNameSelector({map: {present: {info: { name: 'map name' }}}});
        expect(props).toBe('map name');
    });

    it('test mapNameSelector no state', () => {
        const props = mapNameSelector({});
        expect(props).toBe('');
    });
});
