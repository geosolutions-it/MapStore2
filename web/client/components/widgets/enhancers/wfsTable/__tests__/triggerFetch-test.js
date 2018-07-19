/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');

const expect = require('expect');
const triggerFetch = require('../triggerFetch');

describe('triggerFetch stream', () => {

    it('triggerFetch triggers on viewParams changes', (done) => {
        const base = {
            layer: { name: "TEST" },
            options: {propertyName: ["A"]}
        };
        const propsChanges = [base, base, {...base, someUnusedProp: "TEST"}, {
            ...base,
            options: {
                propertyName: base.options.propertyName,
                viewParams: "a:b"
            }
        }];
        triggerFetch(Rx.Observable.from(propsChanges))
            .bufferCount(3)
            .subscribe(
                ([p1, p2]) => {
                    expect(p1.options.viewParams).toNotExist();
                    expect(p2.options.viewParams).toExist();
                    done();
                }
            );
    });
    it('triggerFetch triggers on filter changes', (done) => {
        const base = {
            layer: {name: "TEST"},
            filter: "TEST",
            options: { propertyName: ["A"] }
        };
        const propsChanges = [base, base, { ...base, someUnusedProp: "TEST" }, {
            ...base,
            filter: "TEST2"
        }];
        triggerFetch(Rx.Observable.from(propsChanges))
            .bufferCount(2)
            .subscribe(
                ([p1, p2]) => {
                    expect(p1.filter).toBe("TEST");
                    expect(p2.filter).toBe("TEST2");
                    done();
                }
            );
    });

});
