/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ConfigUtils from './ConfigUtils';

const DEFAULT_CONFIG = {
    enabled: true,
    baseDelay: 1000,
    maxDelay: 60000,
    maxRetries: null,
    defaultBucket: 'origin',
    bucketRules: []
};

const RATE_LIMIT_STATUS = 429;

const normalizeConfig = (config = {}) => ({
    ...DEFAULT_CONFIG,
    ...config,
    enabled: config.enabled !== false,
    baseDelay: Number.isFinite(config.baseDelay) ? config.baseDelay : DEFAULT_CONFIG.baseDelay,
    maxDelay: Number.isFinite(config.maxDelay) ? config.maxDelay : DEFAULT_CONFIG.maxDelay,
    bucketRules: Array.isArray(config.bucketRules) ? config.bucketRules : []
});

const getWindowLocation = () => {
    if (typeof window !== 'undefined' && window.location) {
        return window.location.href;
    }
    return 'http://localhost/';
};

export const parseRetryAfter = (retryAfter, now = Date.now()) => {
    if (retryAfter === undefined || retryAfter === null) {
        return null;
    }
    const value = Array.isArray(retryAfter) ? retryAfter[0] : `${retryAfter}`;
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
        return Math.max(0, Number(trimmed) * 1000);
    }
    const retryDate = Date.parse(trimmed);
    if (Number.isNaN(retryDate)) {
        return null;
    }
    return Math.max(0, retryDate - now);
};

export const getHeaderValue = (headers, headerName) => {
    if (!headers) {
        return null;
    }
    if (typeof headers.get === 'function') {
        return headers.get(headerName);
    }
    const key = Object.keys(headers).find((name) => name.toLowerCase() === headerName.toLowerCase());
    return key ? headers[key] : null;
};

const parseUrl = (url) => {
    try {
        return new URL(url, getWindowLocation());
    } catch (e) {
        return null;
    }
};

const getParamValue = (params, paramName) => {
    if (!params) {
        return null;
    }
    if (typeof params.get === 'function') {
        return params.get(paramName) || params.get(paramName.toUpperCase()) || params.get(paramName.toLowerCase());
    }
    const key = Object.keys(params).find((name) => name.toLowerCase() === paramName.toLowerCase());
    return key ? params[key] : null;
};

const getWMSLayersValue = (parsedUrl, options = {}) => {
    const fromUrl = parsedUrl
        ? getParamValue(parsedUrl.searchParams, 'layers') || getParamValue(parsedUrl.searchParams, 'LAYERS')
        : undefined;
    const fromOptions = getParamValue(options.params, 'layers') || getParamValue(options.params, 'LAYERS');
    const value = fromUrl || fromOptions;
    return Array.isArray(value) ? value.join(',') : value;
};

const normalizeLayers = (layers) => layers
    ? `${layers}`.split(',').map((layer) => layer.trim()).filter(Boolean).join(',')
    : '';

const matchesRule = (url, rule) => {
    if (!rule || !rule.urlPattern) {
        return false;
    }
    try {
        return new RegExp(rule.urlPattern).test(url);
    } catch (e) {
        return false;
    }
};

export class RateLimitManager {
    constructor({
        getConfig = () => ConfigUtils.getConfigProp('rateLimit') || {},
        now = () => Date.now(),
        scheduler = (resolve, delay) => setTimeout(resolve, delay)
    } = {}) {
        this.getConfig = getConfig;
        this.now = now;
        this.scheduler = scheduler;
        this.buckets = {};
    }

    getEffectiveConfig() {
        return normalizeConfig(this.getConfig() || {});
    }

    isEnabled() {
        return this.getEffectiveConfig().enabled;
    }

    getBucketType(url, options = {}, config = this.getEffectiveConfig()) {
        if (options.msRateLimitBucket) {
            return options.msRateLimitBucket;
        }
        const rule = config.bucketRules.find((currentRule) => matchesRule(url, currentRule));
        return rule?.bucket || config.defaultBucket || DEFAULT_CONFIG.defaultBucket;
    }

