/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {
    createInverseMaskFromPolygonFeatureCollection,
    mergeViewLayers,
    formatClippingFeatures,
    getZoomFromHeight,
    getHeightFromZoom,
    cleanMapViewSavedPayload,
    isViewLayerChanged,
    pickViewLayerProperties,
    pickViewGroupProperties,
    mergeViewGroups
} from '../MapViewsUtils';

describe('Test MapViewsUtils', () => {
    it('createInverseMaskFromPolygonFeatureCollection', (done) => {
        createInverseMaskFromPolygonFeatureCollection({
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [
                                    8.931329125577776,
                                    44.40689401356852
                                ],
                                [
                                    8.931329125577776,
                                    44.40035268585416
                                ],
                                [
                                    8.939979994731459,
                                    44.40035268585416
                                ],
                                [
                                    8.939979994731459,
                                    44.40689401356852
                                ],
                                [
                                    8.931329125577776,
                                    44.40689401356852
                                ]
                            ]
                        ]
                    },
                    properties: {}
                }
            ]
        }, { offset: 100 }).then((inverseCollection) => {
            expect(inverseCollection.features.length).toBe(1);
            done();
        }).catch((e) => {
            done(e);
        });
    });
    it('mergeViewLayers', () => {
        const layers = [ { id: 'layer.01', type: '3dtiles', url: 'tileset.json', visibility: false } ];
        expect(mergeViewLayers(layers)).toEqual(layers);
        const view = { layers: [ { id: 'layer.01', visibility: true } ] };
        expect(mergeViewLayers(layers, view)).toEqual([ {
            id: 'layer.01',
            type: '3dtiles',
            url: 'tileset.json',
            visibility: true,
            changed: true
        } ]);
    });
    it('formatClippingFeatures', () => {
        expect(formatClippingFeatures()).toEqual(undefined);
        let feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [
                            8.931329125577776,
                            44.40689401356852
                        ],
                        [
                            8.931329125577776,
                            44.40035268585416
                        ],
                        [
                            8.939979994731459,
                            44.40035268585416
                        ],
                        [
                            8.939979994731459,
                            44.40689401356852
                        ],
                        [
                            8.931329125577776,
                            44.40689401356852
                        ]
                    ]
                ]
            },
            properties: {}
        };
        expect(formatClippingFeatures([feature])[0].id).toEqual('Feature 1');
        feature = {
            ...feature,
            id: 0
        };
        expect(formatClippingFeatures([feature])[0].id).toEqual('Feature 0');
        feature = {
            ...feature,
            id: 'feature.01'
        };
        expect(formatClippingFeatures([feature])[0].id).toEqual('feature.01');
    });
    it('formatClippingFeatures should remove height from coordinates', () => {
        const feature = {
            type: 'Feature',
            id: 'feature.01',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [
                            8.931329125577776,
                            44.40689401356852,
                            10
                        ],
                        [
                            8.931329125577776,
                            44.40035268585416,
                            20
                        ],
                        [
                            8.939979994731459,
                            44.40035268585416,
                            15
                        ],
                        [
                            8.939979994731459,
                            44.40689401356852,
                            7
                        ],
                        [
                            8.931329125577776,
                            44.40689401356852,
                            2
                        ]
                    ]
                ]
            },
            properties: {}
        };
        expect(formatClippingFeatures([feature])).toEqual([
            {
                type: 'Feature',
                id: 'feature.01',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [
                                8.931329125577776,
                                44.40689401356852
                            ],
                            [
                                8.931329125577776,
                                44.40035268585416
                            ],
                            [
                                8.939979994731459,
                                44.40035268585416
                            ],
                            [
                                8.939979994731459,
                                44.40689401356852
                            ],
                            [
                                8.931329125577776,
                                44.40689401356852
                            ]
                        ]
                    ]
                },
                properties: {}
            }
        ]);
    });
    it('getZoomFromHeight', () => {
        expect(Math.round(getZoomFromHeight(1000))).toBe(17);
    });
    it('getHeightFromZoom', () => {
        expect(Math.round(getHeightFromZoom(17))).toBe(1221);
    });
    it('cleanMapViewSavedPayload remove resources if not used', () => {
        const mapViews = cleanMapViewSavedPayload({
            views: [],
            resources: [
                {
                    id: 'resource.01',
                    data: {
                        id: 'layer.01',
                        type: 'wfs',
                        url: '/geoserver/wfs',
                        name: 'layer'
                    }
                }
            ]
        });
        expect(mapViews.resources.length).toBe(0);
    });
    it('cleanMapViewSavedPayload remove layers from view if not available anymore in map', () => {
        const mapViews = cleanMapViewSavedPayload({
            views: [
                {
                    id: 'view.01',
                    layers: [
                        {
                            id: 'layer.01',
                            type: 'wfs',
                            url: '/geoserver/wfs',
                            name: 'layer'
                        }
                    ]
                }
            ]
        }, []);
        expect(mapViews.views[0].layers.length).toBe(0);
    });
    it('cleanMapViewSavedPayload remove layers from view if not available anymore in map', () => {
        const mapViews = cleanMapViewSavedPayload({
            views: [
                {
                    id: 'view.01',
                    layers: [
                        {
                            id: 'layer.01',
                            type: 'wfs',
                            url: '/geoserver/wfs',
                            name: 'layer'
                        }
                    ]
                }
            ]
        }, []);
        expect(mapViews.views[0].layers.length).toBe(0);
    });
    it('cleanMapViewSavedPayload remove feature collection from resources', () => {
        const mapViews = cleanMapViewSavedPayload({
            views: [
                {
                    id: 'view.01',
                    mask: {
                        resourceId: 'resource.01'
                    },
                    layers: [
                        {
                            id: 'layer.01',
                            type: 'wfs',
                            url: '/geoserver/wfs',
                            name: 'layer',
                            clippingLayerResourceId: 'resource.02'
                        }
                    ]
                }
            ],
            resources: [
                {
                    id: 'resource.01',
                    data: {
                        id: 'layer.01',
                        type: 'wfs',
                        url: '/geoserver/wfs',
                        name: 'layer',
                        collection: {
                            type: 'FeatureCollection',
                            features: []
                        }
                    }
                },
                {
                    id: 'resource.02',
                    data: {
                        id: 'layer.02',
                        type: 'vector',
                        name: 'layer',
                        collection: {
                            type: 'FeatureCollection',
                            features: []
                        }
                    }
                }
            ]
        }, [{ id: 'layer.01' }, { id: 'layer.02' }]);
        expect(mapViews.resources).toEqual(
            [
                {
                    id: 'resource.01',
                    data: {
                        id: 'layer.01',
                        type: 'wfs',
                        url: '/geoserver/wfs',
                        name: 'layer'
                    }
                },
                {
                    id: 'resource.02',
                    data: {
                        id: 'layer.02',
                        type: 'vector',
                        name: 'layer'
                    }
                }
            ]
        );
    });
    it('cleanMapViewSavedPayload persist feature collection if original vector layer is not available anymore', () => {
        const mapViews = cleanMapViewSavedPayload({
            views: [
                {
                    id: 'view.01',
                    mask: {
                        resourceId: 'resource.01'
                    },
                    layers: [
                        {
                            id: 'layer.01',
                            type: 'wfs',
                            url: '/geoserver/wfs',
                            name: 'layer',
                            clippingLayerResourceId: 'resource.02'
                        }
                    ]
                }
            ],
            resources: [
                {
                    id: 'resource.01',
                    data: {
                        id: 'layer.01',
                        type: 'wfs',
                        url: '/geoserver/wfs',
                        name: 'layer',
                        collection: {
                            type: 'FeatureCollection',
                            features: []
                        }
                    }
                },
                {
                    id: 'resource.02',
                    data: {
                        id: 'layer.02',
                        type: 'vector',
                        name: 'layer',
                        collection: {
                            type: 'FeatureCollection',
                            features: []
                        }
                    }
                }
            ]
        }, [{ id: 'layer.01' }]);
        expect(mapViews.resources).toEqual(
            [
                {
                    id: 'resource.01',
                    data: {
                        id: 'layer.01',
                        type: 'wfs',
                        url: '/geoserver/wfs',
                        name: 'layer'
                    }
                },
                {
                    id: 'resource.02',
                    data: {
                        id: 'layer.02',
                        type: 'vector',
                        name: 'layer',
                        collection: {
                            type: 'FeatureCollection',
                            features: []
                        }
                    }
                }
            ]
        );
    });
    it('isViewLayerChanged', () => {
        expect(isViewLayerChanged({ }, { })).toBe(false);
        expect(isViewLayerChanged({ title: 'Old title' }, { title: 'New title' })).toBe(false);
        expect(isViewLayerChanged({ visibility: false }, { visibility: true })).toBe(true);
        expect(isViewLayerChanged({ opacity: 0 }, { opacity: 1 })).toBe(true);
        expect(isViewLayerChanged({ clippingLayerResourceId: '01' }, { clippingLayerResourceId: '02' })).toBe(true);
        expect(isViewLayerChanged({ clippingPolygonFeatureId: '01' }, { clippingPolygonFeatureId: '02' })).toBe(true);
        expect(isViewLayerChanged({ clippingPolygonUnion: false }, { clippingPolygonUnion: true })).toBe(true);
    });
    it('pickViewLayerProperties', () => {
        expect(pickViewLayerProperties({
            id: '01',
            title: 'Layer',
            url: '/url/to/wms',
            type: 'wms',
            layer: 'layer',
            visibility: true,
            opacity: 1,
            clippingLayerResourceId: '01',
            clippingPolygonFeatureId: '01',
            clippingPolygonUnion: false,
            expanded: false
        })).toEqual({
            id: '01',
            visibility: true,
            opacity: 1,
            clippingLayerResourceId: '01',
            clippingPolygonFeatureId: '01',
            clippingPolygonUnion: false
        });
    });
    it('pickViewGroupProperties', () => {
        expect(pickViewGroupProperties({
            id: '01',
            title: 'Group',
            visibility: true,
            expanded: false
        })).toEqual({
            id: '01',
            visibility: true
        });
    });
    it('mergeViewGroups', () => {
        expect(mergeViewGroups([{ id: '01', visibility: false }])).toEqual([{ id: '01', visibility: false }]);
        expect(mergeViewGroups([{ id: '01', visibility: false }, { id: '02', visibility: false }], { groups: [{ id: '01', visibility: true }] }))
            .toEqual([{ id: '01', visibility: true, changed: true }, { id: '02', visibility: false }]);
        expect(mergeViewGroups(
            [{ id: '01', visibility: false, nodes: ['layer01', { id: '02', visibility: false }] }],
            { groups: [{ id: '02', visibility: true }] }
        ), true).toEqual([ { id: '01', visibility: false, nodes: [ 'layer01', { id: '02', visibility: false } ] } ]);
    });
});
