/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ReactDOM from 'react-dom';
import expect from 'expect';
import {wrapEpics} from '../EpicsUtils';
import {isArray} from "lodash";
import Rx from 'rxjs';
import { ActionsObservable } from 'redux-observable';

describe('EpicsUtils', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('default wrapEpics', () => {
        const sampleEpics = { sampleEpics: (actions$) => actions$.ofType('TEST_ACTION').map(() => ({ type: "NEW_ACTION_TEST" })) };
        const wrapped = wrapEpics(sampleEpics);
        expect(isArray(wrapped)).toBe(true);
    });
    it('custom wrapEpics', () => {
        let counter = 0;
        const customWrapper = (epic) => (...args) => {
            counter++;
            return epic(...args);
        };
        const sampleEpics = { sampleEpics: (actions$) => actions$.ofType('TEST_ACTION').map(() => ({ type: "NEW_ACTION_TEST" })) };
        const wrapped = wrapEpics(sampleEpics, customWrapper);
        expect(isArray(wrapped)).toBe(true);
        expect(wrapped.length).toBe(1);
        const actions = new Rx.Subject();
        const actions$ = new ActionsObservable(actions);
        wrapped[0](actions$);
        expect(counter).toBe(1);
    });
});
