/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { createStateMocker } from './reducersTestUtils';
import {
    setContext,
    setResource,
    loading
} from '../../actions/context';
import { configureMap } from '../../actions/config';


import context from '../context';
import {
    currentContextSelector,
    resourceSelector,
    isLoadingSelector,
    userPluginsSelector
} from '../../selectors/context';


describe('context reducer', () => {
    const stateMocker = createStateMocker({ context });
    it('loadContext', () => {
        const CONTEXT = {};
        const state = stateMocker(setContext(CONTEXT));
        expect(currentContextSelector(state)).toEqual(CONTEXT);
    });
    it('setResource', () => {
        const RESOURCE = {};
        const state = stateMocker(setResource(RESOURCE));
        expect(resourceSelector(state)).toBe(RESOURCE);
    });
    it('loading', () => {
        const state = stateMocker(loading(true));
        expect(isLoadingSelector(state)).toBe(true);
    });
    it('map config loaded migrates the user plugins of the resource', () => {
        const userPlugins = [{ name: 'Timeline', active: true }, { name: 'MetadataExplorer' }];
        const state = stateMocker(setResource({ data: { userPlugins } }), configureMap({}, 1));
        expect(userPluginsSelector(state)).toEqual([
            { name: 'Timeline', active: true, cfg: { containerPosition: 'bottom' } },
            { name: 'Catalog' }
        ]);
    });
    it('map config loaded migrates the user plugins saved with the map', () => {
        const userPlugins = [{ name: 'Timeline', active: false }];
        const state = stateMocker(
            setResource({ data: { userPlugins: [{ name: 'Timeline', active: true }] } }),
            configureMap({ context: { userPlugins } }, 1)
        );
        expect(userPluginsSelector(state)).toEqual([
            { name: 'Timeline', active: false, cfg: { containerPosition: 'bottom' } }
        ]);
    });

});
