/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import { mapOptionsToSaveSelector, registerCustomSaveHandler } from '../mapsave';

const state = {
    custom: {
        someProperty: "some value"
    },
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
    },
    timeline: {
        selectedLayer: "timelineTestLayer",
        settings: {
            endValuesSupport: true,
            snapRadioButtonEnabled: true
        },
        layers: [{
            id: "TEST", title: "Test1", checked: true
        }]
    },
    featuregrid: {
        attributes: {
            col1: {hide: true}
        }
    }
};
describe('Test mapsave selectors', () => {
    afterEach(() => {
        registerCustomSaveHandler('custom', null);
    });
    it('check widgets state is correctly selected', () => {
        const retVal = mapOptionsToSaveSelector(state);
        expect(retVal.widgetsConfig).toExist();
        expect(retVal.widgetsConfig.widgets).toBe(state.widgets.containers.floating.widgets);
        expect(retVal.widgetsConfig.layouts).toBe(state.widgets.containers.floating.layouts);
        expect(retVal.widgetsConfig.collapsed).toBe(state.widgets.containers.floating.collapsed);
    });
    it('check timeline state is correctly selected', () => {
        const retVal = mapOptionsToSaveSelector(state);
        expect(retVal.timelineData).toExist();
        expect(retVal.timelineData.endValuesSupport).toBe(true);
        expect(retVal.timelineData.selectedLayer).toBe("timelineTestLayer");
        expect(retVal.timelineData.snapRadioButtonEnabled).toBe(true);
        expect(retVal.timelineData.layers).toBeTruthy();
        expect(retVal.timelineData.layers).toEqual([{
            id: "TEST", title: "Test1", checked: true
        }]);
    });
    it('check featuregrid is selected', () => {
        const retVal = mapOptionsToSaveSelector(state);
        expect(retVal.featureGrid).toBeTruthy();
        expect(retVal.featureGrid.attributes).toEqual({col1: {hide: true}});
    });
    it('check custom save handlers', () => {
        registerCustomSaveHandler('custom', (s) => s.custom);
        const retVal = mapOptionsToSaveSelector(state);
        expect(retVal.custom).toExist();
        expect(retVal.custom.someProperty).toBe("some value");
    });
    it('check swipe is selected', () => {
        const retVal = mapOptionsToSaveSelector({...state, swipe: {mode: 'swipe', active: true, layerId: 'layer01'}});
        expect(retVal.swipe).toBeTruthy();
        expect(retVal.swipe.layerId).toEqual('layer01');
    });
});
