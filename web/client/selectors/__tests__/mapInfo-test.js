/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


const expect = require('expect');
const { set } = require('../../utils/ImmutableUtils');
const {
    mapInfoRequestsSelector,
    generalInfoFormatSelector,
    stopGetFeatureInfoSelector,
    isMapInfoOpen,
    mapInfoConfigurationSelector,
    showEmptyMessageGFISelector,
    clickPointSelector,
    clickedPointWithFeaturesSelector,
    highlightStyleSelector,
    itemIdSelector,
    filterNameListSelector,
    overrideParamsSelector,
    mapTriggerSelector
} = require('../mapInfo');

const QUERY_PARAMS = {
    service: 'WMS',
    version: '1.1.1',
    request: 'GetFeatureInfo',
    exceptions: 'application/json',
    id: 'tiger:poi__7',
    layers: 'tiger:poi',
    query_layers: 'tiger:poi',
    x: 51,
    y: 51,
    height: 101,
    width: 101,
    srs: 'EPSG:3857',
    bbox: '-8238713.7375893425,4969819.729231167,-8238472.483218817,4970060.983601692',
    feature_count: 10,
    info_format: 'text/plain',
    ENV: 'locale:it'
};
const RESPONSE_STATE = {
    mapInfo: {
        enabled: true,
        highlightStyle: {
            color: '#3388ff',
            weight: 4,
            radius: 4,
            dashArray: '',
            fillColor: '#3388ff',
            fillOpacity: 0.2
        },
        configuration: {},
        showMarker: true,
        responses: [
            {
                response: 'Results for FeatureType',
                queryParams: QUERY_PARAMS,
                layerMetadata: {
                    title: 'Manhattan (NY) points of interest',
                    viewer: {},
                    featureInfo: {}
                }
            }
        ],
        requests: [
            {
                request: QUERY_PARAMS,
                reqId: '4e030000-514a-11e9-90f1-3db233bf30bf'
            }
        ],
        centerToMarker: 'disabled',
        clickPoint: {
            pixel: {
                x: 873,
                y: 576
            },
            latlng: {
                lat: 40.71190648169588,
                lng: -74.00854110717773
            },
            modifiers: {
                alt: false,
                ctrl: false,
                shift: false
            }
        },
        clickLayer: null,
        index: 0
    }
};
const RESPONSE_STATE_WITH_FEATURES_METADATA = set('mapInfo.responses[0].layerMetadata', {
    ...RESPONSE_STATE.mapInfo.responses[0].layerMetadata,
    features: [
        {
            type: 'Feature',
            id: 'poi.4',
            geometry: {
                type: 'Point',
                coordinates: [
                    -8238596.71007066,
                    4969946.10852694
                ]
            },
            geometry_name: 'the_geom',
            properties: {
                NAME: 'lox',
                THUMBNAIL: 'pics/22037884-Ti.jpg',
                MAINPAGE: 'pics/22037884-L.jpg',
                bbox: [
                    -8238596.71007066,
                    4969946.10852694,
                    -8238596.71007066,
                    4969946.10852694
                ]
            }
        }
    ],
    featuresCrs: 'EPSG:3857'
}, RESPONSE_STATE);
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
    it('test stopGetFeatureInfoSelector with identify in context', () => {
        const stop = stopGetFeatureInfoSelector({
            mapInfo: {
                enabled: true
            },
            context: {
                currentContext: {
                    plugins: {
                        desktop: [{ name: "Identify" }]
                    }
                }
            }
        });
        expect(stop).toEqual(false); // it should pass
    });
    it('test stopGetFeatureInfoSelector with identify not in context', () => {
        const stop = stopGetFeatureInfoSelector({
            mapInfo: {
                enabled: true
            },
            context: {
                currentContext: {
                    plugins: {
                        desktop: []
                    }
                }
            }
        });
        expect(stop).toEqual(true); // it should be stopped
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
    it('test highlightStyleSelector', () => {
        const TEST = {
            color: 'test'
        };
        // check default
        expect(highlightStyleSelector({})).toEqual({
            color: '#3388ff',
            weight: 4,
            radius: 4,
            dashArray: '',
            fillColor: '#3388ff',
            fillOpacity: 0.2
        });
        expect(highlightStyleSelector({
            mapInfo: {
                highlightStyle: TEST
            }
        })).toBe(TEST);
    });
    it('test clickPointSelector', () => {
        expect(clickPointSelector(RESPONSE_STATE)).toBe(RESPONSE_STATE.mapInfo.clickPoint);
    });
    it('test itemIdSelector', () => {
        const itemId = "itemId";
        expect(itemIdSelector({mapInfo: {...RESPONSE_STATE, itemId}})).toBe(itemId);
    });
    it('test filterNameListSelector', () => {
        const filterNameList = ["layer"];
        expect(filterNameListSelector({mapInfo: {...RESPONSE_STATE, filterNameList}})).toEqual(filterNameList);
    });
    it('test overrideParamsSelector', () => {
        const overrideParams = {"ws:layername": {info_format: "application/json"}};
        expect(overrideParamsSelector({mapInfo: {...RESPONSE_STATE, overrideParams}})).toEqual(overrideParams);
    });
    it('test clickPointSelector', () => {
        expect(clickPointSelector(RESPONSE_STATE)).toBe(RESPONSE_STATE.mapInfo.clickPoint);
    });
    it('test clickedPointWithFeaturesSelector', () => {
        // default
        expect(clickedPointWithFeaturesSelector({})).toBe(undefined);
        expect(clickedPointWithFeaturesSelector(RESPONSE_STATE)).toExist();

        const clickedPoint = clickedPointWithFeaturesSelector(
            RESPONSE_STATE_WITH_FEATURES_METADATA
        );
        expect(clickedPoint).toExist();
        expect(clickedPoint.pixel).toExist();
        expect(clickedPoint.latlng).toExist();

        // when highlight is false, do not return features
        expect(clickedPoint.features).toNotExist();
        expect(clickedPoint.featuresCrs).toNotExist();

        // with highlight and features, returns features
        const STATE_HIGHLIGHT = { mapInfo: {...RESPONSE_STATE_WITH_FEATURES_METADATA.mapInfo, highlight: true}};
        const clickedPointFeatures = clickedPointWithFeaturesSelector(STATE_HIGHLIGHT);
        expect(clickedPointFeatures.features).toExist();
        expect(clickedPointFeatures.features.length).toBe(1);
        // radius have to be included for points, multipoints...
        expect(clickedPointFeatures.features[0].style.radius).toExist();

        // radius have to be excluded for polygons ( or the style will be not visible, because interpreted as a Circle)... (TODO: do it in VectorStyle)
        expect(clickedPointWithFeaturesSelector(
            set('mapInfo.responses[0].layerMetadata.features[0].geometry.type', "Polygon", STATE_HIGHLIGHT)
        ).features[0].style.radius).toNotExist();
    });
    it('test mapTriggerSelector', () => {
        // when no mapInfo object is not present in state
        expect(mapTriggerSelector({})).toBe('click');
        // when no trigger in the configuration
        expect(mapTriggerSelector({mapInfo: { configuration: {} }})).toBe('click');
        // when mapInfo is present
        expect(mapTriggerSelector({mapInfo: { configuration: { trigger: 'hover' } }})).toBe('hover');
    });
});
