/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


const expect = require('expect');
const {mapInfoRequestsSelector, generalInfoFormatSelector, stopGetFeatureInfoSelector} = require('../mapinfo');

describe('Test mapinfo selectors', () => {
    it('test generalInfoFormatSelector default value', () => {
        const mapinfo = generalInfoFormatSelector({});
        expect(mapinfo).toBe("text/plain");
    });
    it('test generalInfoFormatSelector infoFormat: undefined', () => {
        const mapinfo = generalInfoFormatSelector({mapInfo: {infoFormat: undefined}});
        expect(mapinfo).toBe("text/plain");
    });
    it('test generalInfoFormatSelector ', () => {
        const mapinfo = generalInfoFormatSelector({mapInfo: {infoFormat: "text/html"}});

        expect(mapinfo).toExist();
        expect(mapinfo).toBe("text/html");
    });
    it('test mapInfoRequestsSelector no state', () => {
        const props = mapInfoRequestsSelector({});
        expect(props).toEqual([]);
    });
    it('test mapInfoRequestsSelector', () => {
        const props = mapInfoRequestsSelector({
            mapInfo: {
                requests: ['request']
            }
        });
        expect(props).toEqual(['request']);
    });
    it('test stopGetFeatureInfoSelector', () => {
        const props = stopGetFeatureInfoSelector({
            mapInfo: {
                enabled: true
            }
        });
        expect(props).toEqual(false);
    });
    it('test stopGetFeatureInfoSelector when identify is disabled', () => {
        const props = stopGetFeatureInfoSelector({
            mapInfo: {
                enabled: false
            }
        });
        expect(props).toEqual(true);
    });
    it('test stopGetFeatureInfoSelector with draw active', () => {
        const props = stopGetFeatureInfoSelector({
            mapInfo: {
                enabled: true
            },
            draw: {
                drawStatus: 'start'
            }
        });
        expect(props).toEqual(true);
    });
    it('test stopGetFeatureInfoSelector with measurement active', () => {
        const props = stopGetFeatureInfoSelector({
            mapInfo: {
                enabled: true
            },
            measurement: {
                areaMeasureEnabled: true
            }
        });
        expect(props).toEqual(true);
    });
    it('test stopGetFeatureInfoSelector with annotations editing', () => {
        const props = stopGetFeatureInfoSelector({
            mapInfo: {
                enabled: true
            },
            annotations: {
                editing: {}
            }
        });
        expect(props).toEqual(true);
    });
    it('test stopGetFeatureInfoSelector with grid editing', () => {
        const props = stopGetFeatureInfoSelector({
            mapInfo: {
                enabled: true
            },
            featuregrid: {
                mode: "EDIT"
            }
        });
        expect(props).toEqual(true);
    });

});
