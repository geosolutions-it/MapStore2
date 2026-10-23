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
import { setApi, getApi, getItemKey } from '../../../api/userPersistedStorage';
import ReactTestUtils from 'react-dom/test-utils';
import { privacyNoticeKey } from '../../../utils/CookieNoticeUtils';
import { privacyChoiceKey } from '../../../utils/PrivacyChoices';

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
        ReactDOM.render(<Cookie privacy={{enabled: true, categories: []}} locale="en-US" show/>, document.getElementById('container'));
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
});
