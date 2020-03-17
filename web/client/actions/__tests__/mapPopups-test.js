/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import * as POPUP from '../mapPopups';


describe('test map popups action creators', () => {
    it('addPopup', () => {
        const action = POPUP.addPopup("id", {content: "options"}, true);
        expect(action.type).toEqual(POPUP.ADD_MAP_POPUP);
        expect(action.id).toBe("id");
        expect(action.single).toBeTruthy();
        expect(action.popup.content).toBe("options");
    });
    it('removePopup', () => {
        const action = POPUP.removePopup("id");
        expect(action.type).toEqual(POPUP.REMOVE_MAP_POPUP);
        expect(action.id).toBe("id");
    });
    it('cleanPopup', () => {
        const action = POPUP.cleanPopups();
        expect(action.type).toEqual(POPUP.CLEAN_MAP_POPUPS);
    });
});