    getBucketKey(url, options = {}) {
        const config = this.getEffectiveConfig();
        if (!config.enabled || !url) {
            return null;
        }
        if (options.msRateLimitKey) {
            return options.msRateLimitKey;
        }
        const bucketType = this.getBucketType(url, options, config);
        const parsedUrl = parseUrl(url);
        if (!parsedUrl) {
            return url;
        }
        if (bucketType === 'path') {
            return `${parsedUrl.origin}${parsedUrl.pathname}`;
        }
        if (bucketType === 'wmsLayer') {
            const layers = normalizeLayers(getWMSLayersValue(parsedUrl, options));
            return layers
                ? `${parsedUrl.origin}${parsedUrl.pathname}?LAYERS=${layers}`
                : `${parsedUrl.origin}${parsedUrl.pathname}`;
        }
        return parsedUrl.origin;
    }

    getBucket(url, options = {}) {
        const key = this.getBucketKey(url, options);
        if (!key) {
            return null;
        }
        if (!this.buckets[key]) {
            this.buckets[key] = {
                blockedUntil: 0,
                consecutive429: 0,
                pendingWaiters: []
            };
        }
        return this.buckets[key];
    }

    getWaitDelay(url, options = {}) {
        const bucket = this.getBucket(url, options);
        if (!bucket) {
            return 0;
        }
        return Math.max(0, bucket.blockedUntil - this.now());
    }

    wait(url, options = {}) {
        const delay = this.getWaitDelay(url, options);
        if (!delay) {
            return Promise.resolve();
        }
        const bucket = this.getBucket(url, options);
        if (!bucket) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            const waiter = {
                resolved: false,
                resolve
            };
            bucket.pendingWaiters.push(waiter);
            const resolveWaiter = () => {
                if (waiter.resolved) {
                    return;
                }
                waiter.resolved = true;
                bucket.pendingWaiters = bucket.pendingWaiters.filter((pendingWaiter) => pendingWaiter !== waiter);
                resolve();
            };
            const drainWhenReady = () => {
                const remainingDelay = Math.max(0, bucket.blockedUntil - this.now());
                if (remainingDelay) {
                    this.scheduler(drainWhenReady, remainingDelay);
                    return;
                }
                resolveWaiter();
            };
            this.scheduler(drainWhenReady, delay);
        });
    }

    register429(url, headers, options = {}) {
        const config = this.getEffectiveConfig();
        if (!config.enabled || !url) {
            return {
                shouldRetry: false,
                delay: 0
            };
        }
        const bucket = this.getBucket(url, options);
        bucket.consecutive429 += 1;

        const retryAfter = options.retryAfter ?? getHeaderValue(headers, 'retry-after');
        const retryAfterDelay = parseRetryAfter(retryAfter, this.now());
        const exponentialDelay = Math.min(
            config.maxDelay,
            config.baseDelay * Math.pow(2, Math.max(0, bucket.consecutive429 - 1))
        );
        const delay = Number.isFinite(retryAfterDelay) ? retryAfterDelay : exponentialDelay;
        bucket.blockedUntil = Math.max(bucket.blockedUntil, this.now() + delay);

        const maxRetries = config.maxRetries;
        const shouldRetry = maxRetries === null || maxRetries === undefined || bucket.consecutive429 <= maxRetries;
        return {
            shouldRetry,
            delay,
            key: this.getBucketKey(url, options),
            status: RATE_LIMIT_STATUS
        };
    }

    registerSuccess(url, options = {}) {
        const bucket = this.getBucket(url, options);
        if (bucket) {
            bucket.consecutive429 = 0;
            bucket.blockedUntil = 0;
            const waiters = bucket.pendingWaiters.splice(0);
            waiters.forEach((waiter) => {
                if (!waiter.resolved) {
                    waiter.resolved = true;
                    waiter.resolve();
                }
            });
        }
    }

    getRetryAttempts() {
        const config = this.getEffectiveConfig();
        if (!config.enabled) {
            return 0;
        }
        return config.maxRetries === null || config.maxRetries === undefined
            ? Number.MAX_SAFE_INTEGER
            : config.maxRetries;
    }

    reset() {
        this.buckets = {};
    }
}

const rateLimitManager = new RateLimitManager();

export default rateLimitManager;
