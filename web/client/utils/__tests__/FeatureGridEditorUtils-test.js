/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    forceSelection
} = require('../FeatureGridEditorUtils');

describe('FeatureGridEditorUtils', () => {
    it('forceSelection allowEmpty=true', () => {
        const oldValue = "old";
        const changedValue = "new";
        const data = ["new", "old", "agile"];
        const allowEmpty = true;
        const newVal = forceSelection({oldValue, changedValue, data, allowEmpty});
        expect(newVal).toBe("new");
    });
    it('forceSelection allowEmpty=true with "" value', () => {
        const oldValue = "old";
        const changedValue = "";
        const data = ["new", "old", "agile"];
        const allowEmpty = true;
        const newVal = forceSelection({oldValue, changedValue, data, allowEmpty});
        expect(newVal).toBe("");
    });
    it('forceSelection allowEmpty=false with "" value', () => {
        const oldValue = "old";
        const changedValue = "";
        const data = ["new", "old", "agile"];
        const allowEmpty = false;
        const newVal = forceSelection({oldValue, changedValue, data, allowEmpty});
        expect(newVal).toBe("old");
    });
    it('forceSelection allowEmpty=false with "agile" value', () => {
        const oldValue = "old";
        const changedValue = "agile";
        const data = ["new", "old", "agile"];
        const allowEmpty = false;
        const newVal = forceSelection({oldValue, changedValue, data, allowEmpty});
        expect(newVal).toBe("agile");
    });
});
