/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
var expect = require('expect');
var {
    getAvailableInfoFormat,
    getAvailableInfoFormatLabels,
    getAvailableInfoFormatValues,
    getDefaultInfoFormatValue,
    buildIdentifyRequest,
    getValidator,
    getViewer,
    setViewer,
    getLabelFromValue,
    getDefaultInfoFormatValueFromLayer,
    getLayerFeatureInfo,
    filterRequestParams
} = require('../MapInfoUtils');

const CoordinatesUtils = require('../CoordinatesUtils');

class App extends React.Component {
    render() {
        return (<div></div>);
    }
}

describe('MapInfoUtils', () => {

    it('getAvailableInfoFormat', () => {
        let testData = {
            "TEXT": "text/plain",
            "HTML": "text/html",
            "PROPERTIES": "application/json",
            "TEMPLATE": "application/json"
        };
        let results = getAvailableInfoFormat();
        expect(results).toExist();
        expect(Object.keys(results).length).toBe(Object.keys(testData).length);

        let testKeys = Object.keys(testData);
        expect(Object.keys(results).reduce((prev, key) => {
            return prev
                && testKeys.indexOf(key) !== -1
                && results[key] === testData[key];
        }, true)).toBe(true);
    });

    it('getAvailableInfoFormatLabels', () => {
        let testData = ['TEXT', 'PROPERTIES', 'HTML', 'TEMPLATE'];
        let results = getAvailableInfoFormatLabels();
        expect(results).toExist();
        expect(results.length).toBe(4);

        expect(results.reduce((prev, label) => {
            return prev && testData.indexOf(label) !== -1;
        }, true)).toBe(true);
    });

    it('getAvailableInfoFormatValues', () => {
        let testData = ['text/plain', 'text/html', 'application/json'];
        let results = getAvailableInfoFormatValues();
        expect(results).toExist();
        expect(results.length).toBe(4);

        expect(results.reduce((prev, value) => {
            return prev && testData.indexOf(value) !== -1;
        }, true)).toBe(true);
    });

    it('getDefaultInfoFormatValue', () => {
        let results = getDefaultInfoFormatValue();
        expect(results).toExist();
        expect(results).toBe('text/plain');
    });

    it('it should returns a bbox', () => {
        let results = CoordinatesUtils.createBBox(-10, 10, -10, 10);
        expect(results).toExist();
        expect(results.maxx).toBe(-10);
    });
    it('buildIdentifyRequest should honour queryLayers', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wms",
            queryLayers: ["sublayer1", "sublayer2"],
            name: "layer",
            url: "http://localhost"
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.query_layers).toEqual("sublayer1,sublayer2");

        let layer2 = {
            type: "wms",
            name: "layer",
            url: "http://localhost"
        };
        let req2 = buildIdentifyRequest(layer2, props);
        expect(req2.request).toExist();
        expect(req2.request.query_layers).toEqual("layer");

        let layer3 = {
            type: "wms",
            name: "layer",
            queryLayers: [],
            url: "http://localhost"
        };
        let req3 = buildIdentifyRequest(layer3, props);
        expect(req3.request).toExist();
        expect(req3.request.query_layers).toEqual("");
    });

    it('buildIdentifyRequest works for wms layer', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wms",
            queryLayers: ["sublayer1", "sublayer2"],
            name: "layer",
            url: "http://localhost"
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.service).toBe('WMS');
    });

    it('buildIdentifyRequest works for wms layer with config featureInfo info_format', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wms",
            queryLayers: ["sublayer1", "sublayer2"],
            name: "layer",
            url: "http://localhost",
            featureInfo: {
                format: "HTML"
            }
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.service).toBe('WMS');
        expect(req1.request.info_format).toBe('text/html');
    });

    it('buildIdentifyRequest works for wms layer with config featureInfo viewer', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wms",
            queryLayers: ["sublayer1", "sublayer2"],
            name: "layer",
            url: "http://localhost",
            featureInfo: {
                format: "PROPERTIES",
                viewer: {
                    type: 'customViewer'
                }
            }
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.service).toBe('WMS');
        expect(req1.request.info_format).toBe('application/json');
        expect(req1.metadata.viewer.type).toBe('customViewer');
    });

    it('buildIdentifyRequest works for wmts layer', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wmts",
            name: "layer",
            url: "http://localhost"
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.service).toBe('WMTS');
    });

    it('buildIdentifyRequest works for vector layer', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 43,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "vector",
            name: "layer",
            features: [{properties: {}}]
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.lat).toBe(43);
    });

    it('getViewer and setViewer test', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wms",
            queryLayers: ["sublayer1", "sublayer2"],
            name: "layer",
            url: "http://localhost",
            featureInfo: {
                format: "PROPERTIES",
                viewer: {
                    type: 'customViewer'
                }
            }
        };
        let req1 = buildIdentifyRequest(layer1, props);
        expect(req1.request).toExist();
        expect(req1.request.service).toBe('WMS');
        expect(req1.request.info_format).toBe('application/json');
        expect(req1.metadata.viewer.type).toBe('customViewer');

        let get = getViewer(req1.metadata.viewer.type);
        expect(get).toNotExist();
        setViewer('customViewer', <App/>);
        let newGet = getViewer(req1.metadata.viewer.type);
        expect(newGet).toExist();
    });

    it('getValidator for vector layer', () => {
        let response = [
            {
                "response": {
                    "crs": null,
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [10.728187343305999, 43.95330251168864]
                        },
                        "properties": {
                            "OBJECTID_1": 8
                        },
                        "id": 0
                    }
                    ],
                    "totalFeatures": "unknown",
                    "type": "FeatureCollection"
                },
                "queryParams": {
                    "lat": 43.95229339335166,
                    "lng": 10.726776123046875
                },
                "layerMetadata": {
                    "fields": ["OBJECTID_1"],
                    "title": "prova",
                    "resolution": 152.8740565703525,
                    "buffer": 2
                },
                "format": "PROPERTIES"
            }
        ];

        let validator = getValidator('text/plain');
        let validResponses = validator.getValidResponses(response);
        expect(validResponses.length).toBe(1);
    });

    it('getValidResponses for vector layer', ()=>{
        let response = [
            {
                "response": {
                    "crs": null,
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [10.728187343305999, 43.95330251168864]
                        },
                        "properties": {
                            "OBJECTID_1": 8
                        },
                        "id": 0
                    }
                    ],
                    "totalFeatures": "unknown",
                    "type": "FeatureCollection"
                },
                "queryParams": {
                    "lat": 43.95229339335166,
                    "lng": 10.726776123046875
                },
                "layerMetadata": {
                    "fields": ["OBJECTID_1"],
                    "title": "prova",
                    "resolution": 152.8740565703525,
                    "buffer": 2
                },
                "format": "TEXT"
            },
            {
                "response": {
                    "crs": null,
                    "features": [],
                    "totalFeatures": "unknown",
                    "type": "FeatureCollection"
                },
                "queryParams": {
                    "lat": 43.95229339335166,
                    "lng": 10.726776123046875
                },
                "layerMetadata": {
                    "fields": ["OBJECTID_1"],
                    "title": "prova",
                    "resolution": 152.8740565703525,
                    "buffer": 2
                },
                "format": "TEXT"
            },
            {
                "response": "no features were found",
                "queryParams": {
                    "lat": 43.95229339335166,
                    "lng": 10.726776123046875
                },
                "layerMetadata": {
                    "fields": ["OBJECTID_1"],
                    "title": "prova",
                    "resolution": 152.8740565703525,
                    "buffer": 2
                },
                "format": "TEXT"
            },
            {
                "response": "Results for FeatureType 'https://gs-stable.geo-solutions.it/geoserver/geoserver:ny_poi'",
                "queryParams": {
                    "lat": 43.95229339335166,
                    "lng": 10.726776123046875
                },
                "layerMetadata": {
                    "fields": ["OBJECTID_1"],
                    "title": "prova",
                    "resolution": 152.8740565703525,
                    "buffer": 2
                },
                "format": "TEXT"
            },
            undefined
        ];
        const floatingToolEnabled = true;

        let validator = getValidator();
        let validResponses = validator.getValidResponses(response);
        let validResponsesFloatingTool = validator.getValidResponses(response, floatingToolEnabled);
        expect(validResponses.length).toBe(2);
        expect(validResponsesFloatingTool.length).toBe(1);

        // Validate format 'PROPERTIES'
        response.filter(r=> r !== undefined).forEach(res => {res.format = "PROPERTIES"; return res;});
        validResponses = validator.getValidResponses(response);
        validResponsesFloatingTool = validator.getValidResponses(response, floatingToolEnabled);
        expect(validResponses.length).toBe(2);
        expect(validResponsesFloatingTool.length).toBe(1);

        // Validate format 'JSON'
        response.filter(r=> r !== undefined).forEach(res => {res.format = "JSON"; return res;});
        validResponses = validator.getValidResponses(response);
        validResponsesFloatingTool = validator.getValidResponses(response, floatingToolEnabled);
        expect(validResponses.length).toBe(2);
        expect(validResponsesFloatingTool.length).toBe(1);
    });

    it('getNoValidResponses for vector layer', ()=>{
        let response = [
            {
                "response": {
                    "crs": null,
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [10.728187343305999, 43.95330251168864]
                        },
                        "properties": {
                            "OBJECTID_1": 8
                        },
                        "id": 0
                    }
                    ],
                    "totalFeatures": "unknown",
                    "type": "FeatureCollection"
                },
                "queryParams": {
                    "lat": 43.95229339335166,
                    "lng": 10.726776123046875
                },
                "layerMetadata": {
                    "fields": ["OBJECTID_1"],
                    "title": "prova",
                    "resolution": 152.8740565703525,
                    "buffer": 2
                },
                "format": "TEXT"
            },
            {
                "response": "no features were found",
                "queryParams": {
                    "lat": 43.95229339335166,
                    "lng": 10.726776123046875
                },
                "layerMetadata": {
                    "fields": ["OBJECTID_1"],
                    "title": "prova",
                    "resolution": 152.8740565703525,
                    "buffer": 2
                },
                "format": "TEXT"
            },
            {
                "response": {
                    features: []
                },
                "queryParams": {
                    "lat": 43.95229339335166,
                    "lng": 10.726776123046875
                },
                "layerMetadata": {
                    "fields": ["OBJECTID_1"],
                    "title": "prova",
                    "resolution": 152.8740565703525,
                    "buffer": 2
                },
                "format": "TEXT"
            },
            undefined
        ];

        let validator = getValidator();
        let noValidResponses = validator.getNoValidResponses(response);
        expect(noValidResponses.length).toBe(1);

        // Validate format 'PROPERTIES'
        response.filter(r=> r !== undefined).forEach(res => {res.format = "PROPERTIES"; return res;});
        noValidResponses = validator.getNoValidResponses(response);
        expect(noValidResponses.length).toBe(1);

        // Validate format 'JSON'
        response.filter(r=> r !== undefined).forEach(res => {res.format = "JSON"; return res;});
        noValidResponses = validator.getNoValidResponses(response);
        expect(noValidResponses.length).toBe(1);

    });

    it('get the label given the text/plain value', () => {
        let label = getLabelFromValue("text/plain");
        expect(label).toBe("TEXT");
    });
    it('get the label given the text/html value', () => {
        let label = getLabelFromValue("text/html");
        expect(label).toBe("HTML");
    });
    it('get the default label given the wrong value', () => {
        let label = getLabelFromValue("text_or_something_else");
        expect(label).toBe("TEXT");
    });

    it('getDefaultInfoFormatValueFromLayer', () => {
        const jsonFormat = getDefaultInfoFormatValueFromLayer({featureInfo: {format: "JSON"}}, {});
        expect(jsonFormat).toBe('application/json');
        const htmlFormat = getDefaultInfoFormatValueFromLayer({}, {format: "text/html"});
        expect(htmlFormat).toBe('text/html');
    });

    it('getLayerFeatureInfo', () => {
        expect(getLayerFeatureInfo()).toEqual({});
        expect(getLayerFeatureInfo({})).toEqual({});
        expect(getLayerFeatureInfo({featureInfo: {format: 'TEXT'}})).toEqual({format: 'TEXT'});
    });

    it('filterRequestParams', () => {
        const excludeParams = ["SLD_BODY"];
        const includeOptions = ["buffer", "cql_filter", "filter", "propertyName"];

        expect(filterRequestParams({
            SLD_BODY: '<Style/>',
            buffer: 'buffer',
            cql_filter: 'cql_filter',
            filter: 'filter',
            propertyName: 'propertyName',
            name: 'layer:01'
        }, [], [])).toEqual({});

        expect(filterRequestParams({
            name: 'layer:01'
        }, includeOptions, excludeParams)).toEqual({});

        expect(filterRequestParams({
            SLD_BODY: '<Style/>',
            buffer: 'buffer',
            cql_filter: 'cql_filter',
            filter: 'filter',
            propertyName: 'propertyName',
            name: 'layer:01'
        }, includeOptions, excludeParams)).toEqual({ buffer: 'buffer', cql_filter: 'cql_filter', filter: 'filter', propertyName: 'propertyName' });
    });

    it('buildIdentifyRequest cql_filter management for wms and wmts2', () => {
        let props = {
            map: {
                zoom: 0,
                projection: 'EPSG:4326'
            },
            point: {
                latlng: {
                    lat: 0,
                    lng: 0
                }
            }
        };
        let layer1 = {
            type: "wms",
            queryLayers: ["sublayer1", "sublayer2"],
            name: "layer",
            url: "http://localhost",
            params: {
                CQL_FILTER: "prop1 = 'value'"
            },
            featureInfo: {
                format: "PROPERTIES",
                viewer: {
                    type: 'customViewer'
                }
            }
        };
        let layer2 = {
            type: "wms",
            queryLayers: ["sublayer1", "sublayer2"],
            name: "layer",
            url: "http://localhost",
            filterObj: {
                filterFields: [
                    {
                        groupId: 1,
                        attribute: "prop2",
                        exception: null,
                        operator: "=",
                        rowId: "3",
                        type: "number",
                        value: "value2"
                    }],
                groupFields: [{
                    id: 1,
                    index: 0,
                    logic: "OR"
                }]
            },
            featureInfo: {
                format: "PROPERTIES",
                viewer: {
                    type: 'customViewer'
                }
            }
        };
        const layer3 = {...layer1, ...layer2};
        const wmts1 = {...layer1, type: "wmts"};
        const wmts2 = { ...layer2, type: "wmts" };
        const wmts3 = { ...layer3, type: "wmts" };
        expect(buildIdentifyRequest(layer1, props).request.CQL_FILTER).toBe("prop1 = 'value'");
        expect(buildIdentifyRequest(layer2, props).request.CQL_FILTER).toBe("(\"prop2\" = 'value2')");
        // the filterObj and CQL_FILTER must be merged into a unique filter
        expect(buildIdentifyRequest(layer3, props).request.CQL_FILTER).toBe("((\"prop2\" = 'value2')) AND (prop1 = 'value')");
        expect(buildIdentifyRequest(wmts1, props).request.CQL_FILTER).toBe("prop1 = 'value'");
        expect(buildIdentifyRequest(wmts2, props).request.CQL_FILTER).toBe("(\"prop2\" = 'value2')");
        // the filterObj and CQL_FILTER must be merged into a unique filter
        expect(buildIdentifyRequest(wmts3, props).request.CQL_FILTER).toBe("((\"prop2\" = 'value2')) AND (prop1 = 'value')");

    });

});
