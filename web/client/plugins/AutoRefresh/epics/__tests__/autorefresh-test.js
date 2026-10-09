/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import Rx from 'rxjs';
import { ActionsObservable } from 'redux-observable';
import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from '../../../../epics/__tests__/epicTestUtils';
import { CHANGE_LAYER_PROPERTIES, removeNode, updateNode } from '../../../../actions/layers';
import { autoRefreshPause, autoRefreshStart, autoRefreshStop } from '../../actions/autorefresh';
import { layersAutoRefreshEpic } from '../autorefresh';
import autorefresh from '../../reducers/autorefresh';
import { NodeTypes } from '../../../../utils/LayersUtils';
import { generateAutoRefreshLayerOptions } from '../../constants';

describe('AutoRefresh epics', () => {
    const getState = (actions = [], layers = []) => () => ({
        autorefresh: actions.reduce(autorefresh, undefined),
        layers: {
            flat: layers
        }
    });

    it('refreshes every active non-background layer immediately', (done) => {
        const layers = [
            { id: 'roads', group: 'overlay', autoRefreshInterval: 60 },
            { id: 'buildings', group: 'overlay', autoRefreshInterval: 120 },
            { id: 'basemap', group: 'background', autoRefreshInterval: 60 },
            { id: 'disabled', group: 'overlay', autoRefreshInterval: -1 }
        ];

        testEpic(layersAutoRefreshEpic, 2, autoRefreshStart(), actions => {
            expect(actions.map(action => action.type)).toEqual([
                CHANGE_LAYER_PROPERTIES,
                CHANGE_LAYER_PROPERTIES
            ]);
            expect(actions.map(action => action.layer).sort()).toEqual(['buildings', 'roads']);
            actions.forEach(action => expect(action.newProperties._v_).toBeGreaterThan(0));
            done();
        }, getState([autoRefreshStart()], layers), done);
    });

    it('does not refresh layers when auto refresh is disabled', (done) => {
        testEpic(addTimeoutEpic(layersAutoRefreshEpic, 10), 1, autoRefreshStart(), actions => {
            expect(actions.length).toBe(1);
            expect(actions).toEqual([{ type: TEST_TIMEOUT, timeout: 10 }]);
            done();
        }, getState([autoRefreshStart(), autoRefreshStop()], [{ id: 'roads', group: 'overlay', autoRefreshInterval: 30 }]), done);
    });

    it('does not refresh layers when auto refresh is paused', (done) => {
        testEpic(addTimeoutEpic(layersAutoRefreshEpic, 31), 1, autoRefreshStart(), actions => {
            expect(actions.length).toBe(1);
            expect(actions).toEqual([{ type: TEST_TIMEOUT, timeout: 31 }]);
            done();
        }, getState([autoRefreshStart(), autoRefreshPause(true)], [{ id: 'roads', group: 'overlay', autoRefreshInterval: 30 }]), done);
    });

    it('does not refresh background or disabled layers', (done) => {
        const layers = [
            { id: 'basemap', group: 'background', autoRefreshInterval: 60 },
            { id: 'disabled', group: 'overlay', autoRefreshInterval: -1 }
        ];

        testEpic(addTimeoutEpic(layersAutoRefreshEpic, 10), 1, autoRefreshStart(), actions => {
            expect(actions.length).toBe(1);
            expect(actions).toEqual([{ type: TEST_TIMEOUT, timeout: 10 }]);
            done();
        }, getState([autoRefreshStart()], layers), done);
    });

    it('does not refresh layer when one layer is removed from the map', (done) => {
        let layers = [
            { id: 'roads', group: 'overlay', autoRefreshInterval: 30 },
            { id: 'buildings', group: 'overlay', autoRefreshInterval: 30 },
            { id: 'lakes', group: 'overlay', autoRefreshInterval: 60 }
        ];
        const actions = new Rx.Subject();
        const store = {
            getState: () => getState([autoRefreshStart()], layers)()
        };

        layersAutoRefreshEpic(new ActionsObservable(actions), store)
            .subscribe(action => {
                expect(action.type).toBe(CHANGE_LAYER_PROPERTIES);
                expect(action.layer).toBe('lakes');
                done();
            }, done);

        layers = layers.filter(layer => layer.id !== 'roads');
        actions.next(removeNode('roads', 'layers', false));
        layers = layers.filter(layer => layer.id !== 'buildings');
        actions.next(removeNode('buildings', 'layers', false));
    });

    it('does not refresh layer when one layer is removed from the autorefresh menu', (done) => {
        let layers = [
            { id: 'roads', group: 'overlay', autoRefreshInterval: 30 },
            { id: 'buildings', group: 'overlay', autoRefreshInterval: 30 },
            { id: 'lakes', group: 'overlay', autoRefreshInterval: 60 }
        ];
        const actions = new Rx.Subject();
        const store = {
            getState: () => getState([autoRefreshStart()], layers)()
        };

        layersAutoRefreshEpic(new ActionsObservable(actions), store)
            .subscribe(action => {
                expect(action.type).toBe(CHANGE_LAYER_PROPERTIES);
                expect(action.layer).toBe('lakes');
                done();
            }, done);

        layers = layers.map(layer => {
            if (layer.id === 'roads') {
                return { ...layer, autoRefreshInterval: -1 };
            }
            return layer;
        });
        actions.next(updateNode('roads', NodeTypes.LAYER, generateAutoRefreshLayerOptions(-1)));
        layers = layers.map(layer => {
            if (layer.id === 'buildings') {
                return { ...layer, autoRefreshInterval: -1 };
            }
            return layer;
        });
        actions.next(updateNode('buildings', NodeTypes.LAYER, generateAutoRefreshLayerOptions(-1)));
    });
});
