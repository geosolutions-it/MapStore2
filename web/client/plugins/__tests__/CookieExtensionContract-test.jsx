/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import expect from 'expect';
import Cookie from '../../components/cookie/Cookie';
import cookie from '../../reducers/cookie';
import controls from '../../reducers/controls';
import ConfigUtils from '../../utils/ConfigUtils';
import { getApi } from '../../api/userPersistedStorage';
import { privacyConfigSelector, privacyChoiceKey, makePrivacyChoice } from '../../utils/PrivacyChoices';

// Actions exchanged with the privacy settings extension
// (https://github.com/geosolutions-it/mapstore-privacy-settings-extension), which does not import
// MapStore modules: their shape must not change.
describe('Privacy settings contract with extensions', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="container"></div>';
    });
    afterEach(() => {
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        document.body.innerHTML = '';
        ConfigUtils.removeConfigProp('privacy');
        getApi().removeItem(privacyChoiceKey());
    });
    it('the configuration dispatched by an extension is used by the privacy panel', () => {
        ConfigUtils.setConfigProp('privacy', {enabled: true, policyVersion: 'vanilla', retentionDays: 180, categories: []});
        const state = {controls: controls(undefined, {
            type: 'SET_CONTROL_PROPERTY',
            control: 'privacy',
            property: 'defaults',
            value: {
                enabled: true,
                policyVersion: 'extension-1',
                retentionDays: 30,
                categories: [{id: 'statistics', description: {'en-US': 'Statistics'}}],
                links: {cookie: {'en-US': 'extensions/PrivacySettings/assets/en-US/cookie.html'}}
            }
        })};
        expect(privacyConfigSelector(state)).toEqual({
            enabled: true,
            policyVersion: 'extension-1',
            retentionDays: 30,
            categories: [{id: 'statistics', description: {'en-US': 'Statistics'}}],
            links: {cookie: {'en-US': 'extensions/PrivacySettings/assets/en-US/cookie.html'}}
        });
    });
    it('SET_PRIVACY_CHOICE carries the validated choice, or null when the stored one is not valid', () => {
        const privacy = {enabled: true, policyVersion: 'contract-1', categories: [{id: 'statistics'}]};
        getApi().setItem(privacyChoiceKey(), JSON.stringify(makePrivacyChoice(privacy, {statistics: true})));
        let state = cookie(undefined, {type: 'INIT'});
        const actions = [];
        const onPrivacyChoice = choice => {
            const action = {type: 'SET_PRIVACY_CHOICE', choice};
            actions.push(action);
            state = cookie(state, action);
        };
        ReactTestUtils.act(() => {
            ReactDOM.render(<Cookie privacy={privacy} onPrivacyChoice={onPrivacyChoice}/>, document.getElementById('container'));
        });
        expect(actions.length).toBe(1);
        expect(actions[0].choice.categories).toEqual({statistics: true});
        expect(actions[0].choice.policyVersion).toBe('contract-1');
        expect(state.privacyChoice).toBe(actions[0].choice);
        ReactDOM.unmountComponentAtNode(document.getElementById('container'));
        // a new policy version makes the stored choice invalid
        ReactTestUtils.act(() => {
            ReactDOM.render(<Cookie privacy={{...privacy, policyVersion: 'contract-2'}} onPrivacyChoice={onPrivacyChoice}/>, document.getElementById('container'));
        });
        expect(actions.length).toBe(2);
        expect(actions[1].choice).toBe(null);
        expect(state.privacyChoice).toBe(null);
    });
});
