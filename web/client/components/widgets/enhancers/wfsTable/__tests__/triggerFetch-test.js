/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import Rx from 'rxjs';

import triggerFetch from '../triggerFetch';

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
    it('triggerFetch with mapSync with mapWidget and dependencies.viewport', (done) => {
        const base = {
            layer: { name: "TEST" },
            mapSync: true,
            dependenciesMap: {
                mapSync: 'widgets[456].mapSync'
            },
            widgets: [
                {
                    id: "123",
                    widgetType: 'table'
                },
                {
                    id: "456",
                    widgetType: 'map'
                }
            ]
        };
        const propsChanges = [
            base, // does not trigger fetch
            {...base, dependencies: { viewport: true }}, // triggers fetch (p1)
            {...base, dependencies: { viewport: false }}, // does not trigger fetch
            {...base, mapSync: false, filter: "changed"} // triggers fetch (p2) (the filter changes due to the viewport)
        ];
        triggerFetch(Rx.Observable.from(propsChanges))
            .bufferCount(4)
            .subscribe(
                ([p1, p2, p3, p4]) => {
                    expect(p1?.dependencies?.viewport).toBe(true);
                    expect(p2).toExist();
                    expect(p3).toNotExist();
                    expect(p4).toNotExist();
                    done();
                }
            );
    });
    it('triggerFetch with mapSync with Standard Map and dependencies.viewport', (done) => {
        const base = {
            layer: { name: "TEST" },
            mapSync: true,
            widgets: [
            ],
            dependenciesMap: {
                mapSync: 'map.mapSync'
            }
        };
        const propsChanges = [
            base, // does not trigger fetch
            {...base, dependencies: { viewport: true }}, // triggers fetch (p1)
            {...base, dependencies: { viewport: false }}, // does not trigger fetch
            {...base, mapSync: false, filter: "changed"} // triggers fetch (p2) (the filter changes due to the viewport)
        ];
        triggerFetch(Rx.Observable.from(propsChanges))
            .bufferCount(4)
            .subscribe(
                ([p1, p2, p3, p4]) => {
                    expect(p1?.dependencies?.viewport).toBe(true);
                    expect(p2).toExist();
                    expect(p3).toNotExist();
                    expect(p4).toNotExist();
                    done();
                }
            );
    });

});
