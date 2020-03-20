/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import expect from 'expect';
import CustomThemePicker from '../CustomThemePicker';

describe('CustomThemePicker component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with defaults', () => {
        ReactDOM.render(<CustomThemePicker />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.ms-custom-theme-picker-field');
        expect(el.length).toBe(3);
    });
    it('should disable text and shadow fields', () => {
        ReactDOM.render(<CustomThemePicker disableTextColor disableShadow />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.ms-custom-theme-picker-field');
        expect(el.length).toBe(1);
        const label = el[0].querySelector('div > span');
        expect(label.innerHTML).toBe('geostory.customizeTheme.backgroundColorLabel');
    });
    it('should change background color', (done) => {
        const BACKGROUND_COLOR = '#000000';
        ReactDOM.render(
            <CustomThemePicker
                onChange={(theme) => {
                    expect(theme.backgroundColor).toBe('rgb(0, 0, 0)');
                    expect(theme.borderColor).toBe('#262626');
                    expect(theme.color).toBe('#ffffff');
                    done();
                }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.ms-custom-theme-picker-field');
        const fieldNode = el[0];
        const swatchNode = fieldNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        ReactTestUtils.Simulate.click(swatchNode);
        const sketchPickerNode = document.querySelector('.sketch-picker');
        expect(sketchPickerNode).toBeTruthy();
        const [sketchPickerHexInputNode] = sketchPickerNode.querySelectorAll('input');
        ReactTestUtils.Simulate.change(sketchPickerHexInputNode, { target: { value: BACKGROUND_COLOR } });
        const coverNode = document.querySelector('.ms-color-picker-cover');
        ReactTestUtils.Simulate.click(coverNode);
    });
    it('should change text color', (done) => {
        const COLOR = '#000000';
        ReactDOM.render(
            <CustomThemePicker
                onChange={(theme) => {
                    expect(theme.backgroundColor).toBe(undefined);
                    expect(theme.borderColor).toBe(undefined);
                    expect(theme.color).toBe(COLOR);
                    done();
                }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.ms-custom-theme-picker-field');
        const fieldNode = el[1];
        const swatchNode = fieldNode.querySelector('.ms-color-picker-swatch');
        expect(swatchNode).toBeTruthy();
        ReactTestUtils.Simulate.click(swatchNode);
        const sketchPickerNode = document.querySelector('.sketch-picker');
        expect(sketchPickerNode).toBeTruthy();
        const [sketchPickerHexInputNode] = sketchPickerNode.querySelectorAll('input');
        ReactTestUtils.Simulate.change(sketchPickerHexInputNode, { target: { value: COLOR } });
        const coverNode = document.querySelector('.ms-color-picker-cover');
        ReactTestUtils.Simulate.click(coverNode);
    });
    it('should change shadow', (done) => {
        ReactDOM.render(
            <CustomThemePicker
                onChange={(theme) => {
                    expect(theme.backgroundColor).toBe(undefined);
                    expect(theme.borderColor).toBe(undefined);
                    expect(theme.color).toBe(undefined);
                    expect(theme.boxShadow).toBe('0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)');
                    done();
                }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelectorAll('.ms-custom-theme-picker-field');
        const fieldNode = el[2];
        const switchSliderNode = fieldNode.querySelector('.mapstore-switch-btn input');
        ReactTestUtils.Simulate.change(switchSliderNode);
    });
});
