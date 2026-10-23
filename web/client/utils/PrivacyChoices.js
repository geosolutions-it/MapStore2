/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createSelector } from 'reselect';
import ConfigUtils from './ConfigUtils';
import { getApi, getItemKey } from '../api/userPersistedStorage';

export const privacyConfig = () => ConfigUtils.getConfigProp('privacy') || null;
export const privacyChoiceKey = () => getItemKey('privacy', 'choices');
export const categoryIds = config => (config?.categories || []).filter(c =>
    ['functional', 'statistics', 'marketing'].includes(c.id)).map(c => c.id);

export const normalizeChoice = (value, config, now = Date.now()) => {
    if (!config || !value || value.version !== 2 || value.policyVersion !== config.policyVersion
        || !value.categories || typeof value.categories !== 'object' || Array.isArray(value.categories)
        || !Number.isFinite(value.updatedAt) || !Number.isFinite(value.expiresAt)
        || value.updatedAt > now || value.expiresAt <= now
        || value.expiresAt > value.updatedAt + (config.retentionDays || 180) * 86400000) return null;
    return {version: 2, policyVersion: config.policyVersion,
        updatedAt: value.updatedAt, expiresAt: value.expiresAt,
        categories: Object.fromEntries(categoryIds(config).map(id => [id, value.categories[id] === true]))};
};
export const makePrivacyChoice = (config, selected = {}, now = Date.now()) => normalizeChoice({
    version: 2, policyVersion: config.policyVersion, updatedAt: now,
    expiresAt: now + (config.retentionDays || 180) * 86400000, categories: selected
}, config, now);
// Compare before removal so cleanup cannot erase a newer choice from another tab.
// Only explicitly named privacy/legacy-notice keys are passed by callers.
export const removePrivacyStorageItem = (key, previousValue) => {
    if (previousValue === null || previousValue === undefined) return;
    try {
        if (getApi().getItem(key) === previousValue) getApi().removeItem(key);
    } catch (e) { /* Storage denial must not interrupt the application. */ }
};
export const readPrivacyChoice = (config = privacyConfig()) => {
    if (!config?.enabled) return null;
    let raw;
    try { raw = getApi().getItem(privacyChoiceKey()); } catch (e) { return null; }
    let choice = null;
    try {
        if (categoryIds(config).length) {
            choice = normalizeChoice(typeof raw === 'string' ? JSON.parse(raw) : raw, config);
        }
    } catch (e) { /* Malformed records cannot grant consent. */ }
    if (!choice) removePrivacyStorageItem(privacyChoiceKey(), raw);
    return choice;
};
export const persistPrivacyChoice = choice => {
    try {
        getApi().setItem(privacyChoiceKey(), JSON.stringify(choice));
        return true;
    } catch (e) { return false; }
};
export const policyLinkKeys = ['cookie', 'privacy', 'terms'];
/**
 * Returns the url of a policy page for the current locale.
 * A link can be a single url or an object of urls by locale; when the locale is missing
 * the first configured url is used.
 * @param {object} config privacy configuration
 * @param {string} key one of `cookie`, `privacy`, `terms`
 * @param {string} locale current locale, e.g. `it-IT`
 * @returns {string} the url, or undefined when not configured
 */
export const getPolicyLink = (config, key, locale) => {
    const link = config?.links?.[key];
    if (!link || typeof link === 'string') return link || undefined;
    return link[locale] || Object.values(link).find(Boolean);
};
export const hasPrivacyLinks = config => policyLinkKeys.some(key => !!getPolicyLink(config, key));
// Keys of the privacy configuration that can be provided at runtime.
const runtimePrivacyKeys = ['enabled', 'policyVersion', 'retentionDays', 'categories', 'links'];
/**
 * Returns the privacy configuration in use.
 * When `localConfig.json` does not configure `privacy.links`, the configuration can be provided
 * at runtime, for example by an extension, with `setControlProperty('privacy', 'defaults', config)`.
 * The runtime keys `policyVersion`, `retentionDays`, `categories` and `links` replace the ones of
 * `localConfig.json`; `enabled` is used only when `localConfig.json` has no `privacy` section.
 * Every reader of the privacy configuration must use this selector, so that the stored choices
 * are always checked against the same policy version.
 * @param {object} state application state
 * @returns {object} the privacy configuration, or null when not configured
 */
export const privacyConfigSelector = createSelector(
    () => privacyConfig(),
    state => state?.controls?.privacy?.defaults,
    (config, defaults) => {
        if (!defaults || hasPrivacyLinks(config)) return config;
        const runtime = Object.fromEntries(runtimePrivacyKeys
            .filter(key => defaults[key] !== undefined && (key !== 'enabled' || !config))
            .map(key => [key, defaults[key]]));
        return {...config, ...runtime};
    }
);
