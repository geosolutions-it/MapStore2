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

import  MapSaveAs from '../SaveAs';
import { getPluginForTest } from './pluginsTestUtils';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';

import controlsReducer from '../../reducers/controls';

import {toggleControl} from '../../actions/controls';


describe('MapSave Plugins (MapSave, MapSaveAs)', () => {
    const stateMocker = createStateMocker({ controls: controlsReducer });
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    const DUMMY_ACTION = { type: "DUMMY_ACTION" };
    describe('MapSaveAs', () => {
        it('hidden by default, visibility of the button', () => {
            const { Plugin, containers } = getPluginForTest(MapSaveAs, stateMocker(DUMMY_ACTION), {
                BurgerMenuPlugin: {}
            });
            // check container for burger menu
            expect(Object.keys(containers)).toContain('BurgerMenu');
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(0);
            // check log-in logout properties selector for button in burger menu
            // hide when not logged in
            expect(containers.BurgerMenu.selector({ security: {} }).style.display).toBe("none");
            // show when logged In
            expect(containers.BurgerMenu.selector({ security: { user: {} } }).style.display).toNotExist();
            // show if resource is available for clone
            expect(containers.BurgerMenu.selector({
                security: { user: {} },
                map: { info: { id: 1234, canEdit: false } }
            }).style.display).toNotExist();
        });
        it('show when control is set to "saveAs"', () => {
            const storeState = stateMocker(DUMMY_ACTION, toggleControl('mapSaveAs', 'enabled'));
            const { Plugin } = getPluginForTest(MapSaveAs, storeState);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.getElementsByClassName('modal-fixed').length).toBe(1);
        });
        describe('integrations', () => {
            it('disablePermission options hides the permission (compatibility with system that do not use GeoStore)', () => {
                const storeState = stateMocker(DUMMY_ACTION, toggleControl('mapSaveAs', 'enabled'));
                const { Plugin } = getPluginForTest(MapSaveAs, storeState);
                ReactDOM.render(<Plugin disablePermission />, document.getElementById("container"));
                expect(document.querySelector('.modal-fixed')).toBeTruthy();
                expect(document.querySelector('.permissions-table')).toBeFalsy();
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(document.querySelector('.modal-fixed')).toBeTruthy();
                expect(document.querySelector('.permissions-table')).toBeTruthy();
            });
        });
        it('title is editable', () => {
            const storeState = stateMocker(DUMMY_ACTION, toggleControl('mapSaveAs', 'enabled'));
            const { Plugin } = getPluginForTest(MapSaveAs, storeState);
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
