/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const assign = require('object-assign');

const backgroundselector = require('../backgroundselector');
const {
    CREATE_BACKGROUNDS_LIST,
    ADD_BACKGROUND,
    ADD_BACKGROUND_PROPERTIES,
    UPDATE_BACKGROUND_THUMBNAIL,
    BACKGROUNDS_CLEAR,
    REMOVE_BACKGROUND_THUMBNAIL,
    EDIT_BACKGROUND_PROPERTIES,
    CLEAR_MODAL_PARAMETERS
} = require('../../actions/backgroundselector');

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
describe('Test the backgroundSelector reducer', () => {

    it('trigger add background action ', () => {
        const state = backgroundselector({}, {
            type: ADD_BACKGROUND,
            source: "backgroundSelector"
        });
        expect(state.source).toExist();
        expect(state.source).toBe("backgroundSelector");
    });

    it('clear background list', () => {
        const state = backgroundselector({}, {
            type: BACKGROUNDS_CLEAR
        });
        expect(state.source).toBe(undefined);
        expect(state.lastRemovedId).toBe(undefined);
        expect(state.unsavedChanges).toBeFalsy();
        expect(state.backgrounds.length).toBe(0);
        expect(state.modalParams).toEqual({});
    });
    it('add background properties', () => {
        const state = backgroundselector({}, {
            type: ADD_BACKGROUND_PROPERTIES,
            modalParams: modalParameters,
            unsavedChanges: false
        });
        expect(state.backgrounds.length).toBe(1);
        expect(state.unsavedChanges).toBeFalsy();
        expect(state.modalParams).toEqual(modalParameters);
    });
    it('trigger edit background action', () => {
        const state = backgroundselector({}, {
            type: EDIT_BACKGROUND_PROPERTIES,
            editing: false
        });
        expect(state.editing).toBeFalsy();
    });
    it('add thumbnail to the background', () => {
        const state = backgroundselector({modalParams: modalParameters, backgrounds: [modalParameters]}, {
            type: UPDATE_BACKGROUND_THUMBNAIL,
            thumbnail: 'url',
            thumbnailData: 'binary',
            id: '61c9e030-4967-11e9-a528-a79c388c845f'
        });
        expect(state.backgrounds.length).toBe(1);
        expect(state.unsavedChanges).toBe(true);
        expect(state.modalParams.CurrentThumbnailData).toBe('binary');
        expect(state.backgrounds[0].CurrentThumbnailData).toBe('binary');
        expect(state.modalParams.CurrentNewThumbnail).toBe('url');
        expect(state.backgrounds[0].CurrentNewThumbnail).toBe('url');
    });
    it('clear modal parameters state', () => {
        const state = backgroundselector({modalParams: modalParameters, backgrounds: [modalParameters]}, {
            type: CLEAR_MODAL_PARAMETERS
        });
        expect(state.modalParams).toBe(undefined);
    });
    it('remove a thumbnail from a background', () => {
        let thumbedParameters = assign({}, modalParameters, {
            thumbnail: 'url',
            CurrentNewThumbnail: 'binary'
        });
        const state = backgroundselector({modalParams: thumbedParameters, backgrounds: [thumbedParameters]}, {
            type: REMOVE_BACKGROUND_THUMBNAIL,
            backgroundId: '61c9e030-4967-11e9-a528-a79c388c845f'
        });
        expect(state.modalParams.CurrentThumbnailData).toBe(undefined);
        expect(state.modalParams.CurrentNewThumbnail).toBe(undefined);
        expect(state.lastRemovedId).toBe('61c9e030-4967-11e9-a528-a79c388c845f');
        expect(state.backgrounds.length).toBe(0);
    });
    it('creat a list of thumbs resource ID', () => {
        const state = backgroundselector({}, {
            type: CREATE_BACKGROUNDS_LIST,
            backgrounds: [modalParameters]
        });
        expect(state.backgroundSourcesId).toExist();
        expect(state.backgroundSourcesId.length).toBe(1);
        expect(state.backgroundSourcesId[0]).toBe(9939);
    });
});
