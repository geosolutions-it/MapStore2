/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');

const { isEditSelector,
    metadataSourceSelector,
    modalParamsSelector,
    backgroundThumbSelector,
    backgroundListSelector,
    unsavedChangesSelector,
    backgroundsSourceListSelector,
    isDeletedIdSelector} = require('../backgroundselector');

const modalParameters = {
    id: '61c9e030-4967-11e9-a528-a79c388c845f',
    group: 'background',
    name: 'tasmania',
    description: 'Layer-Group type layer: tasmania',
    title: 'mmmmmjjjjjjjj',
    type: 'wms',
    url: 'https://demo.geo-solutions.it/geoserver/wms',
    bbox: {
        crs: 'EPSG:4326',
        bounds: {
            minx: '143.83482400000003',
            miny: '-43.648056',
            maxx: '148.47914100000003',
            maxy: '-39.573891'
            }
        },
    visibility: true,
    singleTile: false,
    allowedSRS:
    { 'EPSG:3785': true, 'EPSG:3857': true, 'EPSG:4269': true, 'EPSG:4326': true, 'EPSG:102113': true, 'EPSG:900913': true },
    dimensions: [],
    hideLoading: false,
    handleClickOnLayer: false,
    catalogURL: null,
    useForElevation: false,
    hidden: false,
    thumbId: 9939,
    params: { name: 'tasmania' },
    loading: false,
    loadingError: false };

const state = {
    backgroundSelector: {
        backgrounds: [modalParameters],
        modalParams: modalParameters,
        unsavedChanges: false,
        editing: true,
        source: 'backgroundSelector',
        lastRemovedId: '61c9e030-4967-11e9-a528-a79c388c845f',
        backgroundSourcesId: [9939, 1008]
    }
};
describe('Test backgroundselector selectors', () => {
    it('test isEditSelector', () => {
        const editing = isEditSelector(state);
        expect(editing).toExist();
        expect(editing).toBe(true);
    });
    it('test metadataSourceSelector', () => {
        const source = metadataSourceSelector(state);
        expect(source).toExist();
        expect(source).toBe('backgroundSelector');
    });
    it('test modalParamsSelector', () => {
        const parameters = modalParamsSelector(state);
        expect(parameters).toExist();
        expect(parameters).toEqual(modalParameters);
    });
    it('test backgroundThumbSelector in a state without a thumb url', () => {
        const thumb = backgroundThumbSelector(state);
        expect(thumb).toNotExist();
    });
    it('test unsavedChangesSelector', () => {
        const changes = unsavedChangesSelector(state);
        expect(changes).toBeFalsy();
    });
    it('test backgroundListSelector', () => {
        const list = backgroundListSelector(state);
        expect(list).toExist();
        expect(list.length).toBe(1);
    });
    it('test backgroundsSourceListSelector', () => {
        const list = backgroundsSourceListSelector(state);
        expect(list).toExist();
        expect(list.length).toBe(2);
    });
    it('test isDeletedIdSelector', () => {
        const deleted = isDeletedIdSelector(state);
        expect(deleted).toExist();
        expect(deleted).toBe('61c9e030-4967-11e9-a528-a79c388c845f');
    });
});
