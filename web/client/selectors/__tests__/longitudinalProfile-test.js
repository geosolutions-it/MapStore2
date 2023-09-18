/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    CONTROL_NAME,
    CONTROL_DOCK_NAME,
    CONTROL_PROPERTIES_NAME,
    LONGITUDINAL_VECTOR_LAYER_ID,
    DEFAULT_NODATA_THRESHOLD
} from '../../plugins/longitudinalProfile/constants';

import {
    isActiveMenuSelector,
    isDockOpenSelector,
    isParametersOpenSelector,
    isActiveSelector,
    isInitializedSelector,
    isLoadingSelector,
    dataSourceModeSelector,
    crsSelectedDXFSelector,
    geometrySelector,
    infosSelector,
    pointsSelector,
    projectionSelector,
    configSelector,
    noDataThresholdSelector,
    referentialSelector,
    chartTitleSelector,
    distanceSelector,
    isSupportedLayerSelector,
    isListeningClickSelector,
    isMaximizedSelector,
    vectorLayerFeaturesSelector
} from '../longitudinalProfile';

describe('Test longitudinalProfile selectors', () => {
    it('isParametersOpenSelector', () => {
        const controls = {
            [CONTROL_PROPERTIES_NAME]: {
                enabled: true
            }
        };
        expect(isParametersOpenSelector({controls})).toEqual(true);
    });
    it('isActiveSelector', () => {
        const controls = {
            [CONTROL_NAME]: {
                enabled: true
            }
        };
        expect(isActiveSelector({controls})).toEqual(true);
    });
    it('isDockOpenSelector', () => {
        const controls = {
            [CONTROL_DOCK_NAME]: {
                enabled: true
            }
        };
        expect(isDockOpenSelector({controls})).toEqual(true);
    });
    it('isActiveMenuSelector param opened', () => {
        const longitudinalProfile = {
        };

        const controls = {
            [CONTROL_PROPERTIES_NAME]: {
                enabled: true
            }
        };

        expect(
            isActiveMenuSelector({
                controls,
                longitudinalProfile
            })
        ).toEqual(true);
    });
    it('isActiveMenuSelector not in idle state', () => {
        const longitudinalProfile = {
            mode: "draw"
        };

        const controls = {
            [CONTROL_PROPERTIES_NAME]: {
                enabled: false
            }
        };

        expect(
            isActiveMenuSelector({
                controls,
                longitudinalProfile
            })
        ).toEqual(true);
    });
    it('isActiveMenuSelector in idle state', () => {
        const longitudinalProfile = {
            mode: "idle"
        };

        const controls = {
            [CONTROL_PROPERTIES_NAME]: {
                enabled: false
            }
        };

        expect(
            isActiveMenuSelector({
                controls,
                longitudinalProfile
            })
        ).toEqual(false);
    });
    it('isInitializedSelector', () => {
        const longitudinalProfile = {
            initialized: true
        };
        expect(isInitializedSelector({longitudinalProfile})).toEqual(true);
    });
    it('isLoadingSelector', () => {
        const longitudinalProfile = {
            loading: true
        };
        expect(isLoadingSelector({longitudinalProfile})).toEqual(true);
    });
    it('dataSourceModeSelector', () => {
        const longitudinalProfile = {
            mode: "mode"
        };
        expect(dataSourceModeSelector({longitudinalProfile})).toEqual("mode");
    });
    it('crsSelectedDXFSelector', () => {
        const longitudinalProfile = {
            crsSelectedDXF: "crsSelectedDXF"
        };
        expect(crsSelectedDXFSelector({longitudinalProfile})).toEqual("crsSelectedDXF");
        expect(crsSelectedDXFSelector({})).toEqual("EPSG:3857");
    });
    it('geometrySelector', () => {
        const longitudinalProfile = {
            geometry: {}
        };
        expect(geometrySelector({longitudinalProfile})).toEqual({});
    });
    it('infosSelector', () => {
        const longitudinalProfile = {
            infos: {}
        };
        expect(infosSelector({longitudinalProfile})).toEqual({});
    });
    it('pointsSelector', () => {
        const longitudinalProfile = {
            points: {}
        };
        expect(pointsSelector({longitudinalProfile})).toEqual({});
    });
    it('projectionSelector', () => {
        const longitudinalProfile = {
            projection: ""
        };
        expect(projectionSelector({longitudinalProfile})).toEqual("");
    });
    it('configSelector', () => {
        const longitudinalProfile = {
            config: {}
        };
        expect(configSelector({longitudinalProfile})).toEqual({});
    });
    it('referentialSelector', () => {
        const longitudinalProfile = {
            config: {referential: ""}
        };
        expect(referentialSelector({longitudinalProfile})).toEqual("");
    });
    it('noDataThresholdSelector', () => {
        expect(noDataThresholdSelector({longitudinalProfile: {
            config: {noDataThreshold: 1234}
        }})).toEqual(1234);

        expect(noDataThresholdSelector({longitudinalProfile: {
            config: {}
        }})).toEqual(DEFAULT_NODATA_THRESHOLD);
    });
    it('chartTitleSelector', () => {
        const longitudinalProfile = {
            config: {chartTitle: ""}
        };
        expect(chartTitleSelector({longitudinalProfile})).toEqual("");
    });
    it('distanceSelector', () => {
        const longitudinalProfile = {
            config: {distance: ""}
        };
        expect(distanceSelector({longitudinalProfile})).toEqual("");
    });
    it('isSupportedLayerSelector', () => {
        const longitudinalProfile = {
            config: {distance: ""}
        };

        const layers = {
            selected: ["layer-id"],
            flat: [{
                id: "layer-id",
                visibility: true,
                search: {
                    type: "wfs"
                },
                type: "wms"
            }]
        };

        expect(isSupportedLayerSelector({longitudinalProfile, layers})).toEqual(true);
    });
    it('isListeningClickSelector', () => {
        const map = {
            present: {
                eventListeners: {
                    click: [CONTROL_NAME]
                }
            }
        };
        expect(isListeningClickSelector({map})).toEqual(true);
    });
    it('isMaximizedSelector', () => {
        const longitudinalProfile = {
            maximized: true
        };
        expect(isMaximizedSelector({longitudinalProfile})).toEqual(true);
    });
    it('vectorLayerFeaturesSelector', () => {
        const longitudinalProfile = {
            maximized: true
        };
        const additionallayers = [{
            id: LONGITUDINAL_VECTOR_LAYER_ID,
            options: {
                id: LONGITUDINAL_VECTOR_LAYER_ID,
                visibility: true,
                search: {
                    type: "wfs"
                },
                type: "wms",
                features: []
            }
        }];
        expect(vectorLayerFeaturesSelector({longitudinalProfile, additionallayers})).toEqual([]);
    });

});
