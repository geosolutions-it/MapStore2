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
import { CLASSIFICATION, CLASSIFICATION_ATTRIBUTE, DEFAULT_CUSTOM_COLOR, DEFAULT_CUSTOM_LABEL, OPTIONS } from './sample_data';

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
                defaultCustomColor={DEFAULT_CUSTOM_COLOR}
                defaultClassLabel={DEFAULT_CUSTOM_LABEL}
                options={OPTIONS}
            />, document.getElementById("container"));
        const colorClassMd = document.getElementsByClassName('ms-resizable-modal');
        expect(colorClassMd.length).toBe(1);
        // default color picker
        const defaultColorPicker = colorClassMd[0].getElementsByClassName('ms-color-picker')[0];
        expect(defaultColorPicker).toExist;
        const defaultColorPickerSwatch = defaultColorPicker.getElementsByClassName('ms-color-picker-swatch')[0];
        const defaultRgbColor = hexToRgb(DEFAULT_CUSTOM_COLOR);
        const defaultRgbBgColor = defaultColorPickerSwatch.style.backgroundColor
            .substring(4, defaultColorPickerSwatch.style.backgroundColor.length - 1)
            .split(',')
            .map(item => parseInt(item, 10));
        expect(defaultRgbBgColor[0]).toBe(defaultRgbColor[0]);
        expect(defaultRgbBgColor[1]).toBe(defaultRgbColor[1]);
        expect(defaultRgbBgColor[2]).toBe(defaultRgbColor[2]);
        // default label
        const defaultLabelTextEditor = colorClassMd[0].getElementsByClassName('form-control')[0];
        expect(defaultLabelTextEditor.value).toBe(DEFAULT_CUSTOM_LABEL);
        // classification attributes dropdown
        const classSelect = colorClassMd[0].getElementsByClassName('Select-control')[0];
        const selectedLabel = colorClassMd[0].getElementsByClassName('Select-value-label')[0].textContent;
        expect(selectedLabel).toBe(CLASSIFICATION_ATTRIBUTE);
        ReactTestUtils.Simulate.keyDown(classSelect, {keyCode: 40});
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
        const customValueTextBox = themaClassEditor.getElementsByClassName('form-control')[0];
        const customLabelTextBox = themaClassEditor.getElementsByClassName('form-control')[1];
        const customColorPicker = themaClassEditor.getElementsByClassName('ms-color-picker')[0];
        const customColorPickerSwatch = customColorPicker.getElementsByClassName('ms-color-picker-swatch')[0];
        const customRgbColor = hexToRgb(CLASSIFICATION[0].color);
        const customRgbBgColor = customColorPickerSwatch.style.backgroundColor
            .substring(4, customColorPickerSwatch.style.backgroundColor.length - 1)
            .split(',')
            .map(item => parseInt(item, 10));
        expect(customValueTextBox.value).toBe(CLASSIFICATION[0].value);
        expect(customLabelTextBox.value).toBe(CLASSIFICATION[0].title);
        expect(customRgbBgColor[0]).toBe(customRgbColor[0]);
        expect(customRgbBgColor[1]).toBe(customRgbColor[1]);
        expect(customRgbBgColor[2]).toBe(customRgbColor[2]);
    });
    it('Test Color Class Modal onChangeColor for default color', () => {
        // const actions = {
        //     onChangeColor: () => { }
        // };
        // const spyonChange = expect.spyOn(actions, 'onChangeColor');
        // ReactDOM.render(<ColorClassModal onChangeColor={actions.onChangeColor} defaultCustomColor={DEFAULT_CUSTOM_COLOR}/>, document.getElementById("container"));
    });
});
