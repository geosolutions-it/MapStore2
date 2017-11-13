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
    cssStateSelector
} = require("../controls");

const state = {
    controls: {
        queryPanel: {
            enabled: true
        },
        wfsdownload: {
            available: true
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
    it('test cssStateSelector', () => {
        const retVal = cssStateSelector({
            controls: {
                queryPanel: {
                    enabled: true
                },
                drawer: {
                    enabled: true
                },
                annotations: {
                    enabled: true
                },
                metadataexplorer: {
                    enabled: true
                }
            },
            featuregrid: {
                open: true
            },
            mapInfo: {
                requests: ['req']
            },
            browser: {
                mobile: true
            }
        });
        expect(retVal).toExist();
        expect(retVal).toBe(' mobile mapstore-drawer-open mapstore-featuregrid-open mapstore-queryPanel-open mapstore-right-panel-open');
    });

    it('test cssStateSelector false value', () => {
        const retVal = cssStateSelector({
            controls: {
                queryPanel: {
                    enabled: false
                },
                drawer: {
                    enabled: false
                },
                annotations: {
                    enabled: false
                },
                metadataexplorer: {
                    enabled: false
                }
            },
            featuregrid: {
                open: false
            },
            mapInfo: {
                requests: []
            },
            browser: {
                mobile: false
            }
        });
        expect(retVal).toExist();
        expect(retVal).toBe(' desktop');
    });

    it('test cssStateSelector no data', () => {
        const retVal = cssStateSelector({});
        expect(retVal).toExist();
        expect(retVal).toBe(' desktop');
    });

});
