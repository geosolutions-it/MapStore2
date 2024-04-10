/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
    isActiveSelector,
    authkeyParamNameSelector,
    delayAutoSearchSelector,
    groupSelector,
    layerErrorSelector,
    loadingErrorSelector,
    loadingSelector,
    modeSelector,
    newServiceSelector,
    newServiceTypeSelector,
    pageSizeSelector,
    resultSelector,
    searchTextSelector,
    searchOptionsSelector,
    selectedServiceLayerOptionsSelector,
    selectedServiceTypeSelector,
    selectedServiceSelector,
    servicesSelector,
    servicesSelectorWithBackgrounds,
    serviceListOpenSelector,
    tileSizeOptionsSelector,
    formatsLoadingSelector,
    getSupportedFormatsSelector,
    getSupportedGFIFormatsSelector,
    getFormatUrlUsedSelector,
    canEditServiceSelector
} from '../catalog';

import { set } from '../../utils/ImmutableUtils';
import { getDefaultSupportedGetFeatureInfoFormats } from '../../utils/WMSUtils';

const url = "https://demo.geo-solutions.it/geoserver/wms";
const state = {
    controls: {
        metadataexplorer: {
            enabled: true,
            group: 'mygroup'
        }
    },
    catalog: {
        "default": {
            staticServices: {
                default_map_backgrounds: {
                    "type": "backgrounds",
                    "title": "Default Background",
                    "titleMsgId": "defaultMapBackgroundsServiceTitle",
                    "autoload": true
                }
            }
        },
        selectedService: 'Basic WMS Service',
        services: {
            'Basic CSW Service': {
                url: 'https://demo.geo-solutions.it/geoserver/csw',
                type: 'csw',
                title: 'Basic CSW Service'
            },
            'Basic WMS Service': {
                url: 'https://demo.geo-solutions.it/geoserver/wms',
                type: 'wms',
                title: 'Basic WMS Service',
                layerOptions: {
                    tileSize: 512
                }
            },
            'Basic WMTS Service': {
                url: 'https://demo.geo-solutions.it/geoserver/gwc/service/wmts',
                type: 'wmts',
                title: 'Basic WMTS Service'
            }
        },
        newService: {
            title: 'title',
            type: 'wms',
            url: 'url'
        },
        openCatalogServiceList: false,
        result: {
            numberOfRecordsMatched: 52,
            numberOfRecordsReturned: 4,
            nextRecord: 6
        },
        mode: "view",
        loadingError: null,
        layerError: null,
        searchOptions: {
            url,
            startPosition: 1,
            maxRecords: 4,
            text: ''
        }
    },
    localConfig: {
        authenticationRules: [{
            "urlPattern": "\\/geoserver.*",
            "authkeyParamName": "ms2-authkey",
            "method": "authkey"
        }]
    }
};

