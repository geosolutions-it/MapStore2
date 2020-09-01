/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { sortBy } from 'lodash';
import { testEpic } from './epicTestUtils';
import {
    layerInfoSetupLayersEpic,
    layerInfoSyncLayersEpic
} from '../layerinfo';

import {
    LOADING,
    SET_ERROR,
    SET_LAYERS,
    RESET_SYNC_STATUS,
    UPDATE_LAYER,
    UPDATE_SYNC_STATUS,
    syncLayers
} from '../../actions/layerinfo';
import { setControlProperty } from '../../actions/controls';
import { UPDATE_NODE } from '../../actions/layers';

import axios from '../../libs/ajax';
import MockAdapter from 'axios-mock-adapter';

const cswRecord = `<?xml version="1.0" encoding="UTF-8"?>
<csw:GetRecordByIdResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2">
    <csw:Record xmlns:geonet="http://www.fao.org/geonetwork" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:ows="http://www.opengis.net/ows" xmlns:dct="http://purl.org/dc/terms/">
        <dc:identifier>layer1 name</dc:identifier>
        <dc:creator>GeoServer Catalog</dc:creator>
        <dc:subject>features</dc:subject>
        <dc:title>layer1 changed title</dc:title>
        <dct:abstract>layer1 changed description</dct:abstract>
        <dc:type>http://purl.org/dc/dcmitype/Dataset</dc:type>
        <ows:BoundingBox crs="urn:x-ogc:def:crs:EPSG:6.11:4326">
            <ows:LowerCorner>24.8338890075684 -125.020233154297</ows:LowerCorner>
            <ows:UpperCorner>49.4938163757324 -66.681037902832</ows:UpperCorner>
        </ows:BoundingBox>
    </csw:Record>
</csw:GetRecordByIdResponse>`;

const wmsCapabilities = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd" version="1.0.0">
    <Contents>
        <Layer>
            <ows:Title>layer2 changed title</ows:Title>
            <ows:Abstract>layer2 changed description</ows:Abstract>
            <ows:Identifier>layer2 name</ows:Identifier>
            <Style isDefault="true">
                <ows:Identifier/>
            </Style>
            <Format>image/jpeg</Format>
        </Layer>
    </Contents>
