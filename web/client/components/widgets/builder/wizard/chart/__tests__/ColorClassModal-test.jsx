/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import expect from 'expect';
import ColorClassModal from '../ColorClassModal';
import { hexToRgb } from '../../../../../../utils/ColorUtils';
import { CLASSIFICATION, CLASSIFICATION_ATTRIBUTE, DEFAULT_CUSTOM_COLOR, DEFAULT_CUSTOM_LABEL, OPTIONS, TEST_LAYER } from './sample_data';

const testHandlers = {
    onClose: () => {},
    onSaveClassification: () => {},
    onChangeClassAttribute: () => {},
    onUpdateClasses: () => {},
    onChangeColor: () => {},
    onChangeDefaultClassLabel: () => {}
};

describe('Custom Colors Classification modal', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('render Color Class Modal component', () => {
        ReactDOM.render(
            <ColorClassModal
                show
                classification={CLASSIFICATION}
                classificationAttribute={CLASSIFICATION_ATTRIBUTE}
                defaultCustomColor={DEFAULT_CUSTOM_COLOR[0]}
                defaultClassLabel={DEFAULT_CUSTOM_LABEL[0]}
                options={OPTIONS}
                layer={TEST_LAYER}
            />, document.getElementById("container"));
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal');
        expect(colorClassMd.length).toBe(1);
        // default color picker
        const defaultColorPicker = colorClassMd[0].getElementsByClassName('ms-color-picker')[0];
        expect(defaultColorPicker).toExist;
        const defaultColorPickerSwatch = defaultColorPicker.getElementsByClassName('ms-color-picker-swatch')[0];
        const defaultRgbColor = hexToRgb(DEFAULT_CUSTOM_COLOR[0]);
        const defaultRgbBgColor = defaultColorPickerSwatch.style.backgroundColor
            .substring(4, defaultColorPickerSwatch.style.backgroundColor.length - 1)
            .split(',')
            .map(item => parseInt(item, 10));
        expect(defaultRgbBgColor[0]).toBe(defaultRgbColor[0]);
        expect(defaultRgbBgColor[1]).toBe(defaultRgbColor[1]);
        expect(defaultRgbBgColor[2]).toBe(defaultRgbColor[2]);
        // default label
        const defaultLabelTextEditor = colorClassMd[0].getElementsByClassName('form-control')[0];
        expect(defaultLabelTextEditor.value).toBe(DEFAULT_CUSTOM_LABEL[0]);
        // classification attributes dropdown
        const classSelect = colorClassMd[0].getElementsByClassName('Select-control')[0];
        const selectedLabel = colorClassMd[0].getElementsByClassName('Select-value-label')[0].textContent;
        expect(selectedLabel).toBe(CLASSIFICATION_ATTRIBUTE);
        ReactTestUtils.Simulate.keyDown(classSelect, { key: 'ArrowDown', keyCode: 40 });
        const classSelectMenu = colorClassMd[0].getElementsByClassName('Select-menu')[0];
        expect(classSelectMenu).toExist();
        let menuOptions = [];
        for (let i = 0; i < classSelectMenu.children.length; i++) {
            menuOptions.push(
                {
                    label: classSelectMenu.children[i].textContent,
                    value: classSelectMenu.children[i].textContent
                }
            );
        }
        expect(menuOptions).toEqual(OPTIONS);
        // classification attributes labels and color picker
        const themaClassEditor = colorClassMd[0].getElementsByClassName('thema-classes-editor')[0];
        const customValueAutocomplete = themaClassEditor.getElementsByClassName('autocompleteField')[0].getElementsByTagName('input')[0];
        const customLabelTextBox = themaClassEditor.getElementsByClassName('form-control')[0];
        const customColorPicker = themaClassEditor.getElementsByClassName('ms-color-picker')[0];
        const customColorPickerSwatch = customColorPicker.getElementsByClassName('ms-color-picker-swatch')[0];
        const customRgbColor = hexToRgb(CLASSIFICATION[0].color);
        const customRgbBgColor = customColorPickerSwatch.style.backgroundColor
            .substring(4, customColorPickerSwatch.style.backgroundColor.length - 1)
            .split(',')
            .map(item => parseInt(item, 10));
        expect(customValueAutocomplete.value).toBe(CLASSIFICATION[0].value);
        expect(customLabelTextBox.value).toBe(CLASSIFICATION[0].title);
        expect(customRgbBgColor[0]).toBe(customRgbColor[0]);
        expect(customRgbBgColor[1]).toBe(customRgbColor[1]);
        expect(customRgbBgColor[2]).toBe(customRgbColor[2]);
    });
    it('Test Color Class Modal on change class attribute for default color', () => {
        const spyonChange = expect.spyOn(testHandlers, 'onChangeClassAttribute');
        ReactDOM.render(
            <ColorClassModal
                show
                classification={CLASSIFICATION}
                classificationAttribute={CLASSIFICATION_ATTRIBUTE}
                onChangeClassAttribute={testHandlers.onChangeClassAttribute}
                defaultCustomColor={DEFAULT_CUSTOM_COLOR[0]}
                defaultClassLabel={DEFAULT_CUSTOM_LABEL[0]}
                options={OPTIONS}
                layer={TEST_LAYER}
            />, document.getElementById("container"));
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        const classSelectControl = colorClassMd.getElementsByClassName('Select-control')[0];
        let input = classSelectControl.getElementsByTagName('input')[0];
        expect(input).toExist();
        input.value = OPTIONS[1].value;
        ReactTestUtils.Simulate.change(input);
        const classSelectInput = colorClassMd.getElementsByClassName('Select-input')[0].childNodes[0];
        ReactTestUtils.Simulate.keyDown(classSelectInput, { key: 'Enter', keyCode: 13 });
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(OPTIONS[1].value);
    });
    it('Test Color Class Modal on change default color', () => {
        const spyonChange = expect.spyOn(testHandlers, 'onChangeColor');
        ReactDOM.render(
            <ColorClassModal
                show
                classification={CLASSIFICATION}
                classificationAttribute={CLASSIFICATION_ATTRIBUTE}
                onChangeColor={testHandlers.onChangeColor}
                defaultCustomColor={DEFAULT_CUSTOM_COLOR[0]}
                defaultClassLabel={DEFAULT_CUSTOM_LABEL[0]}
                options={OPTIONS}
                layer={TEST_LAYER}
            />, document.getElementById("container"));
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        const colorPickerNode = colorClassMd.querySelector('.ms-color-picker');
        // open picker
        ReactTestUtils.Simulate.click(colorPickerNode);
        const defaultColorClassSwatch = colorClassMd.getElementsByClassName('ms-color-picker-swatch')[0];
        const sketchPicker = document.getElementsByClassName('ms-sketch-picker')[0];
        expect(sketchPicker).toExist();
        const colorItemButton = sketchPicker.getElementsByClassName('flexbox-fix')[2].childNodes[12].getElementsByTagName('div')[0];
        expect(colorItemButton).toExist();
        ReactTestUtils.Simulate.click(colorItemButton);
        const defaultRgbButtonColor = colorItemButton.style.backgroundColor
            .substring(4, colorItemButton.style.backgroundColor.length - 1)
            .split(',')
            .map(item => parseInt(item, 10));
        const defaultRgbSwatchColor = defaultColorClassSwatch.style.backgroundColor
            .substring(4, defaultColorClassSwatch.style.backgroundColor.length - 1)
            .split(',')
            .map(item => parseInt(item, 10));
        expect(defaultRgbButtonColor[0]).toBe(defaultRgbSwatchColor[0]);
        expect(defaultRgbButtonColor[1]).toBe(defaultRgbSwatchColor[1]);
        expect(defaultRgbButtonColor[2]).toBe(defaultRgbSwatchColor[2]);
        // close picker
        ReactTestUtils.Simulate.click(colorPickerNode);
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0].toLowerCase()).toBe(DEFAULT_CUSTOM_COLOR[1].toLocaleLowerCase());
    });
    it('Test Color Class Modal on change default label', () => {
        const spyonChange = expect.spyOn(testHandlers, 'onChangeDefaultClassLabel');
        ReactDOM.render(
            <ColorClassModal
                show
                classification={CLASSIFICATION}
                classificationAttribute={CLASSIFICATION_ATTRIBUTE}
                onChangeDefaultClassLabel={testHandlers.onChangeDefaultClassLabel}
                defaultCustomColor={DEFAULT_CUSTOM_COLOR[0]}
                defaultClassLabel={DEFAULT_CUSTOM_LABEL[0]}
                options={OPTIONS}
                layer={TEST_LAYER}
            />, document.getElementById("container"));
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        const defaultLabelInput = colorClassMd.getElementsByTagName('input')[1];
        defaultLabelInput.value = DEFAULT_CUSTOM_LABEL[1];
        ReactTestUtils.Simulate.change(defaultLabelInput);
        expect(spyonChange).toHaveBeenCalled();
        expect(spyonChange.calls[0].arguments[0]).toBe(DEFAULT_CUSTOM_LABEL[1]);
    });
    it('Test Color Class Modal on change color for class', () => {
        const spyonUpdate = expect.spyOn(testHandlers, 'onUpdateClasses');
        ReactDOM.render(
            <ColorClassModal
                show
                classification={CLASSIFICATION}
                classificationAttribute={CLASSIFICATION_ATTRIBUTE}
                onUpdateClasses={testHandlers.onUpdateClasses}
                defaultCustomColor={DEFAULT_CUSTOM_COLOR[0]}
                defaultClassLabel={DEFAULT_CUSTOM_LABEL[0]}
                layer={TEST_LAYER}
            />, document.getElementById("container"));
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        const colorPickerNode = colorClassMd.getElementsByClassName('ms-color-picker')[1];
        // open picker
        ReactTestUtils.Simulate.click(colorPickerNode);
        const classColorClassSwatch = colorClassMd.getElementsByClassName('ms-color-picker-swatch')[1];
        const sketchPicker = document.getElementsByClassName('ms-sketch-picker')[0];
        expect(sketchPicker).toExist();
        const colorItemButton = sketchPicker.querySelector('div[title="#417505"]');
        expect(colorItemButton).toExist();
        ReactTestUtils.Simulate.click(colorItemButton);
        const defaultRgbButtonColor = colorItemButton.style.backgroundColor
            .substring(4, colorItemButton.style.backgroundColor.length - 1)
            .split(',')
            .map(item => parseInt(item, 10));
        const defaultRgbSwatchColor = classColorClassSwatch.style.backgroundColor
            .substring(4, classColorClassSwatch.style.backgroundColor.length - 1)
            .split(',')
            .map(item => parseInt(item, 10));
        expect(defaultRgbButtonColor[0]).toBe(defaultRgbSwatchColor[0]);
        expect(defaultRgbButtonColor[1]).toBe(defaultRgbSwatchColor[1]);
        expect(defaultRgbButtonColor[2]).toBe(defaultRgbSwatchColor[2]);
        // close picker
        ReactTestUtils.Simulate.click(colorPickerNode);
        expect(spyonUpdate).toHaveBeenCalled();
        expect(spyonUpdate.calls[0].arguments[0][0].color.toLowerCase()).toBe(CLASSIFICATION[1].color);
    });
    it('Test Color Class Modal on change value for class', () => {
        const spyonUpdate = expect.spyOn(testHandlers, 'onUpdateClasses');
        ReactDOM.render(
            <ColorClassModal
                show
                classification={CLASSIFICATION}
                classificationAttribute={CLASSIFICATION_ATTRIBUTE}
                onUpdateClasses={testHandlers.onUpdateClasses}
                defaultCustomColor={DEFAULT_CUSTOM_COLOR[0]}
                defaultClassLabel={DEFAULT_CUSTOM_LABEL[0]}
                options={OPTIONS}
                layer={TEST_LAYER}
            />, document.getElementById("container"));
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        const classValueInput = colorClassMd.getElementsByTagName('input')[2];
        classValueInput.value = CLASSIFICATION[1].value;
        ReactTestUtils.Simulate.change(classValueInput);
        expect(spyonUpdate).toHaveBeenCalled();
        expect(spyonUpdate.calls[0].arguments[0][1].unique).toBe(CLASSIFICATION[1].unique);
    });
    it('Test Color Class Modal on change label for class', () => {
        const spyonUpdate = expect.spyOn(testHandlers, 'onUpdateClasses');
        ReactDOM.render(
            <ColorClassModal
                show
                classification={CLASSIFICATION}
                classificationAttribute={CLASSIFICATION_ATTRIBUTE}
                onUpdateClasses={testHandlers.onUpdateClasses}
                defaultCustomColor={DEFAULT_CUSTOM_COLOR[0]}
                defaultClassLabel={DEFAULT_CUSTOM_LABEL[0]}
                options={OPTIONS}
                layer={TEST_LAYER}
            />, document.getElementById("container"));
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        const classValueInput = colorClassMd.getElementsByTagName('input')[3];
        classValueInput.label = CLASSIFICATION[1].label;
        ReactTestUtils.Simulate.change(classValueInput);
        expect(spyonUpdate).toHaveBeenCalled();
        expect(spyonUpdate.calls[0].arguments[0][1].title).toBe(CLASSIFICATION[1].title);
    });
    it('Test Color Class Modal on confirm color classification', () => {
        const spyonSave = expect.spyOn(testHandlers, 'onSaveClassification');
        ReactDOM.render(
            <ColorClassModal
                show
                classification={CLASSIFICATION}
                classificationAttribute={CLASSIFICATION_ATTRIBUTE}
                onSaveClassification={testHandlers.onSaveClassification}
                defaultCustomColor={DEFAULT_CUSTOM_COLOR[0]}
                defaultClassLabel={DEFAULT_CUSTOM_LABEL[0]}
                options={OPTIONS}
                layer={TEST_LAYER}
            />, document.getElementById("container"));
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal')[0];
        const colorClassMdSaveButton = colorClassMd.getElementsByClassName('btn-save')[0];
        expect(colorClassMd).toExist();
        expect(colorClassMdSaveButton).toExist();
        ReactTestUtils.Simulate.click(colorClassMdSaveButton);
        expect(spyonSave).toHaveBeenCalled();
        const colorClassMdBody = document.getElementsByClassName('ms-modal-body')[0];
        expect(colorClassMdBody).toNotExist();
    });
});
