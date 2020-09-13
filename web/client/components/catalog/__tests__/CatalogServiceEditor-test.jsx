/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import CatalogServiceEditor from '../CatalogServiceEditor';

const givenWmsService = {
    url: "url",
    type: "wms",
    title: "wms",
    oldService: "gs_stable_wms",
    showAdvancedSettings: true
};

describe('Test CatalogServiceEditor', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test service format', () => {
        const formatOptions = [{
            label: "image/png8",
            value: "image/png8"
        }, {
            label: "image/jpeg",
            value: "image/jpeg"
        }];
        ReactDOM.render(<CatalogServiceEditor
            services={{
                "csw": {
                    type: "csw",
                    url: "url",
                    title: "csw",
                    format: "image/png8"
                }
            }}
            selectedService="csw"
            formatOptions={formatOptions}
            mode="edit"
            service={{
                url: "url",
                type: "csw",
                title: "csw",
                oldService: "csw",
                showAdvancedSettings: true,
                format: "image/png8"
            }}
            layerOptions={{tileSize: 256}}
        />, document.getElementById("container"));

        const formatFormGroups = [...document.querySelectorAll('.form-group')].filter(fg => {
            const labels = [...fg.querySelectorAll('label')];
            return labels.length === 1 && labels[0].textContent === 'Format';
        });
        expect(formatFormGroups.length).toBe(1);
        const formatSelect = formatFormGroups[0].querySelector('.Select-value-label');
        expect(formatSelect).toExist();
        expect(formatSelect.textContent).toBe('image/png8');
        // expect(formatSelect.props.options).toEqual(formatOptions); TODO: test properties are passed to select
    });
    it('test WMS layer tileSize', () => {
        ReactDOM.render(<CatalogServiceEditor
            services={{
                "csw": {
                    type: "csw",
                    url: "url",
                    title: "csw",
                    format: "image/png8"
                }
            }}
            selectedService="csw"
            mode="edit"
            service={{
                url: "url",
                type: "csw",
                title: "csw",
                oldService: "csw",
                showAdvancedSettings: true,
                format: "image/png8"
            }}
            layerOptions={{tileSize: 256}}
        />, document.getElementById("container"));

        const wmstileSizeFormGroups = [...document.querySelectorAll('.form-group')].filter(fg => {
            const labels = [...fg.querySelectorAll('label')];
            return labels.length === 1 && labels[0].textContent === 'WMS Layer tile size';
        });
        expect(wmstileSizeFormGroups.length).toBe(1);
        const tileSizeSelect = wmstileSizeFormGroups[0].querySelector('.Select-value-label');
        expect(tileSizeSelect).toExist();
        expect(tileSizeSelect.textContent).toBe("256x256");
    });
    it('test localized layer styles option enabled and switched off for WMS service', () => {
        ReactDOM.render(<CatalogServiceEditor
            formatOptions={[{
                label: "image/jpeg",
                value: "image/jpeg"
            }]}
            service={givenWmsService}
            isLocalizedLayerStylesEnabled
            layerOptions={{tileSize: 256}}
        />, document.getElementById("container"));

        const isLocalizedLayerStylesOption = document.querySelector('[data-qa="service-lacalized-layer-styles-option"]');
        expect(isLocalizedLayerStylesOption).toExist();
        expect(isLocalizedLayerStylesOption.checked).toBe(false);
    });
    it('test localized layer styles option enabled and switched on for WMS service', () => {
        ReactDOM.render(<CatalogServiceEditor
            formatOptions={[{
                label: "image/jpeg",
                value: "image/jpeg"
            }]}
            service={{...givenWmsService, localizedLayerStyles: true}}
            isLocalizedLayerStylesEnabled
            layerOptions={{tileSize: 256}}
        />, document.getElementById("container"));

        const isLocalizedLayerStylesOption = document.querySelector('[data-qa="service-lacalized-layer-styles-option"]');
        expect(isLocalizedLayerStylesOption).toExist();
        expect(isLocalizedLayerStylesOption.checked).toBe(true);
    });
    it('test localized layer styles option disabled for WMS service', () => {
        ReactDOM.render(<CatalogServiceEditor
            formatOptions={[{
                label: "image/jpeg",
                value: "image/jpeg"
            }]}
            service={givenWmsService}
            layerOptions={{tileSize: 256}}
        />, document.getElementById("container"));

        const isLocalizedLayerStylesOption = document.querySelector('[data-qa="service-lacalized-layer-styles-option"]');
        expect(isLocalizedLayerStylesOption).toBeNull;
    });
});
