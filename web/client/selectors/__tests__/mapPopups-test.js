/*
* Copyright 2024, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


import expect from 'expect';

import {
    mapPopupsSelector,
    hideEmptyPopupSelector
} from '../mapPopups';

describe('Test mapPopups', () => {
    it('test mapPopupsSelector', () => {
        const popups = mapPopupsSelector({mapPopups: {popups: [{"key": "value"}]}});

        expect(popups).toExist();
        expect(popups).toEqual([{key: "value"}]);
    });

    it('test hideEmptyPopupSelector true', () => {
        const hideEmptyPopupOption = hideEmptyPopupSelector({mapPopups: {popups: [{"key": "value"}], hideEmptyPopupOption: true}});

        expect(hideEmptyPopupOption).toExist();
        expect(hideEmptyPopupOption).toBe(true);
    });
    it('test hideEmptyPopupSelector false', () => {
        const hideEmptyPopupOption = hideEmptyPopupSelector({mapPopups: {popups: [{"key": "value"}], hideEmptyPopupOption: false}});

        expect(hideEmptyPopupOption).toBeFalsy();
    });
});
