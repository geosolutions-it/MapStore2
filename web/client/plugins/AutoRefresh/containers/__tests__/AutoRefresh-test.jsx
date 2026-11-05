/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { act } from 'react-dom/test-utils';
import expect from 'expect';
import AutoRefreshContainer from '../AutoRefresh';
import { AutoRefresh } from '../../AutoRefresh';

describe('AutoRefresh controls', () => {
    let container;
    beforeEach(() => { container = document.createElement('div'); document.body.appendChild(container); });
    afterEach(() => { act(() => ReactDOM.unmountComponentAtNode(container)); document.body.removeChild(container); });
    it('uses resource publishing permission, independently of the account role', () => {
        ReactDOM.render(<AutoRefreshContainer canConfigure/>, container);
        expect(container.querySelector('#ms-autorefresh-selector')).toBeTruthy();
        ReactDOM.render(<AutoRefreshContainer canConfigure={false}/>, container);
        expect(container.querySelector('#ms-autorefresh-selector')).toBe(null);
        expect(container.querySelector('.ms-autorefresh-informations')).toBeTruthy();
    });
    it('can request a manual refresh without enabling timers', () => {
        const onRefreshNow = expect.createSpy();
        const onStart = expect.createSpy();
        ReactDOM.render(<AutoRefreshContainer eligibleCount={1} onRefreshNow={onRefreshNow} onStart={onStart}/>, container);
        TestUtils.Simulate.click(container.querySelector('.ms-autorefresh-button'));
        expect(onRefreshNow).toHaveBeenCalled();
        expect(onStart).toNotHaveBeenCalled();
    });
    it('shows a timestamp and editing pause status', () => {
        ReactDOM.render(<AutoRefreshContainer lastRefresh={123} paused/>, container);
        expect(container.querySelector('time').getAttribute('datetime')).toBe(new Date(123).toISOString());
        expect(container.querySelector('[role="status"]')).toBeTruthy();
        expect(container.querySelector('.ms-autorefresh-button').disabled).toBe(true);
    });
    it('renders a dashboard sidebar control with inline publisher settings', () => {
        ReactDOM.render(<AutoRefreshContainer sidebar canConfigure/>, container);
        expect(container.querySelector('#ms-autorefresh-dashboard')).toBeTruthy();
        expect(container.querySelector('.ms-autorefresh-form-container')).toBeTruthy();
    });
    it('initializes a validated minimum, clamps defaults and stops on teardown', () => {
        const onInit = expect.createSpy();
        const onStop = expect.createSpy();
        act(() => ReactDOM.render(<AutoRefresh onInit={onInit} onStop={onStop} canConfigure minimumRefreshInterval={60000} defaultRefreshInterval={1000}/>, container));
        expect(onInit).toHaveBeenCalledWith(60000);
        act(() => ReactDOM.unmountComponentAtNode(container));
        expect(onStop).toHaveBeenCalled();
    });
});
