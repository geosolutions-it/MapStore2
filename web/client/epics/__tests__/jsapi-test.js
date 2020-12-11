/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { generateActionTrigger } from '../jsapi';
import { testEpic } from './epicTestUtils';
describe('jsapi epic', () => {
    it('check jsapi epic triggering', (done) => {
        let {epic, trigger, stop} = generateActionTrigger("B");
        trigger({type: "C"});
        testEpic(epic, 1, [{type: "A"}, {type: "B"}], actions => {
            actions.map((action) => {
                switch (action.type) {
                case "C":
                    stop();
                    done();
                    break;
                default:
                    expect(true).toBe(false);

                }
            });
            done();
        });

    });
});
