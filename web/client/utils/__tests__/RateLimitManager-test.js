/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { RateLimitManager, parseRetryAfter } from '../RateLimitManager';

describe('RateLimitManager', () => {
    const now = Date.UTC(2026, 0, 1, 0, 0, 0);

    it('parses Retry-After seconds and HTTP-date values', () => {
        expect(parseRetryAfter('2', now)).toBe(2000);
        expect(parseRetryAfter('Thu, 01 Jan 2026 00:00:10 GMT', now)).toBe(10000);
        expect(parseRetryAfter('Thu, 01 Jan 2025 00:00:10 GMT', now)).toBe(0);
        expect(parseRetryAfter('not a date', now)).toNotExist();
    });

    it('uses exponential backoff when Retry-After is missing', () => {
        let currentTime = now;
        const manager = new RateLimitManager({
            getConfig: () => ({
                baseDelay: 1000,
                maxDelay: 3000
            }),
            now: () => currentTime
        });
        const url = 'https://example.com/geoserver/wms?LAYERS=workspace:layer&BBOX=1,2,3,4';

        expect(manager.register429(url).delay).toBe(1000);
        currentTime += 1000;
        expect(manager.register429(url).delay).toBe(2000);
        currentTime += 2000;
        expect(manager.register429(url).delay).toBe(3000);
    });

    it('waits until the current bucket backoff has elapsed', (done) => {
        let currentTime = now;
        const manager = new RateLimitManager({
            getConfig: () => ({
                baseDelay: 1000
            }),
            now: () => currentTime,
            scheduler: (resolve, delay) => {
                expect(delay).toBe(1000);
                currentTime += delay;
                resolve();
            }
        });

        manager.register429('https://example.com/wms');
        manager.wait('https://example.com/wms')
            .then(() => {
                expect(manager.getWaitDelay('https://example.com/wms')).toBe(0);
                done();
            })
            .catch(done);
    });

    it('keeps queued waiters pending when a later 429 extends the backoff', (done) => {
        let currentTime = now;
        const scheduled = [];
        const manager = new RateLimitManager({
            getConfig: () => ({
                baseDelay: 1000
            }),
            now: () => currentTime,
            scheduler: (resolve, delay) => {
                scheduled.push({ resolve, delay });
            }
        });
        const url = 'https://example.com/wms';

        manager.register429(url, { 'retry-after': '1' });
        let resolved = false;
        const waitPromise = manager.wait(url).then(() => {
            resolved = true;
        });
        expect(manager.getBucket(url).pendingWaiters.length).toBe(1);

        currentTime = now + 500;
        manager.register429(url, { 'retry-after': '2' });

        expect(scheduled.length).toBe(1);
        expect(scheduled[0].delay).toBe(1000);
        currentTime = now + 1000;
        scheduled.shift().resolve();

        expect(resolved).toBe(false);
        expect(manager.getBucket(url).pendingWaiters.length).toBe(1);
        expect(scheduled.length).toBe(1);
        expect(scheduled[0].delay).toBe(1500);

        currentTime = now + 2500;
        scheduled.shift().resolve();
        waitPromise
            .then(() => {
                expect(resolved).toBe(true);
                expect(manager.getBucket(url).pendingWaiters.length).toBe(0);
                done();
            })
            .catch(done);
    });

    it('resets consecutive failures after a successful response', () => {
        const manager = new RateLimitManager({
            getConfig: () => ({
                baseDelay: 1000,
                maxDelay: 60000
            }),
            now: () => now
        });
        const url = 'https://example.com/wms';

        manager.register429(url);
        manager.register429(url);
        manager.registerSuccess(url);

        expect(manager.register429(url).delay).toBe(1000);
    });

    it('normalizes bucket keys by origin, path and WMS layer', () => {
        const manager = new RateLimitManager({
            getConfig: () => ({
                defaultBucket: 'origin',
                bucketRules: [
                    {
                        urlPattern: '.*geoserver/wms.*',
                        bucket: 'wmsLayer'
                    },
                    {
                        urlPattern: '.*tiles.example.org.*',
                        bucket: 'path'
                    }
                ]
            })
        });

        expect(manager.getBucketKey('https://example.com/a?x=1')).toBe('https://example.com');
        expect(manager.getBucketKey('https://tiles.example.org/a/b?x=1')).toBe('https://tiles.example.org/a/b');
        expect(manager.getBucketKey('https://example.com/geoserver/wms?BBOX=1,2,3,4&LAYERS= workspace:layer '))
            .toBe('https://example.com/geoserver/wms?LAYERS=workspace:layer');
    });

    it('honors maxRetries when registering 429 responses', () => {
        const manager = new RateLimitManager({
            getConfig: () => ({
                baseDelay: 1,
                maxRetries: 1
            }),
            now: () => now
        });
        const url = 'https://example.com/wms';

        expect(manager.register429(url).shouldRetry).toBe(true);
        expect(manager.register429(url).shouldRetry).toBe(false);
    });
});
