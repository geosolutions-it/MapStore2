/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var loadLocale = require('../locale').loadLocale;

describe('Test locale related actions', () => {
    it('does not load a missing translation file', (done) => {
        loadLocale('', 'unknown')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('LOCALE_LOAD_ERROR');
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('loads an existing translation file', (done) => {
        loadLocale('base/web/client/test-resources', 'it-IT')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('loads an existing translation file', (done) => {
        loadLocale('base/web/client/test-resources')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });

    it('loads an existing broken translation file', (done) => {
        loadLocale('base/web/client/test-resources', 'it-IT-broken')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('LOCALE_LOAD_ERROR');
                done();
            } catch(ex) {
                done(ex);
            }
        });
    });
});
