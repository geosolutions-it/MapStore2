/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
