/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const ReactDOM = require('react-dom');

const LayerMetadataModal = require('../LayerMetadataModal');
const RenderTemplate = require("../template/index");
const expect = require('expect');
const TestUtils = require('react-dom/test-utils');
const {Promise} = require('es6-promise');

const onToolsActions = {
    onHideLayerMetadata: () => {}
};

const metadataTemplate = [
    "<div id={model.identifier}>",
    "<Bootstrap.Table className='responsive'>",
    "<thead>",
    "<tr>",
    "<th>Campo</th><th>Valore</th>",
    "</tr>",
    "</thead>",
    "<tbody>",
    "<tr>",
    "<td>Identifier</td><td>{model.identifier}</td>",
    "</tr>",
    "<tr>",
    "<td>Title</td><td>{model.title}</td>",
    "</tr>",
    "<tr>",
    "<td>Abstract</td><td>{model.abstract}</td>",
    "</tr>",
    "<tr>",
    "<td>Subject</td><td>{Array.isArray(model.subject) ? model.subject.map((value, i) => <ul key={'meta'+i}><li key={i}>{value}</li></ul>) : model.subject}</td>",
    "</tr>",
    "<tr>",
    "<td>Type</td><td>{model.type}</td>",
    "</tr>",
    "<tr>",
    "<td>Creator</td><td>{model.creator}</td>",
    "</tr>",
    "</tbody>",
    "</Bootstrap.Table>",
    "</div>"
];

describe('TOC LayerMetadataModal', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render Layer Metadata Modal component', () => {
        const layerMetadata = {
            metadataRecord: {
                "identifier": "msg_rss_micro",
                "title": "msg_rss_micro runs from 2016-05-03T09:35:00 UTC to 2016-05-03T09:35:00 UTC",
                "format": "GeoTIFF",
                "abstract": "msg_rss_micro runs from 2016-05-03T09:35:00 to 2016-05-03T09:35:00 UTC every 5 minutes",
                "language": "ita",
                "source": "Run startup timestamp 2016-05-03T09:35:00"
            },
            expanded: true
        };

        ReactDOM.render(<LayerMetadataModal renderContent={RenderTemplate} layerMetadata={layerMetadata} />, document.getElementById("container"));
        const panelClass = document.getElementsByClassName('layer-settings-metadata-panel-title');
        expect(panelClass).toExist();
    });

    it('Hide Layer Metadata Modal component', () => {
        const spyHideLayerMetadata = expect.spyOn(onToolsActions, 'onHideLayerMetadata');
        const layerMetadata = {
            metadataRecord: {
                "identifier": "msg_rss_micro",
                "title": "msg_rss_micro runs from 2016-05-03T09:35:00 UTC to 2016-05-03T09:35:00 UTC",
                "format": "GeoTIFF",
                "abstract": "msg_rss_micro runs from 2016-05-03T09:35:00 to 2016-05-03T09:35:00 UTC every 5 minutes",
                "language": "ita",
                "source": "Run startup timestamp 2016-05-03T09:35:00"
            },
            expanded: true
        };

        ReactDOM.render(<LayerMetadataModal hideLayerMetadata={onToolsActions.onHideLayerMetadata} renderContent={RenderTemplate} layerMetadata={layerMetadata} />, document.getElementById("container"));
        let panelClass = document.getElementsByClassName('layer-settings-metadata-panel-title');
        const closeButton = document.getElementsByClassName('layer-settings-metadata-panel-close');
        expect(panelClass).toExist();
        expect(closeButton).toExist();
        TestUtils.Simulate.click(closeButton[0]);
        expect(spyHideLayerMetadata).toHaveBeenCalled();
    });

    it('render Layer Metadata Modal component with template', (done) => {

        const layerMetadata = {
            metadataRecord: {
                "identifier": "msg_rss_micro",
                "title": "msg_rss_micro runs from 2016-05-03T09:35:00 UTC to 2016-05-03T09:35:00 UTC",
                "format": "GeoTIFF",
                "abstract": "msg_rss_micro runs from 2016-05-03T09:35:00 to 2016-05-03T09:35:00 UTC every 5 minutes",
                "language": "ita",
                "source": "Run startup timestamp 2016-05-03T09:35:00"
            },
            expanded: true,
            maskLoading: false
        };

        let comp = ReactDOM.render(<LayerMetadataModal renderContent={RenderTemplate} metadataTemplate={metadataTemplate} layerMetadata={layerMetadata} />, document.getElementById("container"));
        const panelClass = document.getElementsByClassName('layer-settings-metadata-panel-title');
        expect(panelClass).toExist();
        new Promise((resolve) => {
            require.ensure(['babel-standalone'], () => {
                resolve(comp);
            });
        }).then(() => {
            try {
                const cmpDom = document.getElementById("msg_rss_micro");
                expect(cmpDom).toExist();
                expect(cmpDom.id).toExist();
                expect(cmpDom.id).toBe("msg_rss_micro");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('render Layer Metadata Modal component with component template', (done) => {

        const CompTemplate = (props) => {
            return <div id={props.model.identifier}></div>;
        };

        const layerMetadata = {
            metadataRecord: {
                "identifier": "msg_rss_micro",
                "title": "msg_rss_micro runs from 2016-05-03T09:35:00 UTC to 2016-05-03T09:35:00 UTC",
                "format": "GeoTIFF",
                "abstract": "msg_rss_micro runs from 2016-05-03T09:35:00 to 2016-05-03T09:35:00 UTC every 5 minutes",
                "language": "ita",
                "source": "Run startup timestamp 2016-05-03T09:35:00"
            },
            expanded: true,
            maskLoading: false
        };

        let comp = ReactDOM.render(<LayerMetadataModal renderContent={RenderTemplate} metadataTemplate={CompTemplate} layerMetadata={layerMetadata} />, document.getElementById("container"));
        const panelClass = document.getElementsByClassName('layer-settings-metadata-panel-title');
        expect(panelClass).toExist();
        new Promise((resolve) => {
            require.ensure(['babel-standalone'], () => {
                resolve(comp);
            });
        }).then(() => {
            try {
                const cmpDom = document.getElementById("msg_rss_micro");
                expect(cmpDom).toExist();
                expect(cmpDom.id).toExist();
                expect(cmpDom.id).toBe("msg_rss_micro");
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
