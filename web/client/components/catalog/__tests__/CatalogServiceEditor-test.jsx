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
import TestUtils from 'react-dom/test-utils';
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
        const formatOptions = [
            "image/png8",
            "image/jpeg"
        ];
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

        const formatFormGroups = [...document.querySelectorAll('.form-group-flex')];
        expect(formatFormGroups.length).toBe(6);
        const formatSelect = formatFormGroups[2].querySelector('.Select-value-label');
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
            return labels.length === 1 && labels[0].textContent === 'layerProperties.wmsLayerTileSize';
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
    it('test save and delete button when saving', () => {
        ReactDOM.render(<CatalogServiceEditor
            service={givenWmsService}
            layerOptions={{tileSize: 256}}
            saving
        />, document.getElementById("container"));
        let buttons = document.querySelectorAll('.form-group button');
        let saveBtn; let deleteBtn;
        buttons.forEach(btn => {if (btn.textContent === 'save') saveBtn = btn;});
        buttons.forEach(btn => {if (btn.textContent === 'catalog.delete') deleteBtn = btn;});
        expect(saveBtn).toBeTruthy();
        expect(deleteBtn).toBeTruthy();
        expect(saveBtn.classList.contains("disabled")).toBeTruthy();
        expect(deleteBtn.classList.contains("disabled")).toBeTruthy();
    });
    it('test saving service for COG type', () => {
        const actions = {
            onAddService: () => {}
        };
        const spyOnAdd = expect.spyOn(actions, 'onAddService');
        ReactDOM.render(<CatalogServiceEditor
            format="cog"
            onAddService={actions.onAddService}
        />, document.getElementById("container"));
        let buttons = document.querySelectorAll('.form-group button');
        let saveBtn;
        buttons.forEach(btn => {if (btn.textContent === 'save') saveBtn = btn;});
        expect(saveBtn).toBeTruthy();
        TestUtils.Simulate.click(saveBtn);
        expect(spyOnAdd).toHaveBeenCalled();
        let arg = spyOnAdd.calls[0].arguments[0];
        expect(arg.save).toBe(true);
        expect(arg.controller).toBeTruthy();

        ReactDOM.render(<CatalogServiceEditor
            format="csw"
            onAddService={actions.onAddService}
        />, document.getElementById("container"));
        buttons = document.querySelectorAll('.form-group button');
        buttons.forEach(btn => {if (btn.textContent === 'save') saveBtn = btn;});
        expect(saveBtn).toBeTruthy();
        TestUtils.Simulate.click(saveBtn);
        expect(spyOnAdd).toHaveBeenCalled();
        arg = spyOnAdd.calls[1].arguments[0];
        expect(arg.save).toBeTruthy();
        expect(arg.controller).toBeFalsy();
    });
    it('test cancel service', () => {
        const actions = {
            onChangeCatalogMode: () => {},
            onAddService: () => {}
        };
        const spyOnCancel = expect.spyOn(actions, 'onChangeCatalogMode');
        ReactDOM.render(<CatalogServiceEditor
            format="csw"
            onChangeCatalogMode={actions.onChangeCatalogMode}
        />, document.getElementById("container"));
        let buttons = document.querySelectorAll('.form-group button');
        let cancelBtn;
        buttons.forEach(btn => {if (btn.textContent === 'cancel') cancelBtn = btn;});
        expect(cancelBtn).toBeTruthy();
        TestUtils.Simulate.click(cancelBtn);
        expect(spyOnCancel).toHaveBeenCalled();
        let arg = spyOnCancel.calls[0].arguments[0];
        expect(arg).toBe('view');

        const spyOnAdd = expect.spyOn(actions, 'onAddService');
        ReactDOM.render(<CatalogServiceEditor
            format="cog"
            onChangeCatalogMode={actions.onChangeCatalogMode}
            onAddService={actions.onAddService}
        />, document.getElementById("container"));
        buttons = document.querySelectorAll('.form-group button');
        let saveBtn;
        buttons.forEach(btn => {if (btn.textContent === 'save') saveBtn = btn;});
        TestUtils.Simulate.click(saveBtn);
        expect(spyOnAdd).toHaveBeenCalled();

        ReactDOM.render(<CatalogServiceEditor
            format="cog"
            saving
            onChangeCatalogMode={actions.onChangeCatalogMode}
            onAddService={actions.onAddService}
        />, document.getElementById("container"));
        buttons = document.querySelectorAll('.form-group button');
        buttons.forEach(btn => {if (btn.textContent === 'cancel') cancelBtn = btn;});
        TestUtils.Simulate.click(cancelBtn);
        expect(spyOnCancel.calls[1]).toBeFalsy();
    });
});
