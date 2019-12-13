/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import {DragDropContext} from 'react-dnd';
import testBackend from 'react-dnd-test-backend';
import MapEditor from '../MapEditor';
import get from 'lodash/get';
const dragDropContext = DragDropContext;
const  TestMapEditor = dragDropContext(testBackend)(MapEditor);

const {Provider} = require('react-redux');
// mock the store for empty map type
const store = {
    getState: () => ({
        geostory: {
            loading: false,
            mode: 'edit',
            currentStory: {
                type: 'cascade',
                resources: [
                    {
                        id: '584106f0-fafc-11e9-a8c5-7b78782ceda7',
                        type: 'map',
                        data: {
                            id: 10279,
                            type: 'map',
                            canDelete: true,
                            canEdit: true,
                            canCopy: true,
                            creation: '2019-06-13 17:27:38.672',
                            lastUpdate: '2019-06-13 17:45:43.987',
                            description: 'from NASA Open Data Portal',
                            name: 'Meteorite Landings',
                            featured: 'true',
                            thumbnail: 'rest/geostore/data/10283/raw?decode=datauri&v=c4ef7b80-8def-11e9-bf75-cf6e2c4151cf',
                            owner: 'admin',
                            center: {
                                x: -12.832031250000023,
                                y: 27.916766641249012,
                                crs: 'EPSG:4326'
                            },
                            maxExtent: [
                                -20037508.34,
                                -20037508.34,
                                20037508.34,
                                20037508.34
                            ],
                            projection: 'EPSG:900913',
                            units: 'm',
                            zoom: 3,
                            mapOptions: {},
                            layers: [
                                {
                                    id: 'gs:ETOPO_Shadow__5',
                                    name: 'gs:ETOPO_Shadow',
                                    opacity: 1,
                                    description: 'ETOPO_Shadow',
                                    title: 'ETOPO Shadow',
                                    type: 'wms',
                                    url: 'https://gs-stable.geo-solutions.it/geoserver/wms',
                                    bbox: {
                                        crs: 'EPSG:4326',
                                        bounds: {
                                            minx: '-180.00833333333333',
                                            miny: '-90.00833333333331',
                                            maxx: '180.00833333333338',
                                            maxy: '90.00833333333334'
                                        }
                                    },
                                    visibility: true,
                                    singleTile: false,
                                    allowedSRS: {
                                        'EPSG:3857': true,
                                        'EPSG:900913': true
                                    },
                                    dimensions: [],
                                    hideLoading: false,
                                    handleClickOnLayer: false,
                                    catalogURL: null,
                                    useForElevation: false,
                                    hidden: false,
                                    params: {}
                                },
                                {
                                    id: 'gs:ne_110m_ocean__7',
                                    search: {
                                        url: 'https://gs-stable.geo-solutions.it/geoserver/wfs',
                                        type: 'wfs'
                                    },
                                    name: 'gs:ne_110m_ocean',
                                    opacity: 0.8,
                                    description: '',
                                    availableStyles: [
                                        {
                                            TYPE_NAME: 'WMS_1_3_0.Style',
                                            name: 'polygon',
                                            title: 'A boring default style',
                                            _abstract: 'A sample style that just prints out a transparent red interior with a red outline',
                                            legendURL: [
                                                {
                                                    TYPE_NAME: 'WMS_1_3_0.LegendURL',
                                                    width: 20,
                                                    height: 20,
                                                    format: 'image/png',
                                                    onlineResource: {
                                                        TYPE_NAME: 'WMS_1_3_0.OnlineResource',
                                                        type: 'simple',
                                                        href: 'https://gs-stable.geo-solutions.it/geoserver/gs/ne_110m_ocean/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=ne_110m_ocean&authkey=8441cd44-72bb-404a-a69e-411625b77202'
                                                    }
                                                }
                                            ],
                                            format: 'sld',
                                            languageVersion: {
                                                version: '1.0.0'
                                            },
                                            filename: 'default_polygon.sld'
                                        }
                                    ],
                                    title: 'Ocean',
                                    type: 'wms',
                                    url: 'https://gs-stable.geo-solutions.it/geoserver/wms',
                                    bbox: {
                                        crs: 'EPSG:4326',
                                        bounds: {
                                            minx: '-180.0',
                                            miny: '-85.60903777459777',
                                            maxx: '180.00000000000014',
                                            maxy: '90.00000000000003'
                                        }
                                    },
                                    visibility: true,
                                    singleTile: false,
                                    allowedSRS: {
                                        'EPSG:3857': true,
                                        'EPSG:900913': true
                                    },
                                    dimensions: [],
                                    hideLoading: false,
                                    handleClickOnLayer: false,
                                    catalogURL: null,
                                    useForElevation: false,
                                    hidden: false,
                                    params: {}
                                },
                                {
                                    id: 'mapstore:Meteorite_Landings_from_NASA_Open_Data_Portal__6',
                                    search: {
                                        url: 'https://gs-stable.geo-solutions.it/geoserver/wfs',
                                        type: 'wfs'
                                    },
                                    name: 'mapstore:Meteorite_Landings_from_NASA_Open_Data_Portal',
                                    opacity: 1,
                                    description: 'Meteorite_Landings_from_NASA_Open_Data_Portal',
                                    title: 'Meteorite Landings from NASA Open Data Portal',
                                    type: 'wms',
                                    url: 'https://gs-stable.geo-solutions.it/geoserver/wms',
                                    bbox: {
                                        crs: 'EPSG:4326',
                                        bounds: {
                                            minx: '-180.0',
                                            miny: '-90.0',
                                            maxx: '180.0',
                                            maxy: '90.0'
                                        }
                                    },
                                    visibility: true,
                                    singleTile: true,
                                    allowedSRS: {
                                        'EPSG:3857': true,
                                        'EPSG:900913': true
                                    },
                                    dimensions: [
                                        {
                                            source: {
                                                type: 'multidim-extension',
                                                url: 'https://gs-stable.geo-solutions.it/geoserver/gwc/service/wmts'
                                            },
                                            name: 'time'
                                        }
                                    ],
                                    hideLoading: false,
                                    handleClickOnLayer: false,
                                    catalogURL: null,
                                    useForElevation: false,
                                    hidden: false,
                                    params: {
                                        time: '1948-01-04T06:39:37.360Z/2125-03-15T12:45:16.980Z'
                                    }
                                }
                            ]
                        }
                    }
                ],
                sections: [
                    {
                        id: 'fd6a659f-b520-462d-bcbf-966135043e07',
                        type: 'paragraph',
                        title: 'Sezione Media',
                        contents: [
                            {
                                id: '3d230926-e1a7-41c3-a1b9-20d7c1dabab4',
                                type: 'column',
                                contents: [
                                    {
                                        id: '76d5b94a-80bd-4e89-b226-a816d977af31',
                                        type: 'map',
                                        size: 'medium',
                                        align: 'center',
                                        resourceId: '584106f0-fafc-11e9-a8c5-7b78782ceda7',
                                        editMap: true
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            resource: {
                canEdit: true
            },
            currentPage: {
                sectionId: 'fd6a659f-b520-462d-bcbf-966135043e07'
            },
            focusedContent: {
                target: {
                    id: '76d5b94a-80bd-4e89-b226-a816d977af31',
                    type: 'contents',
                    contentType: 'map'
                },
                section: {
                    id: 'fd6a659f-b520-462d-bcbf-966135043e07',
                    type: 'sections',
                    contentType: 'paragraph'
                },
                parents: {
                    id: '3d230926-e1a7-41c3-a1b9-20d7c1dabab4'
                },
                isBackground: false,
                path: 'sections[{"id": "fd6a659f-b520-462d-bcbf-966135043e07"}].contents[{"id": "3d230926-e1a7-41c3-a1b9-20d7c1dabab4"}].contents[{"id": "76d5b94a-80bd-4e89-b226-a816d977af31"}]'
            }
        }
    }),
    subscribe: () => {}
};


describe('MapEditor component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    const currentStory = get(store.getState(), "geostory.currentStory", {});
    const focusedContent = get(store.getState(), "geostory.focusedContent", {});

    it('MapEditor rendering toc with layers when focusedContent element has a map and select a layer', () => {
        ReactDOM.render(<Provider store={store}><TestMapEditor  mode="edit"
            story={currentStory}
            messages="en-US"
            focusedContent={focusedContent}
        /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.ms-geostory-map-editor');
        expect(el).toExist();
        const layersCards = container.querySelectorAll(".toc-title");
        expect(layersCards.length).toBe(3);
        ReactTestUtils.Simulate.click(layersCards.item(0));
        const selected = container.querySelector(".layer-collapsed.toc-default-layer.selected");
        expect(selected).toExist();
    });
    it('MapEditor call update  ', (done) => {
        const update = (path, val) => {
            expect(path).toBe('sections[{"id": "fd6a659f-b520-462d-bcbf-966135043e07"}].contents[{"id": "3d230926-e1a7-41c3-a1b9-20d7c1dabab4"}].contents[{"id": "76d5b94a-80bd-4e89-b226-a816d977af31"}].map.layers[2].visibility');
            expect(val).toBeFalsy();
            done();
        };
        ReactDOM.render(<Provider store={store}>
            <TestMapEditor
                update={update}
                mode="edit"
                story={currentStory}
                messages="en-US"
                focusedContent={focusedContent}
            /></Provider>, document.getElementById("container"));
        const container = document.getElementById('container');

        const visibilityBtn = container.querySelector(".toc-list-item .toc-layer-tool.visibility-check");

        ReactTestUtils.Simulate.click(visibilityBtn);

    });
});
