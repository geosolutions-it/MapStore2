/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import { normalizeChoice, makePrivacyChoice, readPrivacyChoice, persistPrivacyChoice, privacyChoiceKey, getPolicyLink, hasPrivacyLinks, privacyConfigSelector } from '../PrivacyChoices';
import ConfigUtils from '../ConfigUtils';
import { createConsentManager } from '../ConsentManager';
import { setApi, getApi, getItemKey, addApi } from '../../api/userPersistedStorage';
import { privacyNoticeKey, acknowledgePrivacyNotice, isPrivacyNoticeAcknowledged, isCookieNoticeAcknowledged } from '../CookieNoticeUtils';
const config = {enabled: true, policyVersion: 'test', retentionDays: 180, categories: [{id: 'functional'}, {id: 'statistics'}]};

describe('Consent lifecycle', () => {
    it('shows necessary-only information on first visit and remembers dismissal separately from consent', () => {
        setApi('memoryStorage');
        const necessary = {...config, categories: []};
        getApi().removeItem(privacyNoticeKey());
        getApi().removeItem(privacyChoiceKey());
        expect(isCookieNoticeAcknowledged(necessary)).toBe(false);
        expect(acknowledgePrivacyNotice(necessary)).toBe(true);
        expect(isCookieNoticeAcknowledged(necessary)).toBe(true);
        expect(readPrivacyChoice(necessary)).toBe(null);
        expect(isCookieNoticeAcknowledged(config)).toBe(false);
        const record = JSON.parse(getApi().getItem(privacyNoticeKey()));
        expect(isPrivacyNoticeAcknowledged(necessary, record.expiresAt)).toBe(false);
        expect(getApi().getItem(privacyNoticeKey())).toBe(null);
        acknowledgePrivacyNotice(necessary);
        expect(isPrivacyNoticeAcknowledged({...necessary, policyVersion: 'next'})).toBe(false);
        expect(getApi().getItem(privacyNoticeKey())).toBe(null);
        getApi().setAccessDenied(true);
        expect(isPrivacyNoticeAcknowledged(necessary)).toBe(false);
        expect(acknowledgePrivacyNotice(necessary)).toBe(false);
        getApi().setAccessDenied(false);
        getApi().removeItem(privacyNoticeKey());
        setApi('localStorage');
    });
    it('rejects old notices, changed policy, expired records and non-boolean grants', () => {
        expect(normalizeChoice(true, config)).toBe(null);
        expect(normalizeChoice({version: 1, categories: {functional: true}}, config)).toBe(null);
        const choice = makePrivacyChoice(config, {functional: 'true', statistics: true}, 1000);
        expect(choice.categories).toEqual({functional: false, statistics: true});
        expect(normalizeChoice(choice, {...config, policyVersion: 'new'}, 1000)).toBe(null);
        expect(normalizeChoice(choice, config, choice.expiresAt)).toBe(null);
    });
    it('does not run integrations before choice or after refusal, starts only selected categories and tears down on withdrawal', () => {
        const manager = createConsentManager();
        let signal; let count = 0; let stopped = 0;
        manager.register('fixture', 'functional', context => { signal = context.signal; count++; return () => { stopped++; }; });
        manager.update(config, null);
        manager.update(config, makePrivacyChoice(config, {}));
        expect(count).toBe(0);
        manager.update(config, makePrivacyChoice(config, {statistics: true}));
        expect(count).toBe(0);
        manager.update(config, makePrivacyChoice(config, {functional: true}));
        manager.update(config, makePrivacyChoice(config, {functional: true}));
        expect(count).toBe(1);
        expect(signal.aborted).toBe(false);
        manager.update(config, makePrivacyChoice(config, {}));
        expect(signal.aborted).toBe(true);
        expect(stopped).toBe(1);
        expect(manager.isAllowed('functional')).toBe(false);
        manager.stop();
    });
    it('disables a running integration on policy upgrade and unregisters it safely', () => {
        const manager = createConsentManager();
        const teardown = expect.createSpy();
        manager.update(config, makePrivacyChoice(config, {functional: true}));
        const unregister = manager.register('fixture', 'functional', () => teardown);
        manager.update({...config, policyVersion: 'new'}, makePrivacyChoice(config, {functional: true}));
        expect(teardown).toHaveBeenCalled();
        unregister();
        manager.stop();
    });
    it('persists the choice and fails closed if storage cannot be read', () => {
        setApi('memoryStorage');
        const api = getApi();
        const choice = makePrivacyChoice(config, {functional: true});
        expect(persistPrivacyChoice(choice)).toBe(true);
        expect(readPrivacyChoice(config)).toEqual(choice);
        api.setAccessDenied(true);
        expect(readPrivacyChoice(config)).toBe(null);
        expect(persistPrivacyChoice(choice)).toBe(false);
        api.setAccessDenied(false);
        api.removeItem(privacyChoiceKey());
        setApi('localStorage');
    });
});


