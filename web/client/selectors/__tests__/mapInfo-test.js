/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


const expect = require('expect');
const {
    mapInfoRequestsSelector,
    generalInfoFormatSelector,
    stopGetFeatureInfoSelector,
    isMapInfoOpen,
    mapInfoConfigurationSelector,
    showEmptyMessageGFISelector
} = require('../mapInfo');

describe('Test mapinfo selectors', () => {
    it('test generalInfoFormatSelector default value', () => {
        const mapinfo = generalInfoFormatSelector({});
        expect(mapinfo).toBe("text/plain");
    });
    it('test generalInfoFormatSelector infoFormat: undefined', () => {
        const mapinfo = generalInfoFormatSelector({mapInfo: {configuration: {infoFormat: undefined}}});
        expect(mapinfo).toBe("text/plain");
    });
    it('test generalInfoFormatSelector ', () => {
        const mapinfo = generalInfoFormatSelector({mapInfo: {configuration: {infoFormat: "text/html"}}});
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
    it('test isMapInfoOpen no state', () => {
        const props = isMapInfoOpen({});
        expect(props).toEqual(false);
    });
    it('test isMapInfoOpen', () => {
        const props = isMapInfoOpen({
            mapInfo: {
                requests: ['request']
            }
        });
        expect(props).toEqual(true);
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
            controls: {
                measure: {
                    enabled: true
                }
            },
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
    it('test mapInfoConfigurationSelector', () => {
        const infoFormat = "text/html";
        const showEmptyMessageGFI = true;
        const props = mapInfoConfigurationSelector({
            mapInfo: {
                configuration: {
                    infoFormat,
                    showEmptyMessageGFI
                }
            }
        });
        expect(props.infoFormat).toEqual(infoFormat);
        expect(props.showEmptyMessageGFI).toEqual(showEmptyMessageGFI);
    });
    it('test showEmptyMessageGFISelector true', () => {
        const showEmptyMessageGFI = false;
        let props = showEmptyMessageGFISelector({
            mapInfo: {
                configuration: {
                    showEmptyMessageGFI
                }
            }
        });
        expect(props).toEqual(showEmptyMessageGFI);
        props = showEmptyMessageGFISelector({
            mapInfo: {}
        });
        expect(props).toEqual(true);
    });

});
