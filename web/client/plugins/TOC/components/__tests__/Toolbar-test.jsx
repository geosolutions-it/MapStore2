/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import { waitFor } from '@testing-library/dom';
import Toolbar from '../Toolbar';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import { StatusTypes } from '../../utils/TOCUtils';
import { NodeTypes } from '../../../../utils/LayersUtils';

const items = [
    { Component: ({ status }) => <div className="check-status">{status}</div>, name: 'CheckStatus' }
];

describe('TOC Toolbar', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('deselected element', () => {
        ReactDOM.render(
            <Toolbar items={items}/>,
            document.getElementById("container")
        );
        const checkStatusNode = document.querySelector('.check-status');
        expect(checkStatusNode.innerText).toBe(StatusTypes.DESELECT);
    });

    it('layer single selection', () => {
        const selectedNodes = [{
            id: 'l001',
            type: NodeTypes.LAYER,
            node: {
                id: 'l001',
                title: 'layer001',
                name: 'layer001name',
                bbox: {
                    bounds: {
                        maxx: 10,
                        maxy: 9,
                        minx: -10,
                        miny: -9
                    }, crs: 'EPSG:4326'
                },
                search: {
                    url: 'l001url'
                }
            }
        }];
        ReactDOM.render(
            <Toolbar items={items} selectedNodes={selectedNodes}/>,
            document.getElementById("container")
        );
        const checkStatusNode = document.querySelector('.check-status');
        expect(checkStatusNode.innerText).toBe(StatusTypes.LAYER);
    });

    it('multiple layer selection', () => {
        const selectedLayers = [{
            id: 'l001',
            title: 'layer001',
            name: 'layer001name',
            loadingError: 'Error',
            bbox: {
                bounds: {
                    maxx: 10,
                    maxy: 9,
                    minx: -10,
                    miny: -9
                }, crs: 'EPSG:4326'
            }
        }, {
            id: 'l002',
            title: 'layer002',
            name: 'layer002name',
            loadingError: 'Error',
            bbox: {
                bounds: {
                    maxx: 10,
                    maxy: 9,
                    minx: -10,
                    miny: -9
                }, crs: 'EPSG:4326'
            }
        }];

        ReactDOM.render(
            <Toolbar items={items} selectedNodes={selectedLayers.map((node) => ({ id: node.id, type: NodeTypes.LAYER, node }))}/>,
            document.getElementById("container")
        );
        const checkStatusNode = document.querySelector('.check-status');
        expect(checkStatusNode.innerText).toBe(StatusTypes.LAYERS);
    });

    it('group single selection', () => {
        const selectedLayers = [{
            id: 'l001',
            title: 'layer001',
            name: 'layer001name',
            bbox: {
                bounds: {
                    maxx: 10,
                    maxy: 9,
                    minx: -10,
                    miny: -9
                }, crs: 'EPSG:4326'
            },
            search: {
                url: 'l001url'
            }
        }, {
            id: 'l002',
            title: 'layer002',
            name: 'layer002name',
            bbox: {
                bounds: {
                    maxx: 30,
                    maxy: 29,
                    minx: 28,
                    miny: 27
                }, crs: 'EPSG:4326'
            },
            search: {
                url: 'l002url'
            }
        }];

        const selectedGroups = [{
            id: 'g001',
            title: 'group001',
            name: 'group001name',
            nodes: selectedLayers
        }];

        ReactDOM.render(<Toolbar
            items={items} selectedNodes={selectedGroups.map((node) => ({ id: node.id, type: NodeTypes.GROUP, node }))}/>, document.getElementById("container"));

        const checkStatusNode = document.querySelector('.check-status');
        expect(checkStatusNode.innerText).toBe(StatusTypes.GROUP);
    });

    it('group multiple selections', () => {
        const selectedLayers = [{
            id: 'l001',
            title: 'layer001',
            name: 'layer001name',
            bbox: {
                bounds: {
                    maxx: 10,
                    maxy: 9,
                    minx: -10,
                    miny: -9
                }, crs: 'EPSG:4326'
            },
            search: {
                url: 'l001url'
            }
        }, {
            id: 'l002',
            title: 'layer002',
            name: 'layer002name',
            bbox: {
                bounds: {
                    maxx: 30,
                    maxy: 29,
                    minx: 28,
                    miny: 27
                }, crs: 'EPSG:4326'
            },
            search: {
                url: 'l002url'
            }
        }, {
            id: 'l003',
            title: 'layer003',
            name: 'layer003name',
            bbox: {
                bounds: {
                    maxx: -55,
                    maxy: -50,
                    minx: -99,
                    miny: -100
                }, crs: 'EPSG:3857'
            },
            search: {
                url: 'l002url'
            }
        }];

        const selectedGroups = [{
            id: 'g001',
            title: 'group001',
            name: 'group001name',
            nodes: [selectedLayers[0], selectedLayers[1]]
        }, {
            id: 'g002',
            title: 'group001',
            name: 'group001name',
            nodes: [selectedLayers[2]]
        }];

        ReactDOM.render(<Toolbar items={items} selectedNodes={selectedGroups.map((node) => ({ id: node.id, type: NodeTypes.GROUP, node }))}/>, document.getElementById("container"));

        const checkStatusNode = document.querySelector('.check-status');
        expect(checkStatusNode.innerText).toBe(StatusTypes.GROUPS);
    });

    it('layers and groups selections', () => {
        const selectedLayers = [{
            id: 'l001',
            title: 'layer001',
            name: 'layer001name',
            bbox: {
                bounds: {
                    maxx: 10,
                    maxy: 9,
                    minx: -10,
                    miny: -9
                }, crs: 'EPSG:4326'
            },
            search: {
                url: 'l001url'
            }
        }, {
            id: 'l002',
            title: 'layer002',
            name: 'layer002name',
            bbox: {
                bounds: {
                    maxx: 30,
                    maxy: 29,
                    minx: 28,
                    miny: 27
                }, crs: 'EPSG:4326'
            },
            search: {
                url: 'l002url'
            }
        }, {
            id: 'l003',
            title: 'layer003',
            name: 'layer003name',
            bbox: {
                bounds: {
                    maxx: -55,
                    maxy: -50,
                    minx: -99,
                    miny: -100
                }, crs: 'EPSG:3857'
            },
            search: {
                url: 'l002url'
            }
        }];

        const selectedGroups = [{
            id: 'g001',
            title: 'group001',
            name: 'group001name',
            nodes: [selectedLayers[0], selectedLayers[1]]
        }, {
            id: 'g002',
            title: 'group001',
            name: 'group001name',
            nodes: [selectedLayers[2]]
        }];

        ReactDOM.render(<Toolbar
            items={items}
            selectedNodes={[
                ...selectedLayers.map((node) => ({ id: node.id, type: NodeTypes.LAYER, node })),
                ...selectedGroups.map((node) => ({ id: node.id, type: NodeTypes.GROUP, node }))
            ]}/>, document.getElementById("container"));

        const checkStatusNode = document.querySelector('.check-status');
        expect(checkStatusNode.innerText).toBe(StatusTypes.BOTH);
    });

    it('should show dropdown in case of overflow', (done) => {

        const Component = () => <button style={{ width: 60 }}></button>;
        act(() => {
            ReactDOM.render(<div style={{ overflow: 'hidden', width: 60 }}>
                <Toolbar items={[{ Component, name: 'A' }]}/>
            </div>, document.getElementById("container"));
        });

        expect(document.querySelector('.dropdown').style.visibility).toBe('hidden');

        act(() => {
            ReactDOM.render(<div style={{ overflow: 'hidden', width: 60 }}>
                <Toolbar items={[{ Component, name: 'A' }, { Component, name: 'B' }]}/>
            </div>, document.getElementById("container"));
        });
        waitFor(() => expect(document.querySelector('.dropdown').style.visibility).toBe(''))
            .then(() => done())
            .catch(done);
    });

});
