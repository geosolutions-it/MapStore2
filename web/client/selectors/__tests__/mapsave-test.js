/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    mapOptionsToSaveSelector
} = require("../mapsave");

const state = {
    widgets: {
        containers: {
            floating: {
                widgets: [{id: "collapsed"}],
                layouts: { md: {}},
                collapsed: {
                    collapsed: {
                        layout: {x: 1, y: 1, w: 1, h: 1},
                        layouts: {md: { x: 1, y: 1, w: 1, h: 1 }}
                    }
                }
            }
        }
    }
};
describe('Test mapsave selectors', () => {
    it('check widgets state is correctly selected', () => {
        const retVal = mapOptionsToSaveSelector(state);
        expect(retVal.widgetsConfig).toExist();
        expect(retVal.widgetsConfig.widgets).toBe(state.widgets.containers.floating.widgets);
        expect(retVal.widgetsConfig.layouts).toBe(state.widgets.containers.floating.layouts);
        expect(retVal.widgetsConfig.collapsed).toBe(state.widgets.containers.floating.collapsed);
    });
});