</Capabilities>`;

describe('layerinfo epics', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });
    it('layerInfoSetupLayersEpic', (done) => {
        const flatLayers = [{
            id: 'layer1',
            name: 'layer1 name',
            title: 'layer1 title',
            description: 'layer1 description',
            type: 'wms'
        }, {
            id: 'layer2',
            name: 'layer2 name',
            title: 'layer2 title',
            description: 'layer2 description',
            type: 'wmts'
        }, {
            id: 'layer3',
            name: 'layer3 name',
            title: 'layer3 title',
            description: 'layer3 description',
            type: 'tileprovider'
        }];

        testEpic(layerInfoSetupLayersEpic, 4, setControlProperty('layerinfo', 'enabled', true), actions => {
            expect(actions.length).toBe(4);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[1].type).toBe(SET_ERROR);
            expect(actions[1].error).toNotExist();
            expect(actions[2].type).toBe(SET_LAYERS);
            expect(actions[2].layers).toExist();
            expect(actions[2].layers.length).toBe(2);
            expect(actions[2].layers[0].id).toBe(flatLayers[0].id);
            expect(actions[2].layers[0].name).toBe(flatLayers[0].name);
            expect(actions[2].layers[0].title).toBe(flatLayers[0].title);
            expect(actions[2].layers[0].description).toBe(flatLayers[0].description);
            expect(actions[2].layers[0].type).toBe('wms');
            expect(actions[2].layers[0].layerObj).toEqual(flatLayers[0]);
            expect(actions[2].layers[0].selected).toBe(false);
            expect(actions[2].layers[0].syncStatus).toBe('none');
            expect(actions[2].layers[1].id).toBe(flatLayers[1].id);
            expect(actions[2].layers[1].name).toBe(flatLayers[1].name);
            expect(actions[2].layers[1].title).toBe(flatLayers[1].title);
            expect(actions[2].layers[1].description).toBe(flatLayers[1].description);
            expect(actions[2].layers[1].type).toBe('wmts');
            expect(actions[2].layers[1].layerObj).toEqual(flatLayers[1]);
            expect(actions[2].layers[1].selected).toBe(false);
            expect(actions[2].layers[1].syncStatus).toBe('none');
            expect(actions[3].type).toBe(LOADING);
        }, {
            controls: {
                layerinfo: {
                    enabled: true
                }
            },
            layers: { flat: flatLayers }
        }, done);
    });
    it('layerInfoSyncLayersEpic', (done) => {
        const testLayers = [{
            id: 'layer1',
            name: 'layer1 name',
            title: 'layer1 title',
            description: 'layer1 description',
            type: 'wms',
            layerObj: {
                name: 'layer1 name',
                title: 'layer1 title',
                description: 'layer1 description',
                id: 'layer1',
                type: 'wms',
                catalogURL: '/layer1catalog'
            },
            selected: true,
            syncStatus: 'none'
        }, {
            id: 'layer2',
            name: 'layer2 name',
            title: 'layer2 title',
            description: 'layer2 description',
            type: 'wmts',
            layerObj: {
                id: 'layer2',
                name: 'layer2 name',
                title: {
                    'default': 'layer2 title',
                    'en-US': 'english title'
                },
                description: 'layer2 description',
                type: 'wmts',
                url: '/layer2url'
            },
            selected: true,
            syncStatus: 'none'
        }, {
            id: 'layer3',
            name: 'layer3 name',
            title: 'layer3 title',
            description: 'layer3 description',
            type: 'wms',
            layerObj: {
                id: 'layer3',
                name: 'layer3 name',
                title: 'layer3 title',
                description: 'layer3 description',
                type: 'wms'
            },
            selected: false,
            syncStatus: 'success'
        }];

        mockAxios.onGet(/\/layer1catalog.*/).reply(200, cswRecord);
        mockAxios.onGet(/\/layer2url.*/).reply(200, wmsCapabilities);

        testEpic(layerInfoSyncLayersEpic, 15, syncLayers([testLayers[0], testLayers[1]]), actions => {
            expect(actions[0].type).toBe(RESET_SYNC_STATUS);
            expect(actions[1].type).toBe(LOADING);
            expect(actions[1].value).toBe(true);
            expect(actions[1].name).toBe('syncingLayers');
            expect(actions[2].type).toBe(SET_ERROR);
            expect(actions[2].error).toNotExist();
            expect(actions[3].type).toBe(UPDATE_LAYER);
            expect(actions[3].layer).toExist();
            expect(actions[3].layer.id).toBe(testLayers[0].id);
            expect(actions[3].layer.syncStatus).toBe('none');
            expect(actions[4].type).toBe(UPDATE_LAYER);
            expect(actions[4].layer).toExist();
            expect(actions[4].layer.id).toBe(testLayers[1].id);
            expect(actions[4].layer.syncStatus).toBe('none');
            expect(actions[5].type).toBe(UPDATE_LAYER);
            expect(actions[5].layer).toExist();
            expect(actions[5].layer.id).toBe(testLayers[2].id);
            expect(actions[5].layer.syncStatus).toBe('none');
            expect(actions[6].type).toBe(UPDATE_LAYER);
            expect(actions[6].layer).toExist();
            expect(actions[6].layer.id).toBe(testLayers[0].id);
            expect(actions[6].layer.syncStatus).toBe('updating');
            expect(actions[6].layer.selected).toBe(false);
            expect(actions[7].type).toBe(UPDATE_LAYER);
            expect(actions[7].layer).toExist();
            expect(actions[7].layer.id).toBe(testLayers[1].id);
            expect(actions[7].layer.syncStatus).toBe('updating');
            expect(actions[7].layer.selected).toBe(false);

            sortBy([actions.slice(8, 11), actions.slice(11, 14)], (arr) => arr[0]?.layer?.id).forEach(([updateLayerAction, updateNodeAction, updateSyncAction], idx) => {
                const title = `layer${idx + 1} changed title`;
                const description = `layer${idx + 1} changed description`;

                expect(updateLayerAction.type).toBe(UPDATE_LAYER);
                expect(updateLayerAction.layer).toExist();
                expect(updateLayerAction.layer.id).toBe(testLayers[idx].id);

                if (idx === 1) {
                    expect(updateLayerAction.layer.title).toExist();
                    expect(updateLayerAction.layer.title.default).toBe(title);
                    expect(updateLayerAction.layer.title['en-US']).toBe('english title');
                    expect(updateLayerAction.layer.layerObj.title).toExist();
                    expect(updateLayerAction.layer.layerObj.title.default).toBe(title);
                    expect(updateLayerAction.layer.layerObj.title['en-US']).toBe('english title');
                } else {
                    expect(updateLayerAction.layer.title).toBe(title);
                    expect(updateLayerAction.layer.layerObj.title).toBe(title);
                }

                expect(updateLayerAction.layer.description).toBe(description);
                expect(updateLayerAction.layer.layerObj.description).toBe(description);
                expect(updateNodeAction.type).toBe(UPDATE_NODE);
                expect(updateNodeAction.node).toBe(testLayers[idx].id);
                expect(updateNodeAction.nodeType).toBe('layer');
                expect(updateNodeAction.options).toExist();

                if (idx === 1) {
                    expect(updateNodeAction.options.title).toExist();
                    expect(updateNodeAction.options.title.default).toBe(title);
                    expect(updateNodeAction.options.title['en-US']).toBe('english title');
                } else {
                    expect(updateNodeAction.options.title).toBe(title);
                }

                expect(updateNodeAction.options.description).toBe(description);
                expect(updateSyncAction.type).toBe(UPDATE_SYNC_STATUS);
            });

            expect(actions[14].type).toBe(LOADING);
            expect(actions[14].value).toBe(false);
            expect(actions[14].name).toBe('syncingLayers');
        }, {
            layerinfo: {
                layers: testLayers
            }
        }, done);
    });
});