describe('Selective privacy storage migration', () => {
    const legacy = () => [getItemKey('cookie', 'approved'), 'cookies-policy-approved'];
    beforeEach(() => { setApi('memoryStorage'); });
    afterEach(() => {
        getApi().setAccessDenied(false);
        [...legacy(), privacyChoiceKey(), privacyNoticeKey(), getItemKey('persistence', 'security')]
            .forEach(key => getApi().removeItem(key));
        setApi('localStorage');
    });
    it('removes old acknowledgements without granting consent or changing authentication', () => {
        const security = getItemKey('persistence', 'security');
        const original = '{"user":"synthetic","token":"synthetic-test-only"}';
        getApi().setItem(security, original);
        legacy().forEach((key, index) => getApi().setItem(key, index ? 'false' : 'true'));
        expect(isCookieNoticeAcknowledged(config)).toBe(false);
        legacy().forEach(key => expect(getApi().getItem(key)).toBe(null));
        expect(getApi().getItem(privacyChoiceKey())).toBe(null);
        expect(getApi().getItem(privacyNoticeKey())).toBe(null);
        expect(getApi().getItem(security)).toBe(original);
    });
    it('retains legacy behavior when the new privacy configuration is disabled', () => {
        getApi().setItem(legacy()[0], 'true');
        expect(isCookieNoticeAcknowledged({enabled: false})).toBe(true);
        expect(getApi().getItem(legacy()[0])).toBe('true');
    });
    it('preserves valid optional acceptance and refusal exactly as saved', () => {
        [true, false].forEach(functional => {
            const original = JSON.stringify(makePrivacyChoice(config, {functional}));
            getApi().setItem(privacyChoiceKey(), original);
            legacy().forEach(key => getApi().setItem(key, 'true'));
            expect(isCookieNoticeAcknowledged(config)).toBe(true);
            expect(getApi().getItem(privacyChoiceKey())).toBe(original);
            expect(readPrivacyChoice(config).categories.functional).toBe(functional);
        });
    });
    it('preserves a valid necessary-only dismissal and removes obsolete optional choices', () => {
        const necessary = {...config, categories: []};
        acknowledgePrivacyNotice(necessary);
        const original = getApi().getItem(privacyNoticeKey());
        persistPrivacyChoice(makePrivacyChoice(config, {functional: true}));
        expect(isCookieNoticeAcknowledged(necessary)).toBe(true);
        expect(getApi().getItem(privacyChoiceKey())).toBe(null);
        expect(getApi().getItem(privacyNoticeKey())).toBe(original);
    });
    it('removes expired, superseded, malformed and old-schema optional records on read', () => {
        const old = makePrivacyChoice(config, {functional: true}, 1000);
        const current = makePrivacyChoice(config, {functional: true});
        [JSON.stringify(old), JSON.stringify({...current, policyVersion: 'obsolete'}),
            JSON.stringify({...current, version: 1}), JSON.stringify({...current, categories: []}), '{broken']
            .forEach(raw => {
                getApi().setItem(privacyChoiceKey(), raw);
                expect(readPrivacyChoice(config)).toBe(null);
                expect(getApi().getItem(privacyChoiceKey())).toBe(null);
            });
    });
    it('removes invalid information records without hiding a first visit', () => {
        const necessary = {...config, categories: []};
        acknowledgePrivacyNotice(necessary);
        const current = JSON.parse(getApi().getItem(privacyNoticeKey()));
        [JSON.stringify({...current, expiresAt: 1000}), JSON.stringify({...current, policyVersion: 'obsolete'}), '{broken']
            .forEach(raw => {
                getApi().setItem(privacyNoticeKey(), raw);
                expect(isCookieNoticeAcknowledged(necessary)).toBe(false);
                expect(getApi().getItem(privacyNoticeKey())).toBe(null);
            });
    });
    it('fails closed when cleanup is denied and does not erase a concurrent newer decision', () => {
        const current = JSON.stringify(makePrivacyChoice(config, {functional: true}));
        let stored = '{broken';
        addApi('privacyMigrationRace', {
            getItem: () => { const result = stored; stored = current; return result; },
            removeItem: () => { throw new Error('Must not remove the newer record'); }
        });
        setApi('privacyMigrationRace');
        expect(readPrivacyChoice(config)).toBe(null);
        expect(stored).toBe(current);
        expect(readPrivacyChoice(config).categories.functional).toBe(true);
        setApi('memoryStorage');
        getApi().setAccessDenied(true);
        expect(isCookieNoticeAcknowledged(config)).toBe(false);
    });
    it('ignores invalid records even when the browser permits reads but denies removal', () => {
        const raw = JSON.stringify({...makePrivacyChoice(config, {functional: true}), policyVersion: 'obsolete'});
        addApi('privacyCleanupDenied', {getItem: () => raw, removeItem: () => { throw new Error('denied'); }});
        setApi('privacyCleanupDenied');
        expect(readPrivacyChoice(config)).toBe(null);
        expect(isCookieNoticeAcknowledged(config)).toBe(false);
        setApi('memoryStorage');
    });
});

