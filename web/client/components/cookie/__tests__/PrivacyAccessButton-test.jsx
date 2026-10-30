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
import { FooterPrivacyAccess, MapFooterPrivacyAccess, LoginPrivacyAccess, UserMenuPrivacyAccess, useInjectedAccess } from '../PrivacyAccessButton';
import Localized from '../../I18N/Localized';
import { SET_COOKIE_VISIBILITY } from '../../../actions/cookie';

const mockStore = configureMockStore();
const messages = {privacySettings: {settings: 'Privacy settings'}};

describe('PrivacyAccessButton', () => {
    let store;
    const render = (element, enabled = true) => {
        store = mockStore({controls: {privacy: {defaults: {enabled, policyVersion: 'access', categories: []}}}});
        ReactTestUtils.act(() => {
            ReactDOM.render(<Provider store={store}><Localized locale="en-US" messages={messages}>
                {element}
            </Localized></Provider>, document.getElementById('container'));
        });
    };
    // the user menu passes its own item component
    const ItemComponent = ({glyph, msgId, onClick}) => <button id="menu-item" data-glyph={glyph} data-msgid={msgId} onClick={onClick}/>;
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });
    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
    });
    it('adds an entry to the user menu that opens the privacy panel', () => {
        render(<UserMenuPrivacyAccess itemComponent={ItemComponent}/>);
        const item = document.querySelector('#menu-item');
        expect(item.getAttribute('data-glyph')).toBe('user-shield');
        expect(item.getAttribute('data-msgid')).toBe('privacySettings.settings');
        ReactTestUtils.Simulate.click(item);
        expect(store.getActions()).toEqual([{type: SET_COOKIE_VISIBILITY, status: true}]);
    });
    it('shows an icon in the map footer', () => {
        render(<MapFooterPrivacyAccess/>);
        const button = document.querySelector('#privacy-settings');
        expect(button.getAttribute('aria-label')).toBe('Privacy settings');
        expect(button.textContent).toBe('');
        expect(button.querySelectorAll('.glyphicon-user-shield').length).toBe(1);
        ReactTestUtils.Simulate.click(button);
        expect(store.getActions()).toEqual([{type: SET_COOKIE_VISIBILITY, status: true}]);
    });
    it('shows the button of the login window', () => {
        render(<LoginPrivacyAccess/>);
        expect(document.querySelectorAll('#privacy-settings-login .glyphicon-user-shield').length).toBe(1);
    });
    it('tells when an access is injected in the page, the login window excluded', () => {
        const Probe = () => <span id="probe">{`${useInjectedAccess()}`}</span>;
        const probe = () => document.querySelector('#probe').textContent;
        render(<><Probe/><LoginPrivacyAccess/></>);
        expect(probe()).toBe('false');
        [<ul><FooterPrivacyAccess/></ul>, <MapFooterPrivacyAccess/>, <UserMenuPrivacyAccess itemComponent={ItemComponent}/>].forEach(access => {
            render(<><Probe/>{access}</>);
            expect(probe()).toBe('true');
            render(<Probe/>);
            expect(probe()).toBe('false');
        });
    });
    it('renders nothing when privacy is disabled', () => {
        render(<><MapFooterPrivacyAccess/><LoginPrivacyAccess/><UserMenuPrivacyAccess itemComponent={ItemComponent}/></>, false);
        expect(document.getElementById('container').innerHTML).toBe('');
    });
});
