/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const expect = require('expect');
const ReactDOM = require('react-dom');
const TOCItemsSettings = require('../TOCItemsSettings');
const TestUtils = require('react-dom/test-utils');

const layers = [
    {
        name: 'layer:00',
        title: {
            'default': ''
        },
        visibility: true,
        type: 'wms'
    }
];
const settings = {
    expanded: true
};

describe("test TOCItemsSettings", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test with tabs', () => {
        ReactDOM.render(<TOCItemsSettings settings={settings} activeTab="general" tabs={[
            {
                id: 'general',
                titleId: 'layerProperties.general',
                tooltipId: 'layerProperties.general',
                glyph: 'wrench',
                Component: () => <div id="test-general-body"></div>
            },
            {
                id: 'display',
                titleId: 'layerProperties.display',
                tooltipId: 'layerProperties.display',
                glyph: 'eye-open',
                Component: () => <div id="test-display-body"></div>
            }
        ]}/>, document.getElementById("container"));
        const navBar = document.getElementsByClassName('nav-justified')[0];
        expect(navBar.children.length).toBe(2);
        const testGeneralBody = document.getElementById('test-general-body');
        expect(testGeneralBody).toExist();
        const testDisplayBody = document.getElementById('test-display-body');
        expect(testDisplayBody).toNotExist();
    });

    it('test without tabs', () => {
        ReactDOM.render(<TOCItemsSettings settings={settings} activeTab="general" tabs={[]}/>, document.getElementById("container"));
        const navBar = document.getElementsByClassName('nav-justified')[0];
        expect(navBar).toNotExist();
    });

    it('test with tabs length 1', () => {
        ReactDOM.render(<TOCItemsSettings settings={settings} activeTab="general" tabs={[{
            id: 'general',
            titleId: 'layerProperties.general',
            tooltipId: 'layerProperties.general',
            glyph: 'wrench',
            Component: () => <div id="test-general-body"></div>
        }]}/>, document.getElementById("container"));
        const navBar = document.getElementsByClassName('nav-justified')[0];
        expect(navBar).toNotExist();
        const testGeneralBody = document.getElementById('test-general-body');
        expect(testGeneralBody).toExist();
    });

    it('test alert modal', () => {
        ReactDOM.render(<TOCItemsSettings settings={settings} alertModal/>, document.getElementById("container"));
        const alertModal = document.getElementsByClassName('ms-resizable-modal');
        expect(alertModal.length).toBe(1);
    });

    it('test with a title ', () => {
        ReactDOM.render(<TOCItemsSettings settings={settings} activeTab="general" tabs={[
            {
                id: 'general',
                titleId: 'layerProperties.general',
                tooltipId: 'layerProperties.general',
                glyph: 'wrench',
                Component: () => <div id="test-general-body"></div>
            },
            {
                id: 'display',
                titleId: 'layerProperties.display',
                tooltipId: 'layerProperties.display',
                glyph: 'eye-open',
                Component: () => <div id="test-display-body"></div>
            }
        ]} element={layers[0]}/>, document.getElementById("container"));
        const baar = document.getElementsByClassName("container-fluid")[0].childNodes[0].childNodes[1].childNodes[0].textContent;
        expect(baar).toBe(layers[0].title.default);

    });

    it('test onClick function on tab', () => {

        const testHandlers = {
            onClick: () => {}
        };

        const spyOnClick = expect.spyOn(testHandlers, 'onClick');

        ReactDOM.render(<TOCItemsSettings settings={settings} activeTab="general" tabs={[
            {
                id: 'general',
                titleId: 'layerProperties.general',
                tooltipId: 'layerProperties.general',
                glyph: 'wrench',
                onClick: testHandlers.onClick,
                Component: () => <div id="test-general-body"></div>
            },
            {
                id: 'display',
                titleId: 'layerProperties.display',
                tooltipId: 'layerProperties.display',
                glyph: 'eye-open',
                Component: () => <div id="test-display-body"></div>
            }
        ]} element={layers[0]}/>, document.getElementById("container"));

        const tabs = document.querySelectorAll('.nav > li > a');
        expect(tabs.length).toBe(2);
        TestUtils.Simulate.click(tabs[0]);
        expect(spyOnClick).toHaveBeenCalled();
    });

    it('test onClose function on tab', () => {

        const testHandlers = {
            onClose: () => {}
        };

        const spyOnClose = expect.spyOn(testHandlers, 'onClose');

        ReactDOM.render(<TOCItemsSettings settings={settings} activeTab="general" tabs={[
            {
                id: 'general',
                titleId: 'layerProperties.general',
                tooltipId: 'layerProperties.general',
                glyph: 'wrench',
                onClose: testHandlers.onClose,
                Component: () => <div id="test-general-body"></div>
            },
            {
                id: 'display',
                titleId: 'layerProperties.display',
                tooltipId: 'layerProperties.display',
                glyph: 'eye-open',
                Component: () => <div id="test-display-body"></div>
            }
        ]} onClose={null} element={layers[0]}/>, document.getElementById("container"));

        const closeButton = document.querySelectorAll('.ms-close');
        expect(closeButton.length).toBe(1);
        TestUtils.Simulate.click(closeButton[0]);
        expect(spyOnClose).toHaveBeenCalled();
    });

    it('test ToolbarComponent from tab', () => {

        ReactDOM.render(<TOCItemsSettings settings={settings} activeTab="general" tabs={[
            {
                id: 'general',
                titleId: 'layerProperties.general',
                tooltipId: 'layerProperties.general',
                glyph: 'wrench',
                toolbarComponent: () => <div className="custom-toolbar"></div>,
                Component: () => <div id="test-general-body"></div>
            },
            {
                id: 'display',
                titleId: 'layerProperties.display',
                tooltipId: 'layerProperties.display',
                glyph: 'eye-open',
                Component: () => <div id="test-display-body"></div>
            }
        ]} element={layers[0]}/>, document.getElementById("container"));

        const btnGroup = document.querySelector('.btn-group');
        expect(btnGroup).toNotExist();
        const customToolbar = document.querySelector('.custom-toolbar');
        expect(customToolbar).toExist();
    });

});
