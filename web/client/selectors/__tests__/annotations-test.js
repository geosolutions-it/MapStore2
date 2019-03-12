/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


const expect = require('expect');
const {
    modeSelector,
    annotationsListSelector
} = require('../annotations');


describe('Test annotations selectors', () => {
    it('modeSelector', () => {
        // list mode
        expect(modeSelector({
            annotations: { editing: false }
        })).toBe('list');
        // editing mode
        expect(modeSelector({
            annotations: {editing: true}
        })).toBe('editing');

        // detail mode
        expect(modeSelector({
            layers: {
                flat: [{id: 'annotations'}]
            },
            annotations: {
                current: true
            }
        })).toBe('detail');

        // list mode if annotations layer is not present and editing deactivated
        expect(modeSelector({
            layers: {
                flat: [{ id: 'OTHER_LAYER' }]
            },
            annotations: {
                current: true
            }
        })).toBe('list');
    });

    it('annotationsListSelector', () => {
        // list mode
        expect(annotationsListSelector({
            annotations: { editing: false }
        }).mode).toBe('list');
        // editing mode
        expect(annotationsListSelector({
            annotations: { editing: true }
        }).mode).toBe('editing');

        // detail mode
        expect(annotationsListSelector({
            layers: {
                flat: [{ id: 'annotations' }]
            },
            annotations: {
                current: true
            }
        }).mode).toBe('detail');

        // list mode if annotations layer is not present and editing deactivated
        expect(annotationsListSelector({
            layers: {
                flat: [{ id: 'OTHER_LAYER' }]
            },
            annotations: {
                current: true
            }
        }).mode).toBe('list');
    });
});
