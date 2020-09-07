/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {
    createFromSearch,
    getTooltip,
    getTooltipFragment,
    flattenGroups,
    getTitleAndTooltip,
    getLabelName
} = require('../TOCUtils');
let options = [{label: "lab1", value: "val1"}];
const groups = [{
    "id": "first",
    "title": "first",
    "name": "first",
    "nodes": [
        {
            "id": "first.second",
            "title": "second",
            "name": "second",
            "nodes": [
                {
                    "id": "first.second.third",
                    "title": "third",
                    "name": "third",
                    "nodes": [
                        {
                            "id": "topp:states__6",
                            "format": "image/png8",
                            "search": {
                                "url": "https://demo.geo-solutions.it:443/geoserver/wfs",
                                "type": "wfs"
                            },
                            "name": "topp:states",
                            "opacity": 1,
                            "description": "This is some census data on the states.",
                            "title": "USA Population",
                            "type": "wms",
                            "url": "https://demo.geo-solutions.it:443/geoserver/wms",
                            "bbox": {
                                "crs": "EPSG:4326",
                                "bounds": {
                                    "minx": -124.73142200000001,
                                    "miny": 24.955967,
                                    "maxx": -66.969849,
                                    "maxy": 49.371735
                                }
                            },
                            "visibility": true,
                            "singleTile": false,
                            "allowedSRS": {},
                            "dimensions": [],
                            "hideLoading": false,
                            "handleClickOnLayer": false,
                            "catalogURL": "https://demo.geo-solutions.it/geoserver/csw?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=topp:states",
                            "useForElevation": false,
                            "hidden": false,
                            "params": {
                                "layers": "topp:states"
                            },
                            "loading": false,
                            "loadingError": false,
                            "group": "first.second.third",
                            "expanded": false
                        }
                    ],
                    "expanded": true,
                    "visibility": true
                }
            ],
            "expanded": true,
            "visibility": true
        }
    ],
    "expanded": true,
    "visibility": true
}];

describe('TOCUtils', () => {
    it('test createFromSearch for General Fragment with value not allowed', () => {
        let val = createFromSearch(options, "/as");
        expect(val).toBe(null);
        val = createFromSearch(options, "a//s");
        expect(val).toBe(null);
        val = createFromSearch(options, "s/d&/");
        expect(val).toBe(null);
    });

    it('test createFromSearch for General Fragment with new valid value', () => {
        const node = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            id: "layer00",
            description: "desc",
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl',
            tooltipOptions: "both"
        };
        const currentLocale = "it-IT";
        const tooltip = getTooltip(node, currentLocale);
        expect(tooltip).toBe("Livello - desc");
    });

    it('test getTooltipFragment', () => {
        const node = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            id: "layer00",
            description: "desc",
            visibility: true,
            storeIndex: 9,
            type: 'wms',
            url: 'fakeurl'
        };
        const currentLocale = "it-IT";
        let tooltip = getTooltipFragment("title", node, currentLocale);
        expect(tooltip).toBe("Livello");
        tooltip = getTooltipFragment("description", node, currentLocale);
        expect(tooltip).toBe("desc");

        tooltip = getTooltipFragment("fakeFragment", node, currentLocale);
        expect(tooltip).toBe(undefined);

    });
    it('test flattenGroups, wholeGroup true', () => {
        const allGroups = flattenGroups(groups, 0, true);
        expect(allGroups.length).toBe(3);
        expect(allGroups[0].id).toBe("first");
        expect(allGroups[0].value).toBe(undefined);
        expect(allGroups[1].id).toBe("first.second");
        expect(allGroups[1].value).toBe(undefined);
        expect(allGroups[2].id).toBe("first.second.third");
        expect(allGroups[2].value).toBe(undefined);
    });
    it('test flattenGroups, wholeGroup false', () => {
        const allGroups = flattenGroups(groups);
        expect(allGroups.length).toBe(3);
        expect(allGroups[0].id).toBe(undefined);
        expect(allGroups[0].value).toBe("first");
        expect(allGroups[0].label).toBe("first");
        expect(allGroups[1].id).toBe(undefined);
        expect(allGroups[1].value).toBe("first.second");
        expect(allGroups[1].label).toBe("first/second");
        expect(allGroups[2].id).toBe(undefined);
        expect(allGroups[2].value).toBe("first.second.third");
        expect(allGroups[2].label).toBe("first/second/third");
    });
    it('test getTitleAndTooltip both', () => {
        const node = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            id: "layer00",
            description: "desc",
            tooltipOptions: "both"
        };
        const currentLocale = "it-IT";
        const {title, tooltipText} = getTitleAndTooltip({node, currentLocale});
        expect(title).toBe("Livello");
        expect(tooltipText).toBe("Livello - desc");
    });
    it('test getTitleAndTooltip NoTooltip', () => {
        const node = {
            name: 'layer00',
            title: {
                'default': 'Layer',
                'it-IT': 'Livello'
            },
            id: "layer00",
            description: "desc",
            tooltipOptions: "none"
        };
        const currentLocale = "it-IT";
        const {title, tooltipText} = getTitleAndTooltip({node, currentLocale});
        expect(title).toBe("Livello");
        expect(tooltipText).toBe("");
    });
    it('test default value getLabelName from object', () => {
        const groupLabel = "Default";
        const nodes = [{
            name: 'Default',
            title: {
                'default': 'Layer',
                'no-exist': 'Label of an unknown language'
            },
            id: "layer00",
            description: "desc",
            tooltipOptions: "none"
        }];
        const label = getLabelName(groupLabel, nodes);
        expect(label).toBe("Layer");
    });
    it('test localized value getLabelName from object', () => {
        const groupLabel = "Default";
        const nodes = [{
            name: 'Default',
            title: {
                'default': 'Group Layer',
                'en-US': 'Group Layer'
            },
            id: "layer00",
            description: "desc",
            tooltipOptions: "none"
        }];
        const label = getLabelName(groupLabel, nodes);
        expect(label).toBe("Group Layer");
    });
});
