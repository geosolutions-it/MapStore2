/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    OPEN_DETAILS_PANEL,
    CLOSE_DETAILS_PANEL,
    DETAILS_LOADED,
    UPDATE_DETAILS,
    openDetailsPanel,
    closeDetailsPanel,
    detailsLoaded,
    updateDetails
} from '../details';

describe('details actions tests', () => {
    it('openDetailsPanel', () => {
        const a = openDetailsPanel();
        expect(a.type).toBe(OPEN_DETAILS_PANEL);
    });
    it('closeDetailsPanel', () => {
        const a = closeDetailsPanel();
        expect(a.type).toBe(CLOSE_DETAILS_PANEL);
    });
    it('detailsLoaded', () => {
        const mapId = 1;
        const detailsUri = "sada/da/";
        const a = detailsLoaded(mapId, detailsUri);
        expect(a.type).toBe(DETAILS_LOADED);
        expect(a.detailsUri).toBe(detailsUri);
        expect(a.mapId).toBe(mapId);
    });
    it('updateDetails', () => {
        const a = updateDetails('text');
        expect(a.type).toBe(UPDATE_DETAILS);
        expect(a.detailsText).toBe('text');
    });
});