describe('Policy links', () => {
    it('getPolicyLink returns the url of the locale, the first url as fallback, or undefined', () => {
        const links = {cookie: {'en-US': 'en.html', 'it-IT': 'it.html'}, privacy: 'privacy.html', terms: {}};
        expect(getPolicyLink({links}, 'cookie', 'it-IT')).toBe('it.html');
        expect(getPolicyLink({links}, 'cookie', 'fr-FR')).toBe('en.html');
        expect(getPolicyLink({links}, 'privacy', 'fr-FR')).toBe('privacy.html');
        expect(getPolicyLink({links}, 'terms', 'fr-FR')).toBe(undefined);
        expect(getPolicyLink({}, 'cookie', 'en-US')).toBe(undefined);
    });
    it('hasPrivacyLinks is true only when at least one page is configured', () => {
        expect(hasPrivacyLinks({links: {terms: 'terms.html'}})).toBe(true);
        expect(hasPrivacyLinks({links: {cookie: {}, privacy: ''}})).toBe(false);
        expect(hasPrivacyLinks({})).toBe(false);
    });
});

describe('privacyConfigSelector', () => {
    const defaults = {policyVersion: 'extension-1', links: {cookie: 'extensions/PrivacySettings/assets/cookie.html'}};
    afterEach(() => {
        ConfigUtils.removeConfigProp('privacy');
    });
    it('uses pages and version set at runtime when localConfig has no links', () => {
        ConfigUtils.setConfigProp('privacy', {enabled: true, policyVersion: 'vanilla', categories: []});
        expect(privacyConfigSelector({controls: {privacy: {defaults}}})).toEqual({
            enabled: true, policyVersion: 'extension-1', categories: [],
            links: {cookie: 'extensions/PrivacySettings/assets/cookie.html'}
        });
    });
    it('keeps the localConfig version when the runtime defaults have none', () => {
        ConfigUtils.setConfigProp('privacy', {enabled: true, policyVersion: 'vanilla'});
        expect(privacyConfigSelector({controls: {privacy: {defaults: {links: defaults.links}}}}).policyVersion).toBe('vanilla');
    });
    it('ignores runtime defaults when localConfig configures links', () => {
        const localConfig = {enabled: true, policyVersion: 'operator', links: {privacy: 'https://example.com/privacy'}};
        ConfigUtils.setConfigProp('privacy', localConfig);
        expect(privacyConfigSelector({controls: {privacy: {defaults}}})).toBe(localConfig);
    });
    it('returns the localConfig configuration without runtime defaults, and null without any privacy configuration', () => {
        const localConfig = {enabled: true, policyVersion: 'vanilla'};
        ConfigUtils.setConfigProp('privacy', localConfig);
        expect(privacyConfigSelector({})).toBe(localConfig);
        ConfigUtils.removeConfigProp('privacy');
        expect(privacyConfigSelector({})).toBe(null);
    });
    it('replaces retention and categories of localConfig with the runtime ones', () => {
        ConfigUtils.setConfigProp('privacy', {enabled: true, policyVersion: 'vanilla', retentionDays: 180, categories: [{id: 'statistics'}]});
        const runtime = {...defaults, retentionDays: 90, categories: [{id: 'functional', description: {'en-US': 'Saved searches'}}]};
        expect(privacyConfigSelector({controls: {privacy: {defaults: runtime}}})).toEqual({
            enabled: true, policyVersion: 'extension-1', retentionDays: 90,
            categories: [{id: 'functional', description: {'en-US': 'Saved searches'}}],
            links: {cookie: 'extensions/PrivacySettings/assets/cookie.html'}
        });
    });
    it('uses the runtime enabled only when localConfig has no privacy section', () => {
        const runtime = {...defaults, enabled: true};
        ConfigUtils.setConfigProp('privacy', {enabled: false, policyVersion: 'vanilla'});
        expect(privacyConfigSelector({controls: {privacy: {defaults: runtime}}}).enabled).toBe(false);
        ConfigUtils.removeConfigProp('privacy');
        expect(privacyConfigSelector({controls: {privacy: {defaults: runtime}}})).toEqual({
            enabled: true, policyVersion: 'extension-1', links: {cookie: 'extensions/PrivacySettings/assets/cookie.html'}
        });
    });
});
