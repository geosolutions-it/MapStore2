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
const expect = require('expect');

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

        ReactDOM.render(<LayerMetadataModal layerMetadata={layerMetadata} />, document.getElementById("container"));
        const panelClass = document.getElementsByClassName('layer-settings-metadata-panel-title');
        expect(panelClass).toExist();
        const id = document.getElementById('msg_rss_micro');
        expect(id).toExist();
    });
});
