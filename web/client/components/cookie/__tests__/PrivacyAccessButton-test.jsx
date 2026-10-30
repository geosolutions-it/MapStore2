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
import { BrandNavbarPrivacyAccess } from '../PrivacyAccessButton';
import Localized from '../../I18N/Localized';
import { SET_COOKIE_VISIBILITY } from '../../../actions/cookie';

const mockStore = configureMockStore();
const messages = {privacySettings: {settings: 'Privacy settings'}};

describe('PrivacyAccessButton', () => {
    let store;
    const render = (enabled = true) => {
        store = mockStore({controls: {privacy: {defaults: {enabled, policyVersion: 'navbar', categories: []}}}});
        ReactTestUtils.act(() => {
            ReactDOM.render(<Provider store={store}><Localized locale="en-US" messages={messages}>
                <ul><BrandNavbarPrivacyAccess/></ul>
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
    it('shows an icon button in the navbar that opens the privacy panel', () => {
        render();
        const button = document.querySelector('li #privacy-settings');
        expect(button.getAttribute('aria-label')).toBe('Privacy settings');
        expect(button.textContent).toBe('');
        ReactTestUtils.Simulate.click(button);
        expect(store.getActions()).toEqual([{type: SET_COOKIE_VISIBILITY, status: true}]);
    });
    it('leaves the button to the footer when the page has one', () => {
        document.body.insertAdjacentHTML('beforeend', '<div id="mapstore-map-footer"></div>');
        render();
        expect(document.querySelector('#privacy-settings')).toNotExist();
    });
    it('renders nothing when privacy is disabled', () => {
        render(false);
        expect(document.querySelector('#privacy-settings')).toNotExist();
    });
});
