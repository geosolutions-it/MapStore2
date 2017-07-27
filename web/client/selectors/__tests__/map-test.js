/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {mapSelector, projectionSelector} = require('../map');
const center = {x: 1, y: 1};
let state = {map: {center: center}};
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

    it('test mapSelector from map non configured', () => {
        const props = mapSelector({config: null});

        expect(props).toNotExist();
    });
});
