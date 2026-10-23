/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import ReactDOM from 'react-dom';
import Cookie from '../Cookie';
import expect from 'expect';
import { setApi, getApi, getItemKey, addApi } from '../../../api/userPersistedStorage';
import ReactTestUtils from 'react-dom/test-utils';
import { privacyNoticeKey } from '../../../utils/CookieNoticeUtils';
import { privacyChoiceKey, makePrivacyChoice } from '../../../utils/PrivacyChoices';
import { consentManager } from '../../../utils/ConsentManager';
import Localized from '../../I18N/Localized';

const messages = {privacySettings: {unused: 'Not used', cookie: 'Cookie Policy', privacy: 'Privacy Policy', terms: 'Terms of Use'}};
const renderLocalized = (element, locale = 'en-US') => ReactDOM.render(
    <Localized locale={locale} messages={messages}>{element}</Localized>, document.getElementById('container'));

describe('Test for Cookie component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    // test DEFAULTS
    it('render with defaults', () => {
        const cmp = ReactDOM.render(<Cookie/>, document.getElementById("container"));
        expect(cmp).toExist();
        expect(document.body.querySelector('.mapstore-cookie-panel')).toNotExist();
    });

    it('render with show = true', () => {
        const cmp = ReactDOM.render(<Cookie show externalCookieUrl=""/>, document.getElementById("container"));
        expect(cmp).toExist();
        const panel = document.body.querySelector('.mapstore-cookie-panel');
        expect(panel).toExist();
        expect(panel.classList.contains('not-see-more')).toBe(true);
    });

    it('renders cookie panel into document.body via portal', () => {
        ReactDOM.render(<Cookie show/>, document.getElementById("container"));
        const panel = document.body.querySelector('.mapstore-cookie-panel');
        expect(panel).toExist();
        expect(panel.parentNode).toBe(document.body);
    });

    it('requests the notice on first mount without waiting for a route change', () => {
        setApi('memoryStorage');
        const key = getItemKey('cookie', 'approved');
        getApi().removeItem(key);
        getApi().removeItem('cookies-policy-approved');
        const onSetCookieVisibility = expect.createSpy();
        ReactDOM.render(<Cookie onSetCookieVisibility={onSetCookieVisibility}/>, document.getElementById('container'));
        expect(onSetCookieVisibility).toHaveBeenCalledWith(true);
        setApi('localStorage');
    });

    it('does not reopen an acknowledged notice on mount', () => {
        setApi('memoryStorage');
        const key = getItemKey('cookie', 'approved');
        getApi().setItem(key, 'true');
        const onSetCookieVisibility = expect.createSpy();
        ReactDOM.render(<Cookie onSetCookieVisibility={onSetCookieVisibility}/>, document.getElementById('container'));
        expect(onSetCookieVisibility).toNotHaveBeenCalled();
        getApi().removeItem(key);
        setApi('localStorage');
    });

    it('shows necessary tools and unused categories without requesting fictitious consent', () => {
        renderLocalized(<Cookie privacy={{enabled: true, categories: []}} locale="en-US" show/>);
        expect(document.querySelector('#privacy-accept')).toNotExist();
        expect(document.querySelectorAll('input[type=checkbox]').length).toBe(0);
        expect(document.querySelector('.mapstore-privacy-panel').textContent).toInclude('Not used');
    });
    it('opens necessary-only information on entry and records only dismissal on close', () => {
        const privacy = {enabled: true, policyVersion: 'first-visit', categories: []};
        getApi().removeItem(privacyNoticeKey());
        getApi().removeItem(privacyChoiceKey());
        const visibility = expect.createSpy();
        ReactDOM.render(<Cookie privacy={privacy} onSetCookieVisibility={visibility}/>, document.getElementById('container'));
        expect(visibility).toHaveBeenCalledWith(true);
        ReactTestUtils.act(() => { ReactDOM.render(<Cookie privacy={privacy} show onSetCookieVisibility={visibility}/>, document.getElementById('container')); });
        ReactTestUtils.Simulate.click(document.querySelector('#privacy-close'));
        expect(JSON.parse(getApi().getItem(privacyNoticeKey())).policyVersion).toBe('first-visit');
        expect(getApi().getItem(privacyChoiceKey())).toNotExist();
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        const revisit = expect.createSpy();
        ReactDOM.render(<Cookie privacy={privacy} onSetCookieVisibility={revisit}/>, document.getElementById('container'));
        expect(revisit).toNotHaveBeenCalled();
        getApi().removeItem(privacyNoticeKey());
    });
    it('keeps optional categories unselected, saves a granular choice and permits refusal', () => {
        const privacy = {enabled: true, policyVersion: 'test', categories: [{id: 'functional'}, {id: 'statistics'}]};
        const onPrivacyChoice = expect.createSpy();
        ReactTestUtils.act(() => { ReactDOM.render(<Cookie privacy={privacy} locale="en-US" show onPrivacyChoice={onPrivacyChoice}/>, document.getElementById('container')); });
        ReactTestUtils.Simulate.click(document.querySelector('#privacy-customize'));
        const inputs = document.querySelectorAll('input[type=checkbox]');
        expect(inputs.length).toBe(2);
        expect(inputs[0].checked).toBe(false);
        expect(inputs[1].checked).toBe(false);
        ReactTestUtils.Simulate.change(inputs[0], {target: {checked: true}});
        ReactTestUtils.Simulate.click(document.querySelector('#privacy-save'));
        const choice = JSON.parse(getApi().getItem(getItemKey('privacy', 'choices')));
        expect(choice.categories).toEqual({functional: true, statistics: false});
        ReactTestUtils.Simulate.click(document.querySelector('#privacy-reject'));
        expect(JSON.parse(getApi().getItem(getItemKey('privacy', 'choices'))).categories).toEqual({functional: false, statistics: false});
        getApi().removeItem(getItemKey('privacy', 'choices'));
    });
    it('treats closing a first optional notice as refusal, so reload does not nag', () => {
        const privacy = {enabled: true, policyVersion: 'close', categories: [{id: 'functional'}]};
        ReactTestUtils.act(() => { ReactDOM.render(<Cookie privacy={privacy} locale="en-US" show/>, document.getElementById('container')); });
        ReactTestUtils.Simulate.click(document.querySelector('#privacy-close'));
        expect(JSON.parse(getApi().getItem(getItemKey('privacy', 'choices'))).categories).toEqual({functional: false});
        getApi().removeItem(getItemKey('privacy', 'choices'));
    });
    it('fails closed when saving consent fails', () => {
        setApi('memoryStorage');
        getApi().setAccessDenied(true);
        const onPrivacyChoice = expect.createSpy();
        ReactDOM.render(<Cookie privacy={{enabled: true, policyVersion: 'storage', categories: [{id: 'functional'}]}}
            show locale="en-US" onPrivacyChoice={onPrivacyChoice}/>, document.getElementById('container'));
        ReactTestUtils.Simulate.click(document.querySelector('#privacy-accept'));
        expect(onPrivacyChoice).toHaveBeenCalledWith(null);
        expect(document.querySelector('[role=alert]')).toExist();
        getApi().setAccessDenied(false);
        setApi('localStorage');
    });
    it('keeps a refusal in force when it cannot be saved over an older consent', () => {
        const privacy = {enabled: true, policyVersion: 'read-only', categories: [{id: 'functional'}]};
        const stored = {[privacyChoiceKey()]: JSON.stringify(makePrivacyChoice(privacy, {functional: true}))};
        addApi('readOnlyStorage', {
            getItem: key => stored[key] ?? null,
            setItem: () => { throw new Error('denied'); },
            removeItem: () => { throw new Error('denied'); }
        });
        setApi('readOnlyStorage');
        const onPrivacyChoice = expect.createSpy();
        const visibility = expect.createSpy();
        ReactTestUtils.act(() => {
            ReactDOM.render(<Cookie privacy={privacy} show locale="en-US" onPrivacyChoice={onPrivacyChoice}
                onSetCookieVisibility={visibility}/>, document.getElementById('container'));
        });
        expect(consentManager.isAllowed('functional')).toBe(true);
        ReactTestUtils.Simulate.click(document.querySelector('#privacy-reject'));
        expect(onPrivacyChoice.calls[onPrivacyChoice.calls.length - 1].arguments).toEqual([null]);
        expect(consentManager.isAllowed('functional')).toBe(false);
        expect(visibility.calls.some(call => call.arguments[0] === false)).toBe(false);
        expect(document.querySelector('[role=alert]')).toExist();
        window.dispatchEvent(new Event('focus'));
        expect(consentManager.isAllowed('functional')).toBe(false);
        expect(onPrivacyChoice.calls[onPrivacyChoice.calls.length - 1].arguments).toEqual([null]);
        setApi('localStorage');
    });
    it('removes an older consent when the new choice cannot be written', () => {
        const privacy = {enabled: true, policyVersion: 'quota', categories: [{id: 'functional'}]};
        const stored = {[privacyChoiceKey()]: JSON.stringify(makePrivacyChoice(privacy, {functional: true}))};
        addApi('fullStorage', {
            getItem: key => stored[key] ?? null,
            setItem: () => { throw new Error('quota'); },
            removeItem: key => { delete stored[key]; }
        });
        setApi('fullStorage');
        ReactTestUtils.act(() => {
            ReactDOM.render(<Cookie privacy={privacy} show locale="en-US"/>, document.getElementById('container'));
        });
        ReactTestUtils.Simulate.click(document.querySelector('#privacy-reject'));
        expect(stored[privacyChoiceKey()]).toBe(undefined);
        expect(consentManager.isAllowed('functional')).toBe(false);
        setApi('localStorage');
    });
    it('shows the leave button only when declineUrl is configured', () => {
        ReactDOM.render(<Cookie show/>, document.getElementById('container'));
        expect(document.querySelectorAll('.mapstore-cookie-panel a').length).toBe(0);
        ReactDOM.render(<Cookie show declineUrl="https://example.com/"/>, document.getElementById('container'));
        const links = [...document.querySelectorAll('.mapstore-cookie-panel a')].map(a => a.getAttribute('href'));
        expect(links).toEqual(['https://example.com/']);
    });
    it('links the policy pages of the current locale, falling back to the first one', () => {
        const privacy = {enabled: true, policyVersion: 'links', categories: [], links: {
            cookie: {'en-US': 'cookie.html', 'it-IT': 'cookie.it-IT.html'},
            privacy: {'de-DE': 'privacy.de-DE.html'},
            terms: 'terms.html'
        }};
        renderLocalized(<Cookie privacy={privacy} locale="it-IT" show/>, 'it-IT');
        const links = [...document.querySelectorAll('.mapstore-privacy-links a')].map(a => [a.getAttribute('href'), a.textContent]);
        expect(links).toEqual([
            ['cookie.it-IT.html', 'Cookie Policy'],
            ['privacy.de-DE.html', 'Privacy Policy'],
            ['terms.html', 'Terms of Use']
        ]);
    });
    it('warns in the console when no policy page is configured', () => {
        const warn = expect.spyOn(console, 'warn');
        ReactDOM.render(<Cookie privacy={{enabled: true, policyVersion: 'nolinks', categories: []}}/>, document.getElementById('container'));
        expect(warn.calls.length).toBe(1);
        expect(warn.calls[0].arguments[0]).toInclude('privacy.links');
        warn.restore();
    });
});
