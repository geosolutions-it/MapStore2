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
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('does load translation files from multiple folders', (done) => {
        loadLocale(['base/web/client/test-resources/a', 'base/web/client/test-resources/b'], 'it-IT')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                expect(e.messages).toExist();
                expect(e.messages.a).toExist();
                expect(e.messages.b).toExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('does load translation files from multiple folders, if at least one exists', (done) => {
        loadLocale(['base/web/client/test-resources/a', 'base/web/client/test-resources/missing'], 'it-IT')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                expect(e.messages).toExist();
                expect(e.messages.a).toExist();
                expect(e.messages.b).toNotExist();
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('errors out  if no translations path exist', (done) => {
        loadLocale(['base/web/client/test-resources/missing1', 'base/web/client/test-resources/missing2'], 'it-IT')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('LOCALE_LOAD_ERROR');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('loads an existing it-IT translation file', (done) => {
        loadLocale('base/web/client/translations', 'it-IT')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('loads an existing fr-FR translation file', (done) => {
        loadLocale('base/web/client/translations', 'fr-FR')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('loads an existing en-US translation file', (done) => {
        loadLocale('base/web/client/translations', 'en-US')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('loads an existing es-ES translation file', (done) => {
        loadLocale('base/web/client/translations', 'es-ES')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('loads an existing it-IT or en-US or fr-FR translation file', (done) => {
        loadLocale('base/web/client/translations')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('loads an existing nl-NL translation file', (done) => {
        loadLocale('base/web/client/translations', 'nl-NL')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('CHANGE_LOCALE');
                done();
            } catch (ex) {
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
            } catch (ex) {
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
            } catch (ex) {
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
            } catch (ex) {
                done(ex);
            }
        });
    });

    it('loads an existing broken translation file', (done) => {
        loadLocale('base/web/client/test-resources', 'nl-NL-broken')((e) => {
            try {
                expect(e).toExist();
                expect(e.type).toBe('LOCALE_LOAD_ERROR');
                done();
            } catch (ex) {
                done(ex);
            }
        });
    });
});
