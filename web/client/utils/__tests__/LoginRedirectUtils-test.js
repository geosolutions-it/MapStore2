/**
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { consumeLoginRedirect, saveLoginRedirect } from '../LoginRedirectUtils';

const createStorage = () => {
    const values = {};
    return {
        getItem: (key) => Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null,
        setItem: (key, value) => {
            values[key] = value;
        },
        removeItem: (key) => {
            delete values[key];
        }
    };
};

describe('LoginRedirectUtils', () => {
    it('saves and consumes the current hash route', () => {
        const storage = createStorage();
        const originalHash = window.location.hash;
        window.location.hash = '#/viewer/openlayers/123?showInfo=true';

        expect(saveLoginRedirect(undefined, storage)).toBe(true);
        expect(consumeLoginRedirect(storage)).toBe('#/viewer/openlayers/123?showInfo=true');
        expect(consumeLoginRedirect(storage)).toBe(null);

        window.location.hash = originalHash;
    });

    it('ignores an empty hash', () => {
        const storage = createStorage();

        expect(saveLoginRedirect('', storage)).toBe(false);
        expect(consumeLoginRedirect(storage)).toBe(null);
    });

    it('does not throw when storage is unavailable', () => {
        const unavailableStorage = {
            getItem: () => {
                throw new Error('Storage unavailable');
            },
            setItem: () => {
                throw new Error('Storage unavailable');
            },
            removeItem: () => {
                throw new Error('Storage unavailable');
            }
        };

        expect(saveLoginRedirect('#/viewer/123', unavailableStorage)).toBe(false);
        expect(consumeLoginRedirect(unavailableStorage)).toBe(null);
    });
});
