/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import {
    changeBoxSelectionStatus,
    CHANGE_BOX_SELECTION_STATUS,
    boxEnd,
    BOX_END
} from '../box';

describe('Test correctness of the box actions', () => {
    it('boxEnd', () => {
        const action = boxEnd({
            info: "INFO"
        });
        expect(action).toExist();
        expect(action.type).toEqual(BOX_END);
        expect(action.boxEndInfo.info).toEqual("INFO");
    });

    it('changeBoxSelectionStatus', () => {
        const action = changeBoxSelectionStatus("start");
        expect(action).toExist();
        expect(action.type).toEqual(CHANGE_BOX_SELECTION_STATUS);
        expect(action.status).toEqual("start");
    });
});