describe('Test catalog selectors', () => {
    it('test groupSelector', () => {
        const retVal = groupSelector(state);
        expect(retVal).toBe('mygroup');
    });
    it('test resultSelector', () => {
        const retVal = resultSelector(state);
        expect(retVal).toExist();
        expect(retVal.numberOfRecordsMatched).toBe(52);
    });
    it('test serviceListOpenSelector', () => {
        const retVal = serviceListOpenSelector(state);
        expect(retVal).toBeFalsy();
    });
    it('test newServiceSelector', () => {
        const retVal = newServiceSelector(state);
        expect(retVal).toExist();
        expect(retVal.type).toBe("wms");
        expect(retVal.title).toBe("title");
        expect(retVal.url).toBe("url");
    });
    it('test servicesSelector', () => {
        const retVal = servicesSelector(state);
        expect(retVal).toExist();
        expect(Object.keys(retVal).length).toBe(3);
    });
    it('test servicesSelectorWithBackgrounds', () => {
        const retVal = servicesSelectorWithBackgrounds(state);
        expect(retVal).toBeTruthy();
        expect(Object.keys(retVal).length).toBe(4);
        const bgService = retVal.default_map_backgrounds;
        expect(bgService.readOnly).toBe(true);
    });
    it('test servicesSelectorWithBackgrounds with empty state', () => {
        const retVal = servicesSelectorWithBackgrounds({});
        expect(retVal).toBeFalsy();
    });
    it('test newServiceTypeSelector', () => {
        const retVal = newServiceTypeSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe("wms");
    });
    it('test selectedServiceTypeSelector', () => {
        const retVal = selectedServiceTypeSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe("wms");
    });
    it('selectedServiceTypeSelector with points', () => {
        const state2 = {
            catalog: {
                selectedService: "Service.with.Points",
                services: {
                    'Basic CSW Service': {
                        url: 'https://demo.geo-solutions.it/geoserver/csw',
                        type: 'csw',
                        title: 'Basic CSW Service'
                    },
                    'Basic WMS Service': {
                        url: 'https://demo.geo-solutions.it/geoserver/wms',
                        type: 'wms',
                        title: 'Basic WMS Service'
                    },
                    'Basic WMTS Service': {
                        url: 'https://demo.geo-solutions.it/geoserver/gwc/service/wmts',
                        type: 'wmts',
                        title: 'Basic WMTS Service'
                    },
                    "Service.with.Points": {
                        url: 'https://server.dom/geoserver/gwc/service/wmts',
                        type: 'wmts',
                        title: 'Basic WMTS Service'
                    }
                }
            }
        };
        const retVal = selectedServiceTypeSelector(state2);
        expect(retVal).toExist();
        expect(retVal).toBe("wmts");
    });
    it('selectedServiceLayerOptionsSelector', () => {
        const retVal = selectedServiceLayerOptionsSelector(state);
        expect(retVal).toExist();
        expect(retVal.tileSize).toBe(512);
    });
    it('test searchOptionsSelector', () => {
        const retVal = searchOptionsSelector(state);
        expect(retVal).toExist();
        expect(retVal.url).toBe(url);
    });

    it('test loadingErrorSelector', () => {
        const retVal = loadingErrorSelector(state);
        expect(retVal).toBe(null);
    });
    it('test selectedServiceSelector', () => {
        const retVal = selectedServiceSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe("Basic WMS Service");
    });
    it('test modeSelector', () => {
        const retVal = modeSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe("view");
    });
    it('test layerErrorSelector', () => {
        const retVal = layerErrorSelector(state);
        expect(retVal).toBe(null);
    });
    it('test isActiveSelector', () => {
        const retVal = isActiveSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBeTruthy();
    });
    it('test searchTextSelector', () => {
        let retVal = searchTextSelector(state);
        expect(retVal).toBe("");

        retVal = searchTextSelector(set("catalog.searchOptions.text", "someval", state));
        expect(retVal).toExist();
        expect(retVal).toBe("someval");
    });
    it('test authkeyParamNameSelector with authkey params set', () => {
        const authkeyParamNames = authkeyParamNameSelector(state);
        expect(authkeyParamNames).toExist();
        expect(authkeyParamNames.length).toBe(1);
        expect(authkeyParamNames[0]).toBe("ms2-authkey");
    });
    it('test authkeyParamNameSelector without authkey params set', () => {
        const authkeyParamNames = authkeyParamNameSelector({});
        expect(authkeyParamNames).toExist();
        expect(authkeyParamNames.length).toBe(0);
    });
    it('test loadingSelector', () => {
        let loading = loadingSelector({});
        expect(loading).toBe(false);

        loading = loadingSelector({catalog: {loading: true}});
        expect(loading).toExist();
        expect(loading).toBe(true);
    });
    it('test pageSizeSelector', () => {
        let pageSize = pageSizeSelector({});
        expect(pageSize).toExist();
        expect(pageSize).toBe(4);

        pageSize = pageSizeSelector({catalog: {pageSize: 5}});
        expect(pageSize).toExist();
        expect(pageSize).toBe(5);
    });
    it('test delayAutoSearchSelector', () => {
        let delay = delayAutoSearchSelector({});
        expect(delay).toExist();
        expect(delay).toBe(1000);

        delay = delayAutoSearchSelector({catalog: {delayAutoSearch: 1234}});
        expect(delay).toExist();
        expect(delay).toBe(1234);
    });
    it('test tileSizeOptionsSelector defaults to array with 256', () => {
        const tileSizes = tileSizeOptionsSelector(state);
        expect(tileSizes.length).toBe(2);
        expect(tileSizes[0]).toBe(256);
        expect(tileSizes[1]).toBe(512);
    });
    it('test formatsLoadingSelector with default value', () => {
        const formatLoading = formatsLoadingSelector(state);
        expect(formatLoading).toBe(false);
    });
    it('test formatsLoadingSelector', () => {
        const formatLoading = formatsLoadingSelector({catalog: {formatsLoading: true}});
        expect(formatLoading).toBe(true);
    });
    it('test getSupportedFormatsSelector with default value', () => {
        const defaultImageFormats = getSupportedFormatsSelector(state);
        expect(defaultImageFormats).toEqual([]);
    });
    it('test getSupportedFormatsSelector ', () => {
        expect(getSupportedFormatsSelector({
            catalog: {
                mode: 'edit',
                newService: {
                    supportedFormats: {
                        imageFormats: ["image/png"]
                    }
                }
            }
        })).toEqual(["image/png"]);
        expect(getSupportedFormatsSelector({
            catalog: {
                selectedService: 'wmsCatalogId',
                services: {
                    wmsCatalogId: {
                        supportedFormats: {
                            imageFormats: ["image/png"]
                        }
                    }
                }
            }
        })).toEqual(["image/png"]);
    });
    it('test getSupportedGFIFormatsSelector with default value', () => {
        const defaultInfoFormats = getSupportedGFIFormatsSelector(state);
        expect(defaultInfoFormats).toEqual(getDefaultSupportedGetFeatureInfoFormats());
    });
    it('test getSupportedGFIFormatsSelector ', () => {
        const defaultInfoFormats = getSupportedGFIFormatsSelector({
            catalog: {
                newService: {
                    supportedFormats: {
                        infoFormats: ["text/html"]
                    }
                }
            }
        });
        expect(defaultInfoFormats).toEqual(["text/html"]);
    });
    it('test getFormatUrlUsedSelector with default value', () => {
        const urlUsed = getFormatUrlUsedSelector(state);
        expect(urlUsed).toBe('');
    });
    it('test getFormatUrlUsedSelector ', () => {
        const urlUsed = getFormatUrlUsedSelector({
            catalog: {
                newService: {
                    formatUrlUsed: url
                }
            }
        });
        expect(urlUsed).toBe(url);
    });
    it('test isActiveSelector ', () => {
        const toolState = isActiveSelector({
            controls: {
                metadataexplorer: {
                    enabled: true
                }
            }
        });
        expect(toolState).toBe(true);
    });
    describe("canEditServiceSelector", () => {
        it('test ADMIN role ', () => {
            const canEdit = canEditServiceSelector({
                catalog: {
                    editingAllowedRoles: ['ADMIN'],
                    editingAllowedGroups: []
                },
                security: {
                    user: {
                        role: "ADMIN"
                    }
                }
            });
            expect(canEdit).toBe(true);
        });
        it("test ALL user role", () => {
            const canEdit = canEditServiceSelector({
                catalog: {
                    editingAllowedRoles: ['ALL'],
                    editingAllowedGroups: []
                },
                security: {
                    user: {
                        role: "ADMIN"
                    }
                }
            });
            expect(canEdit).toBe(true);
        });
        it("test custom user role", () => {
            const canEdit = canEditServiceSelector({
                catalog: {
                    editingAllowedRoles: ['ROLE1'],
                    editingAllowedGroups: []
                },
                security: {
                    user: {
                        role: "ROLE1"
                    }
                }
            });
            expect(canEdit).toBe(true);
        });
        it("test user role not matching", () => {
            const canEdit = canEditServiceSelector({
                catalog: {
                    editingAllowedRoles: ['ADMIN'],
                    editingAllowedGroups: []
                },
                security: {
                    user: {
                        role: "ROLE1"
                    }
                }
            });
            expect(canEdit).toBe(false);
        });
        it("test group matching", () => {
            const canEdit = canEditServiceSelector({
                catalog: {
                    editingAllowedRoles: [],
                    editingAllowedGroups: ['group1']
                },
                security: {
                    user: {
                        role: "ROLE1",
                        groups: {
                            group: {
                                enabled: true,
                                groupName: "group1"
                            }
                        }
                    }
                }
            });
            expect(canEdit).toBe(true);
        });
        it("test group not matching", () => {
            const canEdit = canEditServiceSelector({
                catalog: {
                    editingAllowedRoles: [],
                    editingAllowedGroups: ['group1']
                },
                security: {
                    user: {
                        role: "ROLE1",
                        groups: {
                            group: {
                                enabled: true,
                                groupName: "geo"
                            }
                        }
                    }
                }
            });
            expect(canEdit).toBe(false);
        });
    });
});
