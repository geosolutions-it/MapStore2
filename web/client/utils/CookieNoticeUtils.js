/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getApi, getItemKey } from '../api/userPersistedStorage';
import { privacyConfig, readPrivacyChoice, categoryIds, removePrivacyStorageItem } from './PrivacyChoices';

// localStorage stores strings; the in-memory adapter can retain booleans.
// A legacy "false" or an unavailable storage API is never acknowledgement.
const isApproved = value => value === true || value === 'true';

export const privacyNoticeKey = () => getItemKey('privacy', 'notice');

// Dismissing necessary-only information is distinct from granting consent.
export const isPrivacyNoticeAcknowledged = (config, now = Date.now()) => {
    if (!config?.enabled) return false;
    let raw;
    try { raw = getApi().getItem(privacyNoticeKey()); } catch (e) { return false; }
    let valid = false;
    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
        valid = value?.version === 1 && value.policyVersion === config.policyVersion
            && Number.isFinite(value.dismissedAt) && Number.isFinite(value.expiresAt)
            && value.dismissedAt <= now && value.expiresAt > now
            && value.expiresAt <= value.dismissedAt + (config.retentionDays || 180) * 86400000;
    } catch (e) { /* Malformed records do not acknowledge the information. */ }
    if (!valid) removePrivacyStorageItem(privacyNoticeKey(), raw);
    return !!valid;
};

export const acknowledgePrivacyNotice = (config, now = Date.now()) => {
    try {
        getApi().setItem(privacyNoticeKey(), JSON.stringify({version: 1,
            policyVersion: config.policyVersion, dismissedAt: now,
            expiresAt: now + (config.retentionDays || 180) * 86400000}));
        return true;
    } catch (e) { return false; }
};

export const isCookieNoticeAcknowledged = (config = privacyConfig()) => {
    // A previous "Accept" only acknowledged the old notice; it never grants
    // consent to a newly configured optional resource or a new policy version.
    if (config?.enabled) {
        [getItemKey('cookie', 'approved'), 'cookies-policy-approved'].forEach(key => {
            try { removePrivacyStorageItem(key, getApi().getItem(key)); } catch (e) { /* Storage may be unavailable. */ }
        });
        const choice = readPrivacyChoice(config);
        const notice = isPrivacyNoticeAcknowledged(config);
        return categoryIds(config).length ? !!choice : notice;
    }
    try {
        return isApproved(getApi().getItem(getItemKey('cookie', 'approved')))
            || isApproved(getApi().getItem('cookies-policy-approved'));
    } catch (e) {
        console.warn('Cannot read cookie notice state', e);
        return false;
    }
};
