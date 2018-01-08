/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const expect = require('expect');
const ReactDOM = require('react-dom');
const Template = require('../../../../data/template/jsx/Template');
const RenderTemplate = require("../index");
const {Promise} = require('es6-promise');

const metadataTemplate = require("../MetadataTemplate");

describe("Test Layer Metadata JSX Template", () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('Test Layer Metadata default Template', (done) => {

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
        let comp = ReactDOM.render(
            <Template
                model={layerMetadata.metadataRecord}
                template={metadataTemplate}
                renderContent={RenderTemplate}/>, document.getElementById("container"));
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
