/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {createSink} from 'recompose';
import expect from 'expect';
import handleMapSelect from "../handleMapSelect";
import axios from '../../../../../../../libs/ajax';
import {isBoolean, isEmpty, isArray, omit} from 'lodash';
import MockAdapter from "axios-mock-adapter";

describe('handleMapSelect enhancer', () => {
    let mockAxios;
    const mapData = {
        "version": 2,
        "map": {
            "center": {
                "crs": "EPSG:4326"
            },
            "layers": [
                {
                    "id": "layer1",
                    "url": "sourceUrl",
                    "bbox": {
                        "crs": "EPSG:4326"
                    },
                    "allowedSRS": {
                        "EPSG:4326": true
                    },
                    "matrixIds": [
                        "EPSG:4326"
                    ],
                    "tileMatrixSet": true
                }
            ],
            "groups": [
                {
                    "id": "Default",
                    "title": {
                        "default": "Default",
                        "it-IT": "a",
                        "en-US": "a",
                        "de-DE": "",
                        "fr-FR": "a"
                    },
                    "expanded": true
                },
                {
                    "id": "12345",
                    "title": "Group2",
                    "expanded": true
                }
            ],
            "sources": {
                "sourceUrl": {
                    "tileMatrixSet": {
                        "EPSG:4326": {
                            "ows:Identifier": "EPSG:4326",
                            "TileMatrix": [
                                {
                                    "ows:Identifier": "EPSG:4326:0"
                                }
                            ]
                        }
                    }
                }
            }
        }
    };

    beforeEach((done) => {
        mockAxios = new MockAdapter(axios);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        mockAxios.restore();
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('handleMapSelect enhancer callbacks for map data with source', (done) => {
        mockAxios.onGet().reply(200, mapData);

        const actions = {
            onMapSelected: ({map}) => {
                expect(map.sources).toExist();
                expect(isEmpty(map.sources)).toBe(false);
                expect(map.layers).toExist();
                expect(map.layers.length > 0).toBe(true);
                expect(map.layers[0].tileMatrixSet).toExist();
                expect(isBoolean(map.layers[0].tileMatrixSet)).toBe(false);
                expect(map.layers[0].tileMatrixSet).toExist();
                expect(isArray(map.layers[0].tileMatrixSet)).toBe(true);
                done();
            }
        };

        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.map.id).toExist();
            expect(props.onMapChoice).toExist();
            props.onMapChoice(props.map);
            expect(['number', 'string'].includes(typeof props.map.id)).toBe(true);
        });
        const EnhancedSink = handleMapSelect(sink);
        ReactDOM.render(<EnhancedSink map={{id: 3}} onMapSelected={actions.onMapSelected} />, document.getElementById("container"));
    });
    it('handleMapSelect enhancer callbacks for map data without source', (done) => {
        const mapDataWithoutSource = {...omit(mapData, ['map.sources', 'map.layers[0].tileMatrixSet'])};
        mockAxios.onGet().reply(200, mapDataWithoutSource);

        const actions = {
            onMapSelected: ({map}) => {
                expect(map.sources).toNotExist();
                expect(map.layers).toExist();
                expect(map.layers.length > 0).toBe(true);
                expect(map.layers[0].tileMatrixSet).toNotExist();
                done();
            }
        };

        const sink = createSink( props => {
            expect(props).toExist();
            expect(props.map.id).toExist();
            expect(props.onMapChoice).toExist();
            props.onMapChoice(props.map);
        });
        const EnhancedSink = handleMapSelect(sink);
        ReactDOM.render(<EnhancedSink map={{id: 3}} onMapSelected={actions.onMapSelected} />, document.getElementById("container"));
    });

    it('handleMapSelect enhancer callbacks for map data with groups with locale based title', (done) => {
        mockAxios.onGet().reply(200, mapData);
        const locale = 'it-IT';

        const actions = {
            onMapSelected: ({map}) => {
                expect(map.sources).toExist();
                expect(map.layers).toExist();
                expect(map.groups).toExist();
                expect(map.groups.length > 0).toBe(true);
                expect(map.groups[0].id).toEqual('Default');
                expect(map.groups[0].title).toExist();
                expect(map.groups[0].title[locale]).toEqual('a');
                expect(map.groups[0].title.default).toEqual('Default');
                expect(map.groups[1].title).toEqual('Group2');
                done();
            }
        };

        const sink = createSink( props => {
            expect(props).toExist();
            props.onMapChoice(props.map);
        });
        const EnhancedSink = handleMapSelect(sink);
        ReactDOM.render(<EnhancedSink map={{id: 3}} onMapSelected={actions.onMapSelected} />, document.getElementById("container"));
    });
});
