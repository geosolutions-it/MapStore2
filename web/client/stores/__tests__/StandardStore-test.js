
/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import createStore from "../StandardStore";
import { Observable } from 'rxjs';
import {LOAD_MAP_CONFIG} from "../../actions/config";


describe('Test StandardStore', () => {
    it('storeOpts notify is true by default', () => {
        const store = createStore({}, {}, {}, {}, /* storeOpts */{});
        expect(store.addActionListener).toExist();
    });
    it('addActionListener is not available if storeOpts notify is false', () => {
        const store = createStore({}, {}, {}, {}, /* storeOpts */{ notify: false });
        expect(store.addActionListener).toNotExist();
    });
    it('appEpics override standard epics', (done) => {

        const store = createStore({}, {}, {
            loadMapConfigAndConfigureMap: ($action) =>
                $action.ofType(LOAD_MAP_CONFIG).switchMap(() => Observable.of({type: "PONG"}))
        });
        let actions = 0;
        store.addActionListener((action) => {
            actions++;
            if (actions === 2) {
                expect(action.type).toBe("PONG");
                done();
            }
        });
        store.dispatch({
            type: LOAD_MAP_CONFIG
        });
    });
});
