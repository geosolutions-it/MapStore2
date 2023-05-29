/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
const GEOSTORY_SOURCE_ID = "geostory";

import {
    availableSourcesSelector,
    currentResourcesSelector,
    editingSelector,
    currentMediaTypeSelector,
    getSourceByIdSelectorCreator,
    mediaTypesSelector,
    openSelector,
    resultDataSelector,
    saveStateSelector,
    selectedIdSelector,
    selectedItemSelector,
    sourceIdSelector,
    sourcesSelector,
    sourcesForMediaTypeSelector,
    selectedSourceSelector,
    getCurrentMediaResourcesParams,
    getCurrentMediaResourcesTotalCount,
    getLoadingSelectedMedia,
    getLoadingMediaList,
    disableApplyMapMedia
} from "../mediaEditor";

describe('mediaEditor selectors', () => {
    it('currentResourcesSelector', () => { expect(currentResourcesSelector({mediaEditor: {settings: {mediaType: "image", sourceId: "id"}, data: {image: {id: {resultData: {resources: []}}}}}})).toEqual([]); });
    it('editingSelector', () => { expect(editingSelector({mediaEditor: {saveState: {editing: true}}})).toEqual(true); });
    it('openSelector', () => { expect(openSelector({mediaEditor: {open: true}})).toEqual(true); });
    it('currentMediaTypeSelector', () => { expect(currentMediaTypeSelector({mediaEditor: {settings: {mediaType: "image"}}})).toEqual("image"); });
    it('sourceIdSelector', () => { expect(sourceIdSelector({mediaEditor: {settings: {sourceId: "id"}}})).toEqual("id"); });
    it('mediaTypesSelector', () => {
        expect(mediaTypesSelector({
            mediaEditor: {
                settings: {
                    mediaTypes: {
                        image: {
                            defaultSource: GEOSTORY_SOURCE_ID,
                            sources: [GEOSTORY_SOURCE_ID, "geostoreImage"]
                        }
                    }
                }
            }
        })).toEqual({image: {
            defaultSource: GEOSTORY_SOURCE_ID,
            sources: [GEOSTORY_SOURCE_ID, "geostoreImage"]
        }});
    });
    it('sourcesSelector', () => {
        expect(sourcesSelector({
            mediaEditor: {
                settings: {
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual({geostory: {
            name: "Current story",
            type: GEOSTORY_SOURCE_ID
        }});
    });
    it('sourcesForMediaTypeSelector', () => {
        expect(sourcesForMediaTypeSelector({
            mediaEditor: {
                settings: {
                    mediaType: "image",
                    mediaTypes: {
                        image: {
                            defaultSource: GEOSTORY_SOURCE_ID,
                            sources: [GEOSTORY_SOURCE_ID, "geostoreImage"]
                        }
                    },
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual([GEOSTORY_SOURCE_ID, "geostoreImage"]);
    });
    it('selectedSourceSelector', () => {
        expect(selectedSourceSelector({
            mediaEditor: {
                settings: {
                    sourceId: GEOSTORY_SOURCE_ID,
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual({
            name: "Current story",
            type: GEOSTORY_SOURCE_ID
        });
    });
    it('getSourceByIdSelectorCreator', () => {
        expect(getSourceByIdSelectorCreator(GEOSTORY_SOURCE_ID)({
            mediaEditor: {
                settings: {
                    sourceId: GEOSTORY_SOURCE_ID,
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual({
            name: "Current story",
            type: GEOSTORY_SOURCE_ID
        });
    });
    it('availableSourcesSelector', () => {
        expect(availableSourcesSelector({
            mediaEditor: {
                settings: {
                    mediaType: "image",
                    mediaTypes: {
                        image: {
                            defaultSource: GEOSTORY_SOURCE_ID,
                            sources: [GEOSTORY_SOURCE_ID, "geostoreImage"]
                        }
                    },
                    sourceId: GEOSTORY_SOURCE_ID,
                    sources: {
                        geostory: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        },
                        geostoreImage: {
                            name: "Current story",
                            type: GEOSTORY_SOURCE_ID
                        }
                    }
                }
            }
        })).toEqual([{
            name: "Current story",
            id: GEOSTORY_SOURCE_ID
        },
        {
            name: "Current story",
            id: "geostoreImage"
        }]);
    });
    it('resultDataSelector', () => { expect(resultDataSelector({mediaEditor: {settings: {mediaType: "image", sourceId: "id"}, data: {image: {id: {resultData: {}}}}}})).toEqual({}); });
    it('saveStateSelector', () => { expect(saveStateSelector({mediaEditor: {saveState: "loading"}})).toEqual("loading"); });
    it('selectedIdSelector', () => { expect(selectedIdSelector({mediaEditor: {selected: "id"}})).toEqual("id"); });
    it('selectedItemSelector', () => {
        expect(selectedItemSelector({
            mediaEditor: {
                selected: "id",
                settings: {mediaType: "image", sourceId: "id"},
                data: {
                    image: {
                        id: {
                            resultData: {
                                resources: [{
                                    id: "id"
                                }]
                            }
                        }
                    }
                }
            }
        })).toEqual({id: "id"});
    });
    it('selectedItemSelector - include tileMatrix in WMTS layers for "map" media resource', () => {
        const selectedMapMedia = selectedItemSelector({
            mediaEditor: {
                selected: "id",
                settings: {mediaType: "map", sourceId: "id"},
                data: {
                    map: {
                        id: {
                            resultData: {
                                resources: [{
                                    id: "id",
                                    type: "map",
                                    data: {
                                        type: "map",
                                        id: "mapId",
                                        sources: {
                                            "http://localhost/geoserver/gwc/service/wmts": {
                                                tileMatrixSet: {
                                                    'EPSG:4326': {
                                                        "ows:Identifier": "EPSG:4326",
                                                        "ows:SupportedCRS": "urn:ogc:def:crs:EPSG::4326",
                                                        'TileMatrix': [{
                                                            'ows:Identifier': 'EPSG:4326:0'
                                                        }]
                                                    },
                                                    "EPSG:900913": {
                                                        'ows:Identifier': 'EPSG:900913',
                                                        'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::900913',
                                                        'TileMatrix': [{
                                                            'ows:Identifier': 'EPSG:900913:0'
                                                        }]
                                                    }
                                                }
                                            }
                                        },
                                        layers: [{
                                            id: "workspace:layer__1",
                                            format: "image/png",
                                            name: 'workspace:layer',
                                            type: "wmts",
                                            url: "http://localhost/geoserver/gwc/service/wmts",
                                            allowedSRS: {
                                                "EPSG:4326": true,
                                                "EPSG:900913": true
                                            },
                                            matrixIds: [
                                                "EPSG:4326",
                                                "EPSG:900913"
                                            ],
                                            tileMatrixSet: true
                                        }]
                                    }
                                }]
                            }
                        }
                    }
                }
            }
        });
        expect(selectedMapMedia.id).toBe("id");
        expect(selectedMapMedia.data.layers[0].availableTileMatrixSets).toEqual({
            'EPSG:4326': {
                crs: 'EPSG:4326',
                tileMatrixSet: {
                    'ows:Identifier': 'EPSG:4326',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::4326',
                    'TileMatrix': [ { 'ows:Identifier': 'EPSG:4326:0' } ]
                }
            },
            'EPSG:900913': {
                crs: 'EPSG:900913',
                tileMatrixSet: {
                    'ows:Identifier': 'EPSG:900913',
                    'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::900913',
                    'TileMatrix': [ { 'ows:Identifier': 'EPSG:900913:0' } ]
                }
            }
        });
    });
    it('getCurrentMediaResourcesParams', () => {
        const params = { page: 1 };
        expect(getCurrentMediaResourcesParams({
            mediaEditor: {
                settings: { mediaType: "image", sourceId: "id" },
                data: { image: { id: { params, resultData: {} } } }
            }
        })).toEqual(params);
    });
    it('getCurrentMediaResourcesTotalCount', () => {
        expect(getCurrentMediaResourcesTotalCount({
            mediaEditor: {
                settings: { mediaType: "image", sourceId: "id" },
                data: { image: { id: { resultData: { totalCount: 0 } } } }
            }
        })).toBe(0);
    });
    it('getLoadingSelectedMedia', () => {
        expect(getLoadingSelectedMedia({
            mediaEditor: {
                loadingSelected: true
            }
        })).toBe(true);
    });
    it('getLoadingMediaList', () => {
        expect(getLoadingMediaList({
            mediaEditor: {
                loadingList: true
            }
        })).toBe(true);
    });
    it('disableApplyMapMedia', () => {
        expect(disableApplyMapMedia({
            mediaEditor: {
                loadingSelected: true
            }
        })).toBe(true);
        expect(disableApplyMapMedia({
            mediaEditor: {
                loadingSelected: false
            }
        })).toBe(false);
    });
});
