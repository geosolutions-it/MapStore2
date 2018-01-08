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
    onUpdate: () => {},
    onRemove: () => {},
    onClear: () => {},
    onSettings: () => {},
    onUpdateSettings: () => {},
    onRetrieveLayerData: () => {},
    onHideSettings: () => {},
    onReload: () => {},
    onAddLayer: () => {},
    onGetMetadataRecord: () => {},
    onHideLayerMetadata: () => {},
    onShow: () => {}
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
        const spyAddLayer = expect.spyOn(onToolsActions, 'onAddLayer');
        ReactDOM.render(<Toolbar text={{addLayer: 'ADD LAYER'}} onToolsActions={onToolsActions}/>, document.getElementById("container"));
        const el = document.getElementsByClassName("btn-group").item(0);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(1);
        expect(btn[0].innerHTML).toBe('ADD LAYER');
        TestUtils.Simulate.click(btn[0]);
        expect(spyAddLayer).toHaveBeenCalled();
    });

    it('layer single selection', () => {
        const spyZoom = expect.spyOn(onToolsActions, 'onZoom');
        const spySettings = expect.spyOn(onToolsActions, 'onSettings');
        const spyBrowseData = expect.spyOn(onToolsActions, 'onBrowseData');
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
                }, crs: 'EPSG'
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
        expect(btn.length).toBe(4);
        TestUtils.Simulate.click(btn[0]);
        expect(spyZoom).toHaveBeenCalledWith({
            maxx: 10,
            maxy: 9,
            minx: -10,
            miny: -9
        }, 'EPSG');

        TestUtils.Simulate.click(btn[1]);
        expect(spySettings).toHaveBeenCalledWith('l001', 'layers', {opacity: 1 });

        TestUtils.Simulate.click(btn[2]);
        expect(spyBrowseData).toHaveBeenCalled();
        expect(spyBrowseData).toHaveBeenCalledWith({
            url: selectedLayers[0].search.url,
            name: selectedLayers[0].name,
            id: selectedLayers[0].id
        });

        TestUtils.Simulate.click(btn[3]);
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
                }, crs: 'EPSG'
            }
        }];

        const cmp = ReactDOM.render(<Toolbar selectedLayers={selectedLayers} onToolsActions={onToolsActions}/>, document.getElementById("container"));

        const modal = document.getElementsByClassName('modal-dialog').item(0);
        expect(modal).toNotExist();

        const el = ReactDOM.findDOMNode(cmp);
        expect(el).toExist();
        const btn = el.getElementsByClassName("btn");
        expect(btn.length).toBe(3);
        TestUtils.Simulate.click(btn[0]);
        expect(spyZoom).toHaveBeenCalledWith({
            maxx: 10,
            maxy: 9,
            minx: -10,
            miny: -9
        }, 'EPSG');

        TestUtils.Simulate.click(btn[1]);
        expect(spySettings).toHaveBeenCalledWith('l001', 'layers', {opacity: 1 });

        TestUtils.Simulate.click(btn[2]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();
    });

    it('layer single selection (loading error)', () => {
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
                }, crs: 'EPSG'
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
                }, crs: 'EPSG'
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
        expect(btn.length).toBe(5);


        TestUtils.Simulate.click(btn[4]);
        expect(spyGetMetadataRecord).toHaveBeenCalled();

        TestUtils.Simulate.click(btn[3]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();
    });

    it('group single selection', () => {
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
                }, crs: 'EPSG'
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
                }, crs: 'EPSG'
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
        expect(btn.length).toBe(3);
        TestUtils.Simulate.click(btn[0]);
        expect(spyZoom).toHaveBeenCalledWith({
            maxx: 30,
            maxy: 29,
            minx: -10,
            miny: -9
        }, 'EPSG');

        TestUtils.Simulate.click(btn[1]);
        expect(spySettings).toHaveBeenCalledWith('g001', 'groups', {});

        TestUtils.Simulate.click(btn[2]);
        const removeModal = document.getElementsByClassName('modal-dialog').item(0);
        expect(removeModal).toExist();
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
                }, crs: 'EPSG'
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
                }, crs: 'EPSG'
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

});
