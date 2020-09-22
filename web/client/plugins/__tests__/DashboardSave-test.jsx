/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

import {DashboardSave, DashboardSaveAs} from '../DashboardSave';
import { getPluginForTest } from './pluginsTestUtils';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';

import dashboard from '../../reducers/dashboard';

import { triggerSave, triggerSaveAs } from '../../actions/dashboard';

describe('DashboardSave Plugins (DashboardSave, DashboardSaveAs)', () => {
    const stateMocker = createStateMocker({ dashboard });
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    describe('DashboardSave', () => {
        const DUMMY_ACTION = { type: "DUMMY_ACTION" };
        it('hidden by default, visibility of the button', () => {
            const { Plugin, containers } = getPluginForTest(DashboardSave, stateMocker(DUMMY_ACTION), {
                BurgerMenuPlugin: {}
            });
            // check container for burger menu
            expect(Object.keys(containers)).toContain('BurgerMenu');
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(0);
            // check log-in logout properties selector for button in burger menu
            // hide when not logged in
            expect(containers.BurgerMenu.selector({ security: {} }).style.display).toBe("none");
            // hide when logged in but without resource selected
            expect(containers.BurgerMenu.selector({security: {user: {}}}).style.display).toBe("none");
            // hide if you don't have permissions
            expect(containers.BurgerMenu.selector({ security: { user: {} }, dashboard: { resource: { id: 1234, canEdit: false } } }).style.display ).toBe("none");
        });
        it('show when control is set to "save"', () => {
            const storeState = stateMocker(DUMMY_ACTION, triggerSave(true));
            const { Plugin } = getPluginForTest(DashboardSave, storeState);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(1);
        });
    });
    describe('DashboardSaveAs', () => {
        const DUMMY_ACTION = { type: "DUMMY_ACTION" };
        it('hidden by default, visibility of the button', () => {
            const { Plugin, containers } = getPluginForTest(DashboardSaveAs, stateMocker(DUMMY_ACTION), {
                BurgerMenuPlugin: {}
            });
            // check container for burger menu
            expect(Object.keys(containers)).toContain('BurgerMenu');
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(0);
            // check log-in logout properties selector for button in burger menu
            // hide when not logged in
            expect(containers.BurgerMenu.selector({ security: {} }).style.display).toBe("none");
            // always show when user logged in
            expect(containers.BurgerMenu.selector({ security: { user: {} } }).style.display).toNotExist();
            // show if resource is available for clone
            expect(containers.BurgerMenu.selector({
                security: { user: {} },
                geostory: { resource: { id: 1234, canEdit: false } }
            }).style.display).toNotExist();
        });
        it('show when control is set to "saveAs"', () => {
            const { Plugin } = getPluginForTest(DashboardSaveAs, stateMocker(DUMMY_ACTION, triggerSaveAs(true)));
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(1);
        });
        it('title is editable', () => {
            const { Plugin } = getPluginForTest(DashboardSaveAs, stateMocker(DUMMY_ACTION, triggerSaveAs(true)));
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            const modal = document.getElementsByClassName('modal-fixed')[0];
            expect(modal).toExist();
            const inputEl = modal.getElementsByTagName('input')[1];
            expect(inputEl).toExist();
            inputEl.value = 'f';
            TestUtils.Simulate.change(inputEl);
            expect(inputEl.value).toBe('f');
        });
    });
});
