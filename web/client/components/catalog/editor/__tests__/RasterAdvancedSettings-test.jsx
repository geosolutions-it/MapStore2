/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import expect from 'expect';

import RasterAdvancedSettings from '../AdvancedSettings/RasterAdvancedSettings';

describe('Test Advanced Settings', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });


    it('Test Advanced Settings rendering with defaults', () => {
        ReactDOM.render(<RasterAdvancedSettings
            id="mapstore-metadata-explorer"
            service= {[{
                "url": "https://public.sig.rennesmetropole.fr/geoserver/wms",
                "type": "wms", "title": "WMS RM", "autoload": false, "showAdvancedSettings": true,
                "showTemplate": false, "hideThumbnail": false,
                "metadataTemplate": "<p>${description}</p>", "oldService": "WMS RM", "format": "image/png8",
                "formatUrlUsed": "https://public.sig.rennesmetropole.fr/geoserver/wms",
                "supportedFormats": {"imageFormats": [{"label": "image/png", "value": "image/png"},
                    {"label": "image/gif", "value": "image/gif"}, {"label": "image/jpeg", "value": "image/jpeg"},
                    {"label": "image/png8", "value": "image/png8"}, {"label": "image/vnd.jpeg-png", "value": "image/vnd.jpeg-png"},
                    {"label": "image/vnd.jpeg-png8", "value": "image/vnd.jpeg-png8"}],
                "infoFormats": ["text/plain", "text/html", "application/json"]}, "infoFormat": "TEXT"
            }]}
            formatOptions = {[
                {"label": "image/png", "value": "image/png"}, {"label": "image/gif", "value": "image/gif"},
                {"label": "image/jpeg", "value": "image/jpeg"}, {"label": "image/png8", "value": "image/png8"},
                {"label": "image/vnd.jpeg-png", "value": "image/vnd.jpeg-png"},
                {"label": "image/vnd.jpeg-png8", "value": "image/vnd.jpeg-png8"}
            ]}

            //   buttonStyle = { {"marginBottom": "10px", "marginRight": "5px"}, "isLocalizedLayerStylesEnabled": true } }
            tileSizeOptions = {[256, 512]}
            currentWMSCatalogLayerSize= {256}
            selectedService="WMS RM"
            formatsLoading = {false}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.formatStyle');
        expect(el).toExist();


    });


    it('Test Fetch info format on Advanced Settings', () => {


        ReactDOM.render(<RasterAdvancedSettings
            id="mapstore-metadata-explorer"
            service= {[{
                "url": "https://public.sig.rennesmetropole.fr/geoserver/wms",
                "type": "wms", "title": "WMS RM", "autoload": false, "showAdvancedSettings": true,
                "showTemplate": false, "hideThumbnail": false,
                "metadataTemplate": "<p>${description}</p>", "oldService": "WMS RM", "format": "image/png8",
                "formatUrlUsed": "https://public.sig.rennesmetropole.fr/geoserver/wms",
                "supportedFormats": {"imageFormats": [{"label": "image/png", "value": "image/png"},
                    {"label": "image/gif", "value": "image/gif"}, {"label": "image/jpeg", "value": "image/jpeg"},
                    {"label": "image/png8", "value": "image/png8"}, {"label": "image/vnd.jpeg-png", "value": "image/vnd.jpeg-png"},
                    {"label": "image/vnd.jpeg-png8", "value": "image/vnd.jpeg-png8"}],
                "infoFormats": ["text/plain", "text/html", "application/json"]}, "infoFormat": "TEXT"
            }]}
            formatOptions = {[
                {"label": "image/png", "value": "image/png"}, {"label": "image/gif", "value": "image/gif"},
                {"label": "image/jpeg", "value": "image/jpeg"}, {"label": "image/png8", "value": "image/png8"},
                {"label": "image/vnd.jpeg-png", "value": "image/vnd.jpeg-png"},
                {"label": "image/vnd.jpeg-png8", "value": "image/vnd.jpeg-png8"}
            ]}

            //   buttonStyle = { {"marginBottom": "10px", "marginRight": "5px"}, "isLocalizedLayerStylesEnabled": true } }
            tileSizeOptions = {[256, 512]}
            currentWMSCatalogLayerSize= {256}
            selectedService="WMS RM"
            formatsLoading = {false}
        />, document.getElementById("container"));


        const container = document.getElementById('container');
        const el = container.querySelectorAll('.Select-arrow-zone');
        expect(el).toExist();
        expect(el.length).toBe(3);


    });


});
