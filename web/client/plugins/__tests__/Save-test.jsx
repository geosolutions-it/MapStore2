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

import MapSave from '../Save';
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
    describe('MapSave', () => {
        const DUMMY_ACTION = { type: "DUMMY_ACTION" };
        it('hidden by default, visibility of the button', () => {
            const { Plugin, containers } = getPluginForTest(MapSave, stateMocker(DUMMY_ACTION), {
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
            expect(containers.BurgerMenu.selector({security: {user: {}}, map: { info: { id: 1234, canEdit: true } }}).style.display).toNotExist();
            // hide if you don't have permissions
            expect(containers.BurgerMenu.selector({ security: { user: {} }, map: { info: { id: 1234, canEdit: false } } }).style.display ).toBe("none");
        });
        it('show when control is set to "save"', () => {
            const storeState = stateMocker(DUMMY_ACTION, toggleControl('mapSave', 'enabled'));
            const { Plugin } = getPluginForTest(MapSave, storeState);
            ReactDOM.render(<Plugin />, document.getElementById("container"));
            expect(document.querySelector('.modal-fixed')).toBeTruthy();
            // permission table present by default
            expect(document.querySelector('.permissions-table')).toBeTruthy();
        });
        describe('integrations', () => {
            it('disablePermission options hides the permission (compatibility with system that do not use GeoStore)', () => {
                const storeState = stateMocker(DUMMY_ACTION, toggleControl('mapSave', 'enabled'));
                const { Plugin } = getPluginForTest(MapSave, storeState);
                ReactDOM.render(<Plugin disablePermission />, document.getElementById("container"));
                expect(document.querySelector('.modal-fixed')).toBeTruthy();
                expect(document.querySelector('.permissions-table')).toBeFalsy();
                ReactDOM.render(<Plugin />, document.getElementById("container"));
                expect(document.querySelector('.modal-fixed')).toBeTruthy();
                expect(document.querySelector('.permissions-table')).toBeTruthy();
            });
        });
    });

});
