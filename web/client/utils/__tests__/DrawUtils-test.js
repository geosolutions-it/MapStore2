/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    generateEditingStyle,
    featureToModifyProperties,
    modifyPropertiesToFeatureProperties
} from '../DrawUtils';

describe('Test the DrawUtils', () => {
    it('generateEditingStyle with custom style', () => {
        const lineDrawingCustom = {
            color: '#FF0000',
            opacity: 1.0,
            width: 3
        };
        const drawStyle = generateEditingStyle({
            lineDrawing: lineDrawingCustom
        });
        expect(drawStyle).toEqual({
            ...generateEditingStyle(),
            lineDrawing: lineDrawingCustom
        });
    });
    it('featureToModifyProperties', () => {
        const feature = { type: 'Feature', properties: { geometryType: 'Circle' }, geometry: { type: 'Point', coordinates: [0, 0] } };
        expect(featureToModifyProperties()(feature)).toEqual({ geometryType: 'Point' });
        expect(featureToModifyProperties({ getGeometryType: ({ properties }) => properties.geometryType })(feature)).toEqual({ geometryType: 'Circle' });
    });
    it('modifyPropertiesToFeatureProperties', () => {
        const feature = { type: 'Feature', properties: { geometryType: 'Circle', radius: 100 }, geometry: { type: 'Point', coordinates: [0, 0] } };
        expect(modifyPropertiesToFeatureProperties({ radius: 200 }, feature)).toEqual({ geometryType: 'Circle', radius: 200 });
    });
});
