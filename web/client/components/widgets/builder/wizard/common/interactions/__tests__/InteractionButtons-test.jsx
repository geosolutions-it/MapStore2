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
        // By default, no inline buttons and isConfigurable are false, so only the plug button is rendered.
        expect(buttons.length).toBe(1);
    });

    it('renders inline configuration buttons when visible (e.g. autoZoom for applyZoomTo when plugged)', () => {
        ReactDOM.render(
            <InteractionButtons
                plugged
                context={{ targetType: 'applyZoomTo' }}
                configuration={{ autoZoom: true }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        // plug button + auto zoom button
        expect(buttons.length).toBe(2);
        // The first button should be the auto zoom button
        expect(buttons[0].textContent.includes('widgets.filterWidget.autoZoomLabel') || buttons[0].querySelector('span')).toExist();
    });

    it('does not render autoZoom button when plugged is false', () => {
        ReactDOM.render(
            <InteractionButtons
                plugged={false}
                context={{ targetType: 'applyZoomTo' }}
                configuration={{ autoZoom: true }}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        // only plug button
        expect(buttons.length).toBe(1);
    });

    it('triggers setConfiguration when inline configuration button is clicked', () => {
        const actions = {
            setConfiguration: () => {}
        };
        const spy = expect.spyOn(actions, 'setConfiguration');
        ReactDOM.render(
            <InteractionButtons
                plugged
                context={{ targetType: 'applyZoomTo' }}
                configuration={{ autoZoom: false }}
                setConfiguration={actions.setConfiguration}
            />, document.getElementById("container"));
        const container = document.getElementById('container');
        const buttons = container.querySelectorAll('button');
        ReactTestUtils.Simulate.click(buttons[0]);
        expect(spy).toHaveBeenCalled();
        expect(spy.calls[0].arguments[0]).toEqual({ autoZoom: true });
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
