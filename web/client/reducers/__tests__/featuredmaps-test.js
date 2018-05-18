/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {attributeUpdated, mapDeleted, mapMetadataUpdated, permissionsUpdated, mapsLoading, setFeaturedMapsEnabled} = require('../../actions/maps');
const { isFeaturedMapsEnabled } = require('../../selectors/featuredmaps');
const featuredmaps = require('../featuredmaps');

describe('Test the featuredmaps reducer', () => {

    it('setEditorAvailable action', () => {
        const resourceId = 1;
        const name = 'featured';
        const value = 'true';
        const type = 'type';
        const error = null;
        const state = featuredmaps({}, attributeUpdated(resourceId, name, value, type, error));
        expect(state.latestResource).toEqual({
            resourceId,
            featured: value
        });
    });

    it('mapDeleted action', () => {
        const resourceId = 1;
        const result = 'result';
        const error = null;
        const state = featuredmaps({}, mapDeleted(resourceId, result, error));
        expect(state.latestResource).toEqual({
            resourceId,
            deleted: true
        });
    });

    it('mapMetadataUpdated action', () => {
        const resourceId = 1;
        const name = 'name';
        const description = 'description';
        const state = featuredmaps({}, mapMetadataUpdated(resourceId, name, description, 'success'));
        expect(state.latestResource).toEqual({
            resourceId,
            name,
            description
        });
    });

    it('permissionsUpdated action', () => {
        const resourceId = 1;
        const state = featuredmaps({}, permissionsUpdated(resourceId, 'success'));
        expect(state.latestResource).toEqual({
            resourceId,
            permission: 'updated'
        });
    });

    it('permissionsUpdated action', () => {
        const searchText = 'text';
        const state = featuredmaps({}, mapsLoading(searchText, {}));
        expect(state.searchText).toEqual(searchText);
    });
    it('featuredmaps enabled', () => {
        const fm = featuredmaps({}, setFeaturedMapsEnabled(true) );
        expect(isFeaturedMapsEnabled({
            featuredmaps: fm
        })).toBe(true);
    });

});
