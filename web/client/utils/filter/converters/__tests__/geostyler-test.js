/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import geostyler from '../geostyler';
describe('GeoStyler converter', () => {
    const SAMPLES = [
        // logic operators
        {
            cql: '(prop1 = 1 AND prop2 = 2)',
            geostyler: {
                body: ['&&', ['==', 'prop1', 1], ['==', 'prop2', 2]]
            }
        },
        {
            cql: '(prop1 = 1 OR prop2 = 2)',
            geostyler: {body: ['||', ['==', 'prop1', 1], ['==', 'prop2', 2]]}
        },
        {
            cql: '(prop1 = 1 AND (prop2 = 2 OR prop3 = 3))',
            geostyler: {body: ['&&', ['==', 'prop1', 1], ['||', ['==', 'prop2', 2], ['==', 'prop3', 3]]]}
        },
        {
            cql: '(prop1 = 1 OR (prop2 = 2 AND prop3 = 3))',
            geostyler: {body: ['||', ['==', 'prop1', 1], ['&&', ['==', 'prop2', 2], ['==', 'prop3', 3]]]}
        },
        // comparison operators
        {
            cql: 'prop1 = 1',
            geostyler: {body: ['==', 'prop1', 1]}
        },
        {
            cql: 'prop1 <> 1',
            geostyler: {body: ['!=', 'prop1', 1]}
        },
        {
            cql: 'prop1 < 1',
            geostyler: {body: ['<', 'prop1', 1]}
        },
        {
            cql: 'prop1 <= 1',
            geostyler: {body: ['<=', 'prop1', 1]}
        }
    ];
    it('test geostyler to cql', () => {
        SAMPLES.forEach((sample) => {
            expect(geostyler.cql(sample.geostyler)).toBe(sample.cql);
        });
    });
});
