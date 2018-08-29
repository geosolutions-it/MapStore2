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
        ReactDOM.render(<TOCItemsSettings activeTab="general" getTabs={() => [
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
        ReactDOM.render(<TOCItemsSettings activeTab="general" getTabs={() => []}/>, document.getElementById("container"));
        const navBar = document.getElementsByClassName('nav-justified')[0];
        expect(navBar).toNotExist();
    });

    it('test with tabs length 1', () => {
        ReactDOM.render(<TOCItemsSettings activeTab="general" getTabs={() => [{
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
        ReactDOM.render(<TOCItemsSettings alertModal/>, document.getElementById("container"));
        const alertModal = document.getElementsByClassName('ms-resizable-modal');
        expect(alertModal.length).toBe(1);
    });

    it('test with a title ', () => {
        ReactDOM.render(<TOCItemsSettings activeTab="general" getTabs={() => [
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

});
