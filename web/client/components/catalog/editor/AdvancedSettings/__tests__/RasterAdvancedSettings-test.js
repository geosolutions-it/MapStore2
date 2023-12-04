/**
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import ReactDOM from 'react-dom';
import expect from 'expect';
import RasterAdvancedSettings from "../RasterAdvancedSettings";
import TestUtils from "react-dom/test-utils";
import { waitFor } from '@testing-library/react';

describe('Test Raster advanced settings', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('creates the component with defaults', () => {
        ReactDOM.render(<RasterAdvancedSettings service={{type: "wms"}}/>, document.getElementById("container"));
        const advancedSettingPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingPanel).toBeTruthy();
    });
    it('test wms advanced options', () => {
        ReactDOM.render(<RasterAdvancedSettings service={{type: "wms", autoload: false}} isLocalizedLayerStylesEnabled/>, document.getElementById("container"));
        const advancedSettingPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingPanel).toBeTruthy();
        const fields = document.querySelectorAll(".form-group");
        expect(fields.length).toBe(13);
    });
    it('test csw advanced options', () => {
        ReactDOM.render(<RasterAdvancedSettings service={{type: "csw", autoload: false}}/>, document.getElementById("container"));
        const advancedSettingPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingPanel).toBeTruthy();
        const fields = document.querySelectorAll(".form-group");
        const cswFilters = document.getElementsByClassName("catalog-csw-filters");
        expect(fields.length).toBe(11);
        expect(cswFilters).toBeTruthy();
    });
    it('test component onChangeServiceProperty autoload', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<RasterAdvancedSettings onChangeServiceProperty={action.onChangeServiceProperty}
            service={{type: "wms", autoload: false}}/>, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const autload = document.querySelectorAll('input[type="checkbox"]')[0];
        expect(autload).toBeTruthy();
        TestUtils.Simulate.change(autload, { "target": { "checked": true }});
        expect(spyOn).toHaveBeenCalled();
    });
    it('test component onToggleThumbnail hideThumbnail', () => {
        const action = {
            onToggleThumbnail: () => {}
        };
        const spyOn = expect.spyOn(action, 'onToggleThumbnail');
        ReactDOM.render(<RasterAdvancedSettings onToggleThumbnail={action.onToggleThumbnail}
            service={{type: "wms", hideThumbnail: false}}/>, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const hideThumbnail = document.querySelectorAll('input[type="checkbox"]')[0];
        expect(hideThumbnail).toBeTruthy();
        TestUtils.Simulate.change(hideThumbnail, { "target": { "checked": true }});
        expect(spyOn).toHaveBeenCalled();
    });
    it('test component onChangeServiceProperty localizedLayerStyles', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<RasterAdvancedSettings onChangeServiceProperty={action.onChangeServiceProperty}
            isLocalizedLayerStylesEnabled  service={{type: "wms", localizedLayerStyles: false}}/>, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const localizedLayerStyles = document.querySelectorAll('input[type="checkbox"]')[1];
        expect(localizedLayerStyles).toBeTruthy();
        TestUtils.Simulate.change(localizedLayerStyles, { "target": { "checked": true }});
        expect(spyOn).toHaveBeenCalled();
    });
    it('test component apply default config autoSetVisibilityLimits on new service', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<RasterAdvancedSettings
            onChangeServiceProperty={action.onChangeServiceProperty}
            autoSetVisibilityLimits
            service={{isNew: true, type: "wms", autoSetVisibilityLimits: false}}
        />, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const autoSetVisibilityLimits = document.querySelectorAll('input[type="checkbox"]')[1];
        const formGroup = document.querySelectorAll('.form-group')[2];
        expect(formGroup.textContent.trim()).toBe('catalog.autoSetVisibilityLimits.label');
        expect(autoSetVisibilityLimits).toBeTruthy();
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'autoSetVisibilityLimits', true ]);
    });
    it('test component onChangeServiceProperty autoSetVisibilityLimits', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<RasterAdvancedSettings
            onChangeServiceProperty={action.onChangeServiceProperty}
            service={{type: "wms", autoSetVisibilityLimits: false}}
        />, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const autoSetVisibilityLimits = document.querySelectorAll('input[type="checkbox"]')[1];
        const formGroup = document.querySelectorAll('.form-group')[2];
        expect(formGroup.textContent.trim()).toBe('catalog.autoSetVisibilityLimits.label');
        expect(autoSetVisibilityLimits).toBeTruthy();
        TestUtils.Simulate.change(autoSetVisibilityLimits, { "target": { "checked": true }});
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'autoSetVisibilityLimits', true ]);
    });
    it('test component when showTemplate true', (done) => {
        ReactDOM.render(<RasterAdvancedSettings
            service={{type: "csw", showTemplate: true}}/>, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        waitFor(() => expect(document.querySelector('.ql-editor')).toBeTruthy())
            .then(() => done())
            .catch(done);
    });
    it('test component onToggleTemplate showTemplate', () => {
        const action = {
            onToggleTemplate: () => {}
        };
        const spyOnToggleTemplate = expect.spyOn(action, 'onToggleTemplate');
        ReactDOM.render(<RasterAdvancedSettings
            onToggleTemplate={action.onToggleTemplate}
            service={{type: "csw", showTemplate: false}}/>, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const showTemplate = document.querySelectorAll('input[type="checkbox"]')[2];
        expect(showTemplate).toBeTruthy();
        TestUtils.Simulate.change(showTemplate, { "target": { "checked": true }});
        expect(spyOnToggleTemplate).toHaveBeenCalled();
    });
    it('test component onChangeServiceFormat formats', () => {
        const action = {
            onChangeServiceFormat: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceFormat');
        ReactDOM.render(<RasterAdvancedSettings
            formatOptions={['image/png', 'image/png8', 'image/jpeg']}
            onChangeServiceFormat={action.onChangeServiceFormat}
            service={{type: "wms"}}/>, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const format = document.querySelectorAll('input[role="combobox"]')[1];
        expect(format).toBeTruthy();
        TestUtils.Simulate.change(format, { target: { value: 'image/png' } });
        TestUtils.Simulate.keyDown(format, { keyCode: 9, key: 'Tab' });
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments[0]).toBe('image/png');
    });
    it('test component onChangeServiceProperty layerOption', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<RasterAdvancedSettings
            onChangeServiceProperty={action.onChangeServiceProperty}
            service={{type: "wms", layerOptions: {tileSize: 256}}}/>, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const layerOption = document.querySelectorAll('input[role="combobox"]')[3];
        expect(layerOption).toBeTruthy();
        TestUtils.Simulate.change(layerOption, { target: { value: "512" }});
        TestUtils.Simulate.keyDown(layerOption, { keyCode: 9, key: 'Tab' });
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'layerOptions', { tileSize: 512 } ]);
    });
    it('test component onChangeServiceProperty allowUnsecureLayers', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<RasterAdvancedSettings
            onChangeServiceProperty={action.onChangeServiceProperty}
            service={{type: "wms", allowUnsecureLayers: false}}
        />, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const allowUnsecureLayers = document.querySelectorAll('input[type="checkbox"]')[3];
        const formGroup = document.querySelectorAll('.form-group')[4];
        expect(formGroup.textContent.trim()).toBe('catalog.allowUnsecureLayers.label');
        expect(allowUnsecureLayers).toBeTruthy();
        TestUtils.Simulate.change(allowUnsecureLayers, { "target": { "checked": true }});
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'allowUnsecureLayers', true ]);

        // Unset allowUnsecureLayers
        TestUtils.Simulate.change(allowUnsecureLayers, { "target": { "checked": false }});
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[1].arguments).toEqual([ 'allowUnsecureLayers', false ]);
    });
    it('test component onChangeServiceProperty singleTile', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<RasterAdvancedSettings
            onChangeServiceProperty={action.onChangeServiceProperty}
            service={{ type: "wms" }}
        />, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const formGroup = document.querySelectorAll('.form-group')[3];
        expect(formGroup.textContent.trim()).toBe('layerProperties.singleTile');
        const singleTileLayer = formGroup.querySelector('input[type="checkbox"]');
        expect(singleTileLayer).toBeTruthy();
        TestUtils.Simulate.change(singleTileLayer, { "target": { "checked": true }});
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'layerOptions', { singleTile: true } ]);
    });
    it('test component onChangeServiceProperty serverType', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<RasterAdvancedSettings
            onChangeServiceProperty={action.onChangeServiceProperty}
            service={{ type: "wms", layerOptions: {serverType: 'no-vendor'} }}
        />, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const serverTypeOption = document.querySelectorAll('input[role="combobox"]')[0];
        expect(serverTypeOption).toBeTruthy();
        TestUtils.Simulate.change(serverTypeOption, { target: { value: "geoserver" }});
        TestUtils.Simulate.keyDown(serverTypeOption, { keyCode: 9, key: 'Tab' });
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'layerOptions', { serverType: "geoserver" } ]);
    });
    it('test component onChangeServiceProperty infoFormat', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<RasterAdvancedSettings
            infoFormatOptions={['text/html', 'text/plain', 'application/json']}
            onChangeServiceProperty={action.onChangeServiceProperty}
            service={{ type: "wms" }}/>, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const infoFormatOption = document.querySelectorAll('input[role="combobox"]')[2];
        expect(infoFormatOption).toBeTruthy();
        TestUtils.Simulate.change(infoFormatOption, { target: { value: "application/json" }});
        TestUtils.Simulate.keyDown(infoFormatOption, { keyCode: 9, key: 'Tab' });
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'infoFormat', 'application/json' ]);
    });
});
