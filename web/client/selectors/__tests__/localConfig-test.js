/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    localConfigSelector,
    pluginsObjectSelector,
    pluginsSelectorCreator
} from '../localConfig';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';
import localConfig from '../../reducers/localConfig';
import {
    localConfigLoaded
} from '../../actions/localConfig';
import LOCAL_CONFIG from '../../localConfig';
import {find, includes} from 'lodash';

const stateMocker = createStateMocker({localConfig});
const TEST_CONFIG = {
    test: "CONFIG",
    plugins: {
        desktop: ["TEST"],
        mobile: ["TEST_MOBILE"]
    }
};
describe('localConfig selectors', () => {
    it('localConfigSelector', () => {
        expect(localConfigSelector(stateMocker(localConfigLoaded(TEST_CONFIG))).proxyUrl).toBe('/mapstore/proxy/?url=');
        expect(localConfigSelector(stateMocker(localConfigLoaded(TEST_CONFIG))).test).toBe("CONFIG");
    });
    it('pluginsObjectSelector', () => {
        expect(pluginsObjectSelector(stateMocker(localConfigLoaded(TEST_CONFIG)))).toBe(TEST_CONFIG.plugins);
    });
    it('pluginsSelectorCreator', () => {
        expect(pluginsSelectorCreator('desktop')(stateMocker(localConfigLoaded(TEST_CONFIG)))).toBe(TEST_CONFIG.plugins.desktop);
    });

    it('pluginSelectorCreator for dashboard', ()=>{
        const loadedConfig = (pluginsSelectorCreator('dashboard')(stateMocker(localConfigLoaded(LOCAL_CONFIG))));
        expect(includes(loadedConfig, 'DashboardSave')).toBe(true);
        expect(includes(loadedConfig, 'DashboardSaveAs')).toBe(true);
        expect(find(loadedConfig, { "name": "Share"})).toContain({ "name": "Share"});
        expect(find(loadedConfig, { "name": "Share"}).cfg).toContain({ "embedPanel": false});
        expect(find(loadedConfig, { "name": "Share"}).cfg).toContain({ "advancedSettings": false});
    });

});
