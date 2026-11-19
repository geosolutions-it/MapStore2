/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { filterFeatureCollection, toFeatureCollection } from '../VectorFeaturesUtils';

const feature = (properties) => ({ type: 'Feature', geometry: null, properties });

describe('Test the VectorFeaturesUtils', () => {
    it('toFeatureCollection', () => {
        const collection = toFeatureCollection([feature({a: 1})]);
        expect(collection.type).toBe('FeatureCollection');
        expect(collection.totalFeatures).toBe(1);
        expect(collection.numberMatched).toBe(1);
        expect(collection.numberReturned).toBe(1);
    });
    it('toFeatureCollection with no features', () => {
        expect(toFeatureCollection().features).toEqual([]);
    });
    it('filterFeatureCollection with no filter returns every feature', () => {
        const collection = filterFeatureCollection([feature({a: 1}), feature({a: 2})]);
        expect(collection.features.length).toBe(2);
        expect(collection.totalFeatures).toBe(2);
    });
    it('filterFeatureCollection applies a number filter', () => {
        const collection = filterFeatureCollection([feature({a: 1}), feature({a: 2})], {
            filterFields: [{attribute: 'a', type: 'number', operator: '=', value: 2}]
        });
        expect(collection.features.length).toBe(1);
        expect(collection.features[0].properties.a).toBe(2);
        expect(collection.totalFeatures).toBe(1);
    });
    it('filterFeatureCollection applies a string filter', () => {
        const collection = filterFeatureCollection([feature({a: 'Rome'}), feature({a: 'Milan'})], {
            filterFields: [{attribute: 'a', type: 'string', operator: 'ilike', value: 'rom'}]
        });
        expect(collection.features.map(({properties}) => properties.a)).toEqual(['Rome']);
    });
    it('filterFeatureCollection applies a boolean filter', () => {
        const collection = filterFeatureCollection([feature({a: true}), feature({a: false})], {
            filterFields: [{attribute: 'a', type: 'boolean', operator: '=', value: true}]
        });
        expect(collection.features.map(({properties}) => properties.a)).toEqual([true]);
    });
    it('filterFeatureCollection drops the features missing the attribute', () => {
        const collection = filterFeatureCollection([feature({a: 1}), feature({})], {
            filterFields: [{attribute: 'a', type: 'number', operator: '=', value: 1}]
        });
        expect(collection.features.length).toBe(1);
    });
    it('filterFeatureCollection sorts numbers numerically', () => {
        const features = [feature({a: 10}), feature({a: 2}), feature({a: 1})];
        expect(filterFeatureCollection(features, {sortOptions: {sortBy: 'a', sortOrder: 'ASC'}})
            .features.map(({properties}) => properties.a)).toEqual([1, 2, 10]);
        expect(filterFeatureCollection(features, {sortOptions: {sortBy: 'a', sortOrder: 'DESC'}})
            .features.map(({properties}) => properties.a)).toEqual([10, 2, 1]);
    });
    it('filterFeatureCollection sorts strings case insensitively', () => {
        const features = [feature({a: 'b'}), feature({a: 'A'})];
        expect(filterFeatureCollection(features, {sortOptions: {sortBy: 'a', sortOrder: 'ASC'}})
            .features.map(({properties}) => properties.a)).toEqual(['A', 'b']);
    });
    it('filterFeatureCollection sorts booleans and missing values without throwing', () => {
        const features = [feature({a: null}), feature({a: true}), feature({}), feature({a: false})];
        const sorted = filterFeatureCollection(features, {sortOptions: {sortBy: 'a', sortOrder: 'ASC'}});
        expect(sorted.features.map(({properties}) => properties.a)).toEqual([false, true, null, undefined]);
    });
    it('filterFeatureCollection keeps nil values last when sorting descending', () => {
        const features = [feature({a: null}), feature({a: 1}), feature({a: 2})];
        expect(filterFeatureCollection(features, {sortOptions: {sortBy: 'a', sortOrder: 'DESC'}})
            .features.map(({properties}) => properties.a)).toEqual([2, 1, null]);
    });
    it('filterFeatureCollection ignores a NONE sort order', () => {
        const features = [feature({a: 2}), feature({a: 1})];
        expect(filterFeatureCollection(features, {sortOptions: {sortBy: 'a', sortOrder: 'NONE'}})
            .features.map(({properties}) => properties.a)).toEqual([2, 1]);
    });
    it('filterFeatureCollection returns the requested page', () => {
        const features = [feature({a: 1}), feature({a: 2}), feature({a: 3}), feature({a: 4})];
        const collection = filterFeatureCollection(features, {}, {startIndex: 2, maxFeatures: 2});
        expect(collection.features.map(({properties}) => properties.a)).toEqual([3, 4]);
        expect(collection.numberReturned).toBe(2);
    });
    it('filterFeatureCollection counts the matches, not the page', () => {
        const features = [feature({a: 1}), feature({a: 2}), feature({a: 3})];
        const collection = filterFeatureCollection(features, {}, {startIndex: 0, maxFeatures: 2});
        expect(collection.features.length).toBe(2);
        expect(collection.totalFeatures).toBe(3);
        expect(collection.numberMatched).toBe(3);
    });
    it('filterFeatureCollection paginates after filtering', () => {
        const features = [feature({a: 1}), feature({a: 2}), feature({a: 2})];
        const collection = filterFeatureCollection(features, {
            filterFields: [{attribute: 'a', type: 'number', operator: '=', value: 2}]
        }, {startIndex: 0, maxFeatures: 10});
        expect(collection.features.length).toBe(2);
        expect(collection.totalFeatures).toBe(2);
    });
    it('filterFeatureCollection does not mutate the input', () => {
        const features = [feature({a: 2}), feature({a: 1})];
        filterFeatureCollection(features, {sortOptions: {sortBy: 'a', sortOrder: 'ASC'}});
        expect(features.map(({properties}) => properties.a)).toEqual([2, 1]);
    });
});
