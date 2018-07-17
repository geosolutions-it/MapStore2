/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    queryPanelSelector,
    wfsDownloadAvailable,
    wfsDownloadSelector,
    widgetBuilderAvailable,
    widgetBuilderSelector
} = require("../controls");

const state = {
    controls: {
        queryPanel: {
            enabled: true
        },
        wfsdownload: {
            available: true,
            enabled: true
        },
        widgetBuilder: {
            available: true,
            enabled: true
        },
        featuregrid: {
            enabled: true
        }
    }
};

describe('Test controls selectors', () => {
    it('test queryPanelSelector', () => {
        const retVal = queryPanelSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test wfsDownloadAvailable', () => {
        const retVal = wfsDownloadAvailable(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test wfsDownloadSelector', () => {
        const retVal = wfsDownloadSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test widgetBuilderAvailable', () => {
        const retVal = widgetBuilderAvailable(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test widgetBuilderAvailable no widgetBuilder in state', () => {
        const retVal = widgetBuilderAvailable({});
        expect(retVal).toBe(false);
    });
    it('test widgetBuilderSelector', () => {
        const retVal = widgetBuilderSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
});
