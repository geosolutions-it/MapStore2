/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');

const Toolbar = require('../Toolbar');
const expect = require('expect');

const TestUtils = require('react-dom/test-utils');

const onToolsActions = {
    onZoom: () => {},
    onBrowseData: () => {},
    onDownload: () => {},
    onUpdate: () => {},
    onRemove: () => {},
    onClear: () => {},
    onSettings: () => {},
    onUpdateSettings: () => {},
    onRetrieveLayerData: () => {},
    onHideSettings: () => {},
    onReload: () => {},
    onQueryBuilder: () => {},
    onAddLayer: () => {},
    onAddGroup: () => {},
    onGetMetadataRecord: () => {},
    onHideLayerMetadata: () => {},
    onShow: () => {},
    onLayerInfo: () => {}
};

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
        const spyLayerInfo = expect.spyOn(onToolsActions, 'onLayerInfo');
        const spyAddLayer = expect.spyOn(onToolsActions, 'onAddLayer');
        const spyAddGroup = expect.spyOn(onToolsActions, 'onAddGroup');
        ReactDOM.render(<Toolbar onToolsActions={onToolsActions}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("btn-group").item(0);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(3);
        expect(btn[0].innerHTML).toContain('layer-info');
        expect(btn[1].innerHTML).toContain('add-layer');
        expect(btn[2].innerHTML).toContain('add-folder');
        TestUtils.Simulate.click(btn[0]);
        expect(spyLayerInfo).toHaveBeenCalled();
        TestUtils.Simulate.click(btn[1]);
        expect(spyAddLayer).toHaveBeenCalled();
        TestUtils.Simulate.click(btn[2]);
        expect(spyAddGroup).toHaveBeenCalled();
    });

    it('layer single selection', () => {
        const spyZoom = expect.spyOn(onToolsActions, 'onZoom');
        const spySettings = expect.spyOn(onToolsActions, 'onSettings');
        const spyLayerFilter = expect.spyOn(onToolsActions, 'onQueryBuilder');
        const spyBrowseData = expect.spyOn(onToolsActions, 'onBrowseData');
        const spyDownload = expect.spyOn(onToolsActions, 'onDownload');
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
        }];

        const cmp = ReactDOM.render(<Toolbar selectedLayers={selectedLayers} onToolsActions={onToolsActions}/>, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(7);
        TestUtils.Simulate.click(btn[0]);
        expect(spyZoom).toHaveBeenCalledWith({
            maxx: 10,
            maxy: 9,
            minx: -10,
            miny: -9
        }, 'EPSG:4326');

        TestUtils.Simulate.click(btn[1]);
        expect(spySettings).toHaveBeenCalledWith('l001', 'layers', {opacity: 1 });
        TestUtils.Simulate.click(btn[2]);
        expect(spyLayerFilter).toHaveBeenCalled();

        TestUtils.Simulate.click(btn[3]);
        expect(spyLayerFilter).toHaveBeenCalled();
        expect(spyBrowseData).toHaveBeenCalledWith({
            url: selectedLayers[0].search.url,
            name: selectedLayers[0].name,
            id: selectedLayers[0].id
        });
        TestUtils.Simulate.click(btn[5]);
        expect(spyDownload).toHaveBeenCalled();
        expect(spyDownload).toHaveBeenCalledWith({
            url: selectedLayers[0].search.url,
            name: selectedLayers[0].name,
            id: selectedLayers[0].id
        });

        TestUtils.Simulate.click(btn[4]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();
    });

    it('layer single selection (no search)', () => {
        const spyZoom = expect.spyOn(onToolsActions, 'onZoom');
        const spySettings = expect.spyOn(onToolsActions, 'onSettings');
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
            }
        }];

        const cmp = ReactDOM.render(<Toolbar selectedLayers={selectedLayers} onToolsActions={onToolsActions}/>, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(4);
        TestUtils.Simulate.click(btn[0]);
        expect(spyZoom).toHaveBeenCalledWith({
            maxx: 10,
            maxy: 9,
            minx: -10,
            miny: -9
        }, 'EPSG:4326');

        TestUtils.Simulate.click(btn[1]);
        expect(spySettings).toHaveBeenCalledWith('l001', 'layers', {opacity: 1 });

        TestUtils.Simulate.click(btn[2]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();
    });

    it('layer single selection (loading error)', () => {
        const spyReload = expect.spyOn(onToolsActions, 'onReload');
        const spyShow = expect.spyOn(onToolsActions, 'onShow');
        const spySettings = expect.spyOn(onToolsActions, 'onSettings');
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
        }];

        const cmp = ReactDOM.render(<Toolbar selectedLayers={selectedLayers} onToolsActions={onToolsActions}/>, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(3);
        TestUtils.Simulate.click(btn[2]);
        expect(spyReload).toHaveBeenCalled();
        expect(spyShow).toHaveBeenCalledWith('l001', {visibility: true});

        TestUtils.Simulate.click(btn[1]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();

        TestUtils.Simulate.click(btn[0]);
        expect(spySettings).toHaveBeenCalled();
        expect(btn[0].querySelector('.glyphicon-wrench')).toExist();
    });

    it('multiple layer selection (loading error)', () => {
        const spyReload = expect.spyOn(onToolsActions, 'onReload');
        const spyShow = expect.spyOn(onToolsActions, 'onShow');
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

        const cmp = ReactDOM.render(<Toolbar selectedLayers={selectedLayers} onToolsActions={onToolsActions}/>, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(2);
        TestUtils.Simulate.click(btn[1]);
        expect(spyReload).toHaveBeenCalled();
        expect(spyShow).toHaveBeenCalledWith('l001', {visibility: true});

        TestUtils.Simulate.click(btn[0]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();
    });

    it('layer single selection with catalogURL', () => {
        const spyGetMetadataRecord = expect.spyOn(onToolsActions, 'onGetMetadataRecord');
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
            },
            catalogURL: "fakeURL"
        }];

        const cmp = ReactDOM.render(<Toolbar selectedLayers={selectedLayers} onToolsActions={onToolsActions}/>, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(7);


        TestUtils.Simulate.click(btn[6]);
        expect(spyGetMetadataRecord).toHaveBeenCalled();

        TestUtils.Simulate.click(btn[4]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();
    });

    it('group single selection', () => {
        const spyAddLayer = expect.spyOn(onToolsActions, 'onAddLayer');
        const spyAddGroup = expect.spyOn(onToolsActions, 'onAddGroup');
        const spyZoom = expect.spyOn(onToolsActions, 'onZoom');
        const spySettings = expect.spyOn(onToolsActions, 'onSettings');

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

        const cmp = ReactDOM.render(<Toolbar selectedLayers={selectedLayers} selectedGroups={selectedGroups} onToolsActions={onToolsActions}/>, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(5);
        TestUtils.Simulate.click(btn[0]);
        expect(spyAddLayer).toHaveBeenCalled();
        TestUtils.Simulate.click(btn[1]);
        expect(spyAddGroup).toHaveBeenCalled();
        TestUtils.Simulate.click(btn[2]);
        expect(spyZoom).toHaveBeenCalledWith({
            maxx: 30,
            maxy: 29,
            minx: -10,
            miny: -9
        }, 'EPSG:4326');

        TestUtils.Simulate.click(btn[3]);
        expect(spySettings).toHaveBeenCalledWith('g001', 'groups', {});

        TestUtils.Simulate.click(btn[4]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();
    });

    it('add group max depth ok', () => {
        const selectedGroups = [{
            id: 'g001',
            title: 'group001',
            name: 'group001name',
            nodes: []
        }];

        const cmp = ReactDOM.render(<Toolbar maxDepth={2} selectedGroups={selectedGroups} onToolsActions={onToolsActions} />, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(4);
    });

    it('add group max depth reached', () => {
        const selectedGroups = [{
            id: 'g001.g002',
            title: 'group001',
            name: 'group001name',
            nodes: []
        }];
        const cmp = ReactDOM.render(<Toolbar maxDepth={2} selectedGroups={selectedGroups} onToolsActions={onToolsActions} />, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(3);
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

        const cmp = ReactDOM.render(<Toolbar selectedLayers={selectedLayers} selectedGroups={selectedGroups}/>, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(1);

        TestUtils.Simulate.click(btn[0]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();
    });

    it('layer single selection (epsg not supported)', () => {

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
                }, crs: 'EPSG:3003'
            }
        }];

        const cmp = ReactDOM.render(<Toolbar selectedLayers={selectedLayers} onToolsActions={onToolsActions}/>, document.getElementById("container"));

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName('btn');
        expect(btn.length).toBe(4);
        expect(btn[0].style.cursor).toBe('default');
    });
    describe('Widget tool', () => {
        const WIDGET_TOOL_SELECTOR = 'button .glyphicon-stats';
        it('enable if activateWidgetTool is true', () => {
            const actions = {
                onNewWidget: () => {}
            };
            const spyNewWidget = expect.spyOn(actions, 'onNewWidget');
            const selectedLayers = [{
                id: 'l001',
                title: 'layer001',
                type: 'wms',
                name: 'layer001name',
                bbox: {
                    bounds: {
                        maxx: 10,
                        maxy: 9,
                        minx: -10,
                        miny: -9
                    }, crs: 'EPSG:3003'
                }
            }];
            const activateTool = {
                activateWidgetTool: true,
                activateToolsContainer: true,
                activateRemoveLayer: true,
                activateRemoveGroup: true,
                activateZoomTool: true,
                activateQueryTool: true,
                activateDownloadTool: true,
                activateSettingsTool: true,
                activateAddLayer: true,
                activateAddGroup: true,
                includeDeleteButtonInSettings: false,
                activateMetedataTool: true,
                activateLayerFilterTool: true
            };

            ReactDOM.render(<Toolbar activateTool={activateTool} selectedLayers={selectedLayers} onToolsActions={actions} />, document.getElementById("container"));
            const widgetButton = document.querySelector(WIDGET_TOOL_SELECTOR);
            expect(widgetButton).toExist();
            widgetButton.click();
            expect(spyNewWidget).toHaveBeenCalled();
        });
        it('deactivate for vector layers', () => {
            const selectedLayers = [{
                id: 'l002',
                title: 'layer002',
                type: 'vector',
                name: 'layer001name',
                bbox: {
                    bounds: {
                        maxx: 10,
                        maxy: 9,
                        minx: -10,
                        miny: -9
                    }, crs: 'EPSG:3003'
                }
            }];
            ReactDOM.render(<Toolbar activateTool={{ activateWidgetTool: true }} selectedLayers={selectedLayers} />, document.getElementById("container"));
            const widgetButton = document.querySelector(WIDGET_TOOL_SELECTOR);
            expect(widgetButton).toNotExist();

        });
    });

});
