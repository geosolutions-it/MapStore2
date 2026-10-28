/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { normalizeChoice } from './PrivacyChoices';

// Integrations register inert factories: no optional work at module load time.
// Each start must return a synchronous teardown and honour AbortSignal.
export const createConsentManager = () => {
    const integrations = new Map();
    let config;
    let choice;
    const allowed = category => config?.enabled && normalizeChoice(choice, config)?.categories[category] === true;
    const stop = item => {
        item.controller?.abort();
        try { item.cleanup?.(); } catch (error) { console.error('Optional integration teardown failed', item.id, error); } finally { item.controller = null; item.cleanup = null; }
    };
    const reconcile = () => integrations.forEach(item => {
        if (!allowed(item.category)) { stop(item); return; }
        if (!item.controller) {
            item.controller = new AbortController();
            try {
                const cleanup = item.start({signal: item.controller.signal, isAllowed: () => !!allowed(item.category)});
                if (typeof cleanup !== 'function') throw new Error('Consent integration must return teardown');
                item.cleanup = cleanup;
            } catch (error) {
                stop(item);
                console.error('Optional integration could not start', item.id, error);
            }
        }
    });
    return {
        update: (nextConfig, nextChoice) => { config = nextConfig; choice = nextChoice; reconcile(); },
        register: (id, category, start) => {
            if (integrations.has(id) || typeof start !== 'function'
                || !['functional', 'statistics', 'marketing'].includes(category)) throw new Error('Invalid consent integration');
            const item = {id, category, start};
            integrations.set(id, item);
            reconcile();
            return () => { stop(item); integrations.delete(id); };
        },
        stop: () => { integrations.forEach(stop); choice = null; },
        isAllowed: category => !!allowed(category)
    };
};
export const consentManager = createConsentManager();
export const registerConsentIntegration = (...args) => consentManager.register(...args);
