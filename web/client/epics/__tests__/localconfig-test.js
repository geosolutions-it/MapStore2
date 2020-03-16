/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {SUPPORTED_LOCALES_REGISTERED, localConfigLoaded} = require('../../actions/localConfig');
const LocaleUtils = require('../../utils/LocaleUtils');

const expect = require('expect');
const assign = require('object-assign');

const {testEpic} = require('./epicTestUtils');
const {setSupportedLocales} = require('../localconfig');

describe('localconfig Epics', () => {

    it('test load of supported locales with no locales', (done) => {
        const newState = assign({});

        testEpic(setSupportedLocales, 1, localConfigLoaded(newState), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                const suppLocales = LocaleUtils.getSupportedLocales();
                switch (action.type) {
                case SUPPORTED_LOCALES_REGISTERED:
                    expect(Object.keys(suppLocales).length).toBe(11);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });
    it('test load of supported locales', (done) => {
        const ita = {
            "it": {
                code: "it-IT",
                description: "Italiano"
            }
        };
        const newState = assign({
            initialState: {
                defaultState: {
                    locales: {
                        supportedLocales: ita
                    }
                }
            }
        });

        testEpic(setSupportedLocales, 1, localConfigLoaded(newState), actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                const suppLocales = LocaleUtils.getSupportedLocales();
                switch (action.type) {
                case SUPPORTED_LOCALES_REGISTERED:
                    expect(suppLocales).toBe(ita);
                    expect(Object.keys(suppLocales).length).toBe(1);
                    break;
                default:
                    expect(true).toBe(false);
                }
            });
            done();
        }, newState);
    });

});
