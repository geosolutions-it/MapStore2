/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from "react-dom";
import CommonAdvancedSettings from "../CommonAdvancedSettings";
import expect from "expect";
import TestUtils from "react-dom/test-utils";
import { setConfigProp } from '../../../../../utils/ConfigUtils';

describe('Test common advanced settings', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setConfigProp('miscSettings', { experimentalInteractiveLegend: true });
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setConfigProp('miscSettings', { });
        setTimeout(done);
    });
    it('creates the component with defaults', () => {
        ReactDOM.render(<CommonAdvancedSettings service={{type: "wms"}}/>, document.getElementById("container"));
        const advancedSettingPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingPanel).toBeTruthy();
    });
    it('test wms advanced options', () => {
        ReactDOM.render(<CommonAdvancedSettings service={{type: "wms"}}/>, document.getElementById("container"));
        const advancedSettingPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingPanel).toBeTruthy();
        const fields = document.querySelectorAll(".form-group");
        expect(fields.length).toBe(2);
    });
    it('test wfs advanced options', () => {
        ReactDOM.render(<CommonAdvancedSettings service={{type: "wfs"}}/>, document.getElementById("container"));
        const advancedSettingPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingPanel).toBeTruthy();
        const fields = document.querySelectorAll(".form-group");
        expect(fields.length).toBe(3);
    });
    it('test wms advanced options onChangeServiceProperty autoreload', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<CommonAdvancedSettings
            onChangeServiceProperty={action.onChangeServiceProperty}
            service={{type: "wfs", autoload: false}}
        />, document.getElementById("container"));
        const advancedSettingPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingPanel).toBeTruthy();
        const fields = document.querySelectorAll(".form-group");
        expect(fields.length).toBe(3);
        const autoload = document.querySelectorAll('input[type="checkbox"]')[0];
        const formGroup = document.querySelectorAll('.form-group')[0];
        expect(formGroup.textContent.trim()).toBe('catalog.autoload');
        expect(autoload).toExist();
        TestUtils.Simulate.change(autoload, { "target": { "checked": true }});
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'autoload', true ]);
    });
    it('test component onChangeServiceProperty fetchMetadata', () => {
        const action = {
            onChangeServiceProperty: () => {}
        };
        const spyOn = expect.spyOn(action, 'onChangeServiceProperty');
        ReactDOM.render(<CommonAdvancedSettings
            onChangeServiceProperty={action.onChangeServiceProperty}
            service={{type: "cog", fetchMetadata: false}}
        />, document.getElementById("container"));
        const advancedSettingsPanel = document.getElementsByClassName("mapstore-switch-panel");
        expect(advancedSettingsPanel).toBeTruthy();
        const fetchMetadata = document.querySelectorAll('input[type="checkbox"]')[1];
        const formGroup = document.querySelectorAll('.form-group')[2];
        expect(formGroup.textContent.trim()).toBe('catalog.fetchMetadata.label');
        expect(fetchMetadata).toExist();
        TestUtils.Simulate.change(fetchMetadata, { "target": { "checked": true }});
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[0].arguments).toEqual([ 'fetchMetadata', true ]);

        // Unset fetchMetadata
        TestUtils.Simulate.change(fetchMetadata, { "target": { "checked": false }});
        expect(spyOn).toHaveBeenCalled();
        expect(spyOn.calls[1].arguments).toEqual([ 'fetchMetadata', false ]);
    });
    it('test showing/hiding interactive legend checkbox for WFS', () => {
        ReactDOM.render(<CommonAdvancedSettings
            service={{type: "wfs"}}
        />, document.getElementById("container"));
        const interactiveLegendCheckboxInput = document.querySelector(".wfs-vector-interactive-legend .checkbox input[data-qa='display-interactive-legend-option']");
        expect(interactiveLegendCheckboxInput).toBeTruthy();
        const interactiveLegendLabel = document.querySelector(".wfs-vector-interactive-legend .checkbox span");
        expect(interactiveLegendLabel).toBeTruthy();
        expect(interactiveLegendLabel.innerHTML).toEqual('layerProperties.enableInteractiveLegendInfo.label');
    });
    it('test showing/hiding interactive legend checkbox for vector', () => {
        ReactDOM.render(<CommonAdvancedSettings
            service={{type: "vector"}}
        />, document.getElementById("container"));
        const interactiveLegendCheckboxInput = document.querySelector(".wfs-vector-interactive-legend .checkbox input[data-qa='display-interactive-legend-option']");
        expect(interactiveLegendCheckboxInput).toBeTruthy();
        const interactiveLegendLabel = document.querySelector(".wfs-vector-interactive-legend .checkbox span");
        expect(interactiveLegendLabel).toBeTruthy();
        expect(interactiveLegendLabel.innerHTML).toEqual('layerProperties.enableInteractiveLegendInfo.label');
    });
});
