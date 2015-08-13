/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var assign = require('object-assign');
var Dispatcher = require('../../dispatchers/Dispatcher');

describe('This test for I18NActions', () => {
    var I18NActions;

    beforeEach((done) => {
        I18NActions = require('../I18NActions');
        setTimeout(done);
    });

    afterEach((done) => {
        var name = require.resolve('../I18NActions');
        delete require.cache[name];
        setTimeout(done);
    });

    it('checks launch(actionType, args)', () => {
        const aType = "test";
        const aArgs = {
            k0: "v0",
            k1: "v1"
        };
        const testArgs = assign({type: aType}, aArgs);
        const spy = expect.spyOn(Dispatcher, 'dispatch');
        I18NActions.launch(aType, aArgs);

        expect(spy.calls.length).toBe(1);
        expect(spy.calls[0].context).toBe(Dispatcher);
        expect(spy.calls[0].arguments).toEqual([ testArgs ]);
    });
});
