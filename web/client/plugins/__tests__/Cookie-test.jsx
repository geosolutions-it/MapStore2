/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import { getPluginItems, getMorePrioritizedContainer } from '../../utils/PluginsUtils';
import Localized from '../../components/I18N/Localized';
import { SET_COOKIE_VISIBILITY, ADD_PRIVACY_ACCESS, REMOVE_PRIVACY_ACCESS } from '../../actions/cookie';
import { PRIVACY_ACCESS } from '../../components/cookie/constants';
import CookiePlugin from '../Cookie';

const plugins = {CookiePlugin: CookiePlugin.CookiePlugin};
const items = (container, pageContainers) =>
    getPluginItems({}, plugins, ['Cookie', ...pageContainers], container, null, true)
        .map(({ target }) => target);

const mockStore = configureMockStore();
const messages = {privacySettings: {settings: 'Privacy settings'}};
const { Footer, Login: [UserMenu, LoginWindow], MapFooter } = CookiePlugin.CookiePlugin;

describe('Cookie plugin', () => {
    let store;
    const render = (element, enabled = true, cookie = {}) => {
        store = mockStore({cookie, controls: {privacy: {defaults: {enabled, policyVersion: 'access', categories: []}}}});
        // Provider keeps its first store, so each render starts from an empty container
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        ReactTestUtils.act(() => {
            ReactDOM.render(<Provider store={store}><Localized locale="en-US" messages={messages}>
                {element}
            </Localized></Provider>, document.getElementById('container'));
        });
    };
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });
    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
    });
    it('gives access from the Footer first, then the user menu, then the MapFooter', () => {
        expect(items('Footer', ['Footer', 'Login', 'MapFooter'])).toEqual(['menu']);
        expect(items('Login', ['Footer', 'Login'])).toEqual(['login-footer']);
        expect(items('Login', ['Login', 'MapFooter'])).toEqual(['menu-end', 'login-footer']);
        expect(items('MapFooter', ['Login', 'MapFooter'])).toEqual([]);
        expect(items('MapFooter', ['MapFooter'])).toEqual(['left-footer']);
    });
    it('keeps the plugin root, which renders the privacy panel, on every page', () => {
        ['Footer', 'Login', 'MapFooter'].forEach(container => {
            const { plugin } = getMorePrioritizedContainer({ impl: plugins.CookiePlugin, config: {} }, {}, [container], 0);
            expect(plugin.impl.doNotHide).toBe(true);
        });
    });
    it('opens the privacy panel from every access', () => {
        const ItemComponent = ({onClick}) => <button id="menu-item" onClick={onClick}/>;
        [
            [<ul><Footer.Component/></ul>, 'ul > li > #privacy-settings'],
            [<UserMenu.Component itemComponent={ItemComponent}/>, '#menu-item'],
            [<LoginWindow.Component/>, '#privacy-settings-login'],
            [<MapFooter.Component/>, '#privacy-settings']
        ].forEach(([access, selector]) => {
            render(access);
            ReactTestUtils.Simulate.click(document.querySelector(selector));
            expect(store.getActions().slice(-1)).toEqual([{type: SET_COOKIE_VISIBILITY, status: true}]);
        });
    });
    it('records the access of a page container while it is shown', () => {
        const ItemComponent = () => <button id="menu-item"/>;
        [
            [<Footer.Component/>, PRIVACY_ACCESS.FOOTER],
            [<UserMenu.Component itemComponent={ItemComponent}/>, PRIVACY_ACCESS.USER_MENU],
            [<MapFooter.Component/>, PRIVACY_ACCESS.MAP_FOOTER]
        ].forEach(([access, id]) => {
            render(access);
            expect(store.getActions()).toEqual([{type: ADD_PRIVACY_ACCESS, id}]);
            ReactDOM.unmountComponentAtNode(document.getElementById('container'));
            expect(store.getActions()).toEqual([{type: ADD_PRIVACY_ACCESS, id}, {type: REMOVE_PRIVACY_ACCESS, id}]);
        });
    });
    it('does not record the login window, a user menu without items or a disabled access', () => {
        render(<><LoginWindow.Component/><UserMenu.Component/></>);
        expect(store.getActions()).toEqual([]);
        render(<><Footer.Component/><MapFooter.Component/></>, false);
        expect(store.getActions()).toEqual([]);
    });
    it('hides the floating button while a page container shows the access', () => {
        const Root = plugins.CookiePlugin;
        render(<Root/>);
        expect(document.querySelectorAll('.mapstore-privacy-access #privacy-settings').length).toBe(1);
        render(<Root/>, true, {privacyAccesses: [PRIVACY_ACCESS.FOOTER]});
        expect(document.querySelector('.mapstore-privacy-access')).toNotExist();
    });
    it('shows no access when privacy is disabled', () => {
        const ItemComponent = () => <button id="menu-item"/>;
        render(<><Footer.Component/><UserMenu.Component itemComponent={ItemComponent}/><LoginWindow.Component/><MapFooter.Component/></>, false);
        expect(document.querySelectorAll('#container button').length).toBe(0);
    });
});
