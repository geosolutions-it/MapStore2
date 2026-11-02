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
import expect from 'expect';
import PrivacyAccessButton, { MapFooterPrivacyAccessButton, UserMenuPrivacyAccessItem } from '../PrivacyAccessButton';
import { PRIVACY_GLYPH } from '../constants';
import Localized from '../../I18N/Localized';

const messages = {privacySettings: {settings: 'Privacy settings'}};

describe('PrivacyAccessButton', () => {
    const render = element => ReactTestUtils.act(() => {
        ReactDOM.render(<Localized locale="en-US" messages={messages}>{element}</Localized>, document.getElementById('container'));
    });
    // the user menu passes its own item component
    const ItemComponent = ({glyph, msgId, onClick}) => <button id="menu-item" data-glyph={glyph} data-msgid={msgId} onClick={onClick}/>;
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });
    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
    });
    it('shows a button with icon and label that opens the privacy panel', () => {
        const onOpen = expect.createSpy();
        render(<PrivacyAccessButton enabled id="privacy-settings-login" onOpen={onOpen}/>);
        const button = document.querySelector('#privacy-settings-login');
        expect(button.getAttribute('aria-label')).toBe('Privacy settings');
        expect(button.textContent).toBe(' Privacy settings');
        expect(button.querySelectorAll(`.glyphicon-${PRIVACY_GLYPH}`).length).toBe(1);
        ReactTestUtils.Simulate.click(button);
        expect(onOpen.calls.length).toBe(1);
    });
    it('adds an entry to the user menu that opens the privacy panel', () => {
        const onOpen = expect.createSpy();
        render(<UserMenuPrivacyAccessItem enabled onOpen={onOpen} itemComponent={ItemComponent}/>);
        const item = document.querySelector('#menu-item');
        expect(item.getAttribute('data-glyph')).toBe(PRIVACY_GLYPH);
        expect(item.getAttribute('data-msgid')).toBe('privacySettings.settings');
        ReactTestUtils.Simulate.click(item);
        expect(onOpen.calls.length).toBe(1);
    });
    it('shows an icon in the map footer', () => {
        const onOpen = expect.createSpy();
        render(<MapFooterPrivacyAccessButton enabled onOpen={onOpen}/>);
        const button = document.querySelector('#privacy-settings');
        expect(button.getAttribute('aria-label')).toBe('Privacy settings');
        expect(button.textContent).toBe('');
        expect(button.querySelectorAll(`.glyphicon-${PRIVACY_GLYPH}`).length).toBe(1);
        ReactTestUtils.Simulate.click(button);
        expect(onOpen.calls.length).toBe(1);
    });
    it('renders nothing when privacy is disabled', () => {
        render(<><PrivacyAccessButton/><MapFooterPrivacyAccessButton/><UserMenuPrivacyAccessItem itemComponent={ItemComponent}/></>);
        expect(document.getElementById('container').innerHTML).toBe('');
    });
    it('shows no user menu entry without the item component of the menu', () => {
        render(<UserMenuPrivacyAccessItem enabled/>);
        expect(document.getElementById('container').innerHTML).toBe('');
    });
});
