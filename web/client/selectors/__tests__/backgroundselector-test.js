/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');

const {metadataSourceSelector,
    modalParamsSelector,
    backgroundListSelector,
    isDeletedIdSelector} = require('../backgroundselector');

const backgrounds = [{id: '1', thumbId: 10}, {id: '2', thumbnail: {url: 'url', data: 'binary'}}];
const modalParams = {editing: true, loading: true};

const state = {
    backgroundSelector: {
        backgrounds,
        modalParams,
        source: 'backgroundSelector',
        lastRemovedId: '61c9e030-4967-11e9-a528-a79c388c845f'
    }
};

describe('Test backgroundselector selectors', () => {
    it('test metadataSourceSelector', () => {
        const source = metadataSourceSelector(state);
        expect(source).toBe('backgroundSelector');
    });
    it('test modalParamsSelector', () => {
        const parameters = modalParamsSelector(state);
        expect(parameters).toEqual(modalParams);
    });
    it('test backgroundListSelector', () => {
        const list = backgroundListSelector(state);
        expect(list).toEqual(backgrounds);
    });
    it('backgroundListSelector return empty when backgrounds is not defined', () => {
        const list = backgroundListSelector({backgroundSelector: {}});
        expect(list).toEqual([]);
    });
    it('test isDeletedIdSelector', () => {
        const deleted = isDeletedIdSelector(state);
        expect(deleted).toBe('61c9e030-4967-11e9-a528-a79c388c845f');
    });
});
