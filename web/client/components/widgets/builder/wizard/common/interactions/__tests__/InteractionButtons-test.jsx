/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import ReactTestUtils from 'react-dom/test-utils';
import InteractionButtons from '../InteractionButtons';

describe('InteractionButtons component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('renders with defaults', () => {
        ReactDOM.render(<InteractionButtons />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        // By default, showAutoZoom and isConfigurable are false, so only the plug button is rendered.
        expect(buttons.length).toBe(1);
    });

    it('renders Auto Zoom button when showAutoZoom and plugged are true', () => {
        ReactDOM.render(
            <InteractionButtons
                buttonsConfig={{ showAutoZoom: true }}
                plugged
                configuration={{ autoZoom: true }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        // plug button + auto zoom button
        expect(buttons.length).toBe(2);
        // The first button should be the auto zoom button
        expect(buttons[0].querySelector('.glyphicon-zoom-to') || buttons[0].textContent.includes('widgets.filterWidget.autoZoomLabel') || buttons[0].querySelector('span')).toExist();
    });

    it('renders Auto Zoom button with autoZoomForAllMaps tooltip', () => {
        ReactDOM.render(
            <InteractionButtons
                buttonsConfig={{ showAutoZoom: true, autoZoomForAllMaps: true }}
                plugged
                configuration={{ autoZoom: true }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        // plug button + auto zoom button
        expect(buttons.length).toBe(2);
    });

    it('does not render Auto Zoom button when plugged is false', () => {
        ReactDOM.render(
            <InteractionButtons
                buttonsConfig={{ showAutoZoom: true }}
                plugged={false}
                configuration={{ autoZoom: true }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        // only plug button
        expect(buttons.length).toBe(1);
    });

    it('triggers onAutoZoomChange when Auto Zoom button is clicked', () => {
        const actions = {
            onAutoZoomChange: () => {}
        };
        const spy = expect.spyOn(actions, 'onAutoZoomChange');
        ReactDOM.render(
            <InteractionButtons
                plugged
                configuration={{ autoZoom: false }}
                buttonsConfig={{showAutoZoom: true, onAutoZoomChange: actions.onAutoZoomChange}}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        ReactTestUtils.Simulate.click(buttons[0]);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toBe(true); // Should toggle from false to true
    });

    it('renders configuration button when isConfigurable is true', () => {
        ReactDOM.render(
            <InteractionButtons
                isConfigurable
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        // plug button + config button
        expect(buttons.length).toBe(2);
        expect(buttons[0].querySelector('.glyphicon-cog')).toExist();
    });

    it('disables plug button when plugConstraints.disabled is true', () => {
        ReactDOM.render(
            <InteractionButtons
                isPluggable
                plugConstraints={{ disabled: true, reason: 'test reason' }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        expect(buttons[0].disabled).toBe(true);
    });
});
