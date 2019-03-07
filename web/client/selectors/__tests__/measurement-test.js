/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


const expect = require('expect');
const {
    isCoordinateEditorEnabledSelector,
    showAddAsAnnotationSelector
} = require('../measurement');

describe('Test maptype', () => {
    it('test isCoordinateEditorEnabledSelector', () => {
        const retval = isCoordinateEditorEnabledSelector({
            controls: {
                measure: {
                    showCoordinateEditor: true
                }
            },
            measurement: {
                isDrawing: false
            },
            maptype: {
                mapType: "openlayers"
            }
        });
        expect(retval).toBe(true);
    });


    it('test showAddAsAnnotationSelector', () => {
        const retval = showAddAsAnnotationSelector({measurement: {showAddAsAnnotation: true}});
        expect(retval).toExist();
        expect(retval).toBe(true);
    });
});
