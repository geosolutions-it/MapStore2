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

import {GeoStorySave, GeoStorySaveAs} from '../GeoStorySave';
import { getPluginForTest } from './pluginsTestUtils';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';

import geostory from '../../reducers/geostory';

import { setControl } from '../../actions/geostory';
import { Controls } from '../../utils/GeoStoryUtils';

describe('GeoStorySave Plugins (GeoStorySave, GeoStorySaveAs)', () => {
    const stateMocker = createStateMocker({ geostory });
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    describe('GeoStorySave', () => {
        const DUMMY_ACTION = { type: "DUMMY_ACTION" };
        it('hidden by default, visibility of the button', () => {
            const { Plugin, containers } = getPluginForTest(GeoStorySave, stateMocker(DUMMY_ACTION), {
                BurgerMenuPlugin: {}
            });
            // check container for burger menu
            expect(Object.keys(containers)).toContain('BurgerMenu');
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(0);
            // check log-in logout properties selector for button in burger menu
            // hide when not logged in
            expect(containers.BurgerMenu.selector({ security: {} }).style.display).toBe("none");
            // show when logged in
            expect(containers.BurgerMenu.selector({security: {user: {}}}).style.display).toNotExist();
            // hide if you don't have permissions
            expect(containers.BurgerMenu.selector({ security: { user: {} }, geostory: { resource: { id: 1234, canEdit: false } } }).style.display ).toBe("none");
        });
        it('show when control is set to "save"', () => {
            const { Plugin } = getPluginForTest(GeoStorySave, stateMocker(DUMMY_ACTION, setControl(Controls.SHOW_SAVE, "save")));
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(1);
        });
        it('title is editable when no resource provided', () => {
            const { Plugin } = getPluginForTest(GeoStorySave, stateMocker(DUMMY_ACTION, setControl(Controls.SHOW_SAVE, "save")));
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
    describe('GeoStorySaveAs', () => {
        const DUMMY_ACTION = { type: "DUMMY_ACTION" };
        it('hidden by default, visibility of the button', () => {
            const { Plugin, containers } = getPluginForTest(GeoStorySaveAs, stateMocker(DUMMY_ACTION), {
                BurgerMenuPlugin: {}
            });
            // check container for burger menu
            expect(Object.keys(containers)).toContain('BurgerMenu');
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(0);
            // check log-in logout properties selector for button in burger menu
            // hide when not logged in
            expect(containers.BurgerMenu.selector({ security: {} }).style.display).toBe("none");
            // hide when logged in if resource is not set
            expect(containers.BurgerMenu.selector({ security: { user: {} } }).style.display).toBe("none");
            // show if resource is available for clone
            expect(containers.BurgerMenu.selector({
                security: { user: {} },
                geostory: { resource: { id: 1234, canEdit: false } }
            }).style.display).toNotExist();
        });
        it('show when control is set to "saveAs"', () => {
            const { Plugin } = getPluginForTest(GeoStorySaveAs, stateMocker(DUMMY_ACTION, setControl(Controls.SHOW_SAVE, "saveAs")));
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(1);
        });
        it('title is editable', () => {
            const { Plugin } = getPluginForTest(GeoStorySaveAs, stateMocker(DUMMY_ACTION, setControl(Controls.SHOW_SAVE, "saveAs")));
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
