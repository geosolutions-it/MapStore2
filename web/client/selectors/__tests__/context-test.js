/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import ConfigUtils from '../../utils/ConfigUtils';
import PluginsUtils from '../../utils/PluginsUtils';

import {
    currentContextSelector,
    contextMonitoredStateSelector,
    isLoadingSelector,
    pluginsSelector,
    resourceSelector
} from '../context';
import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';
import context from '../../reducers/context';
import {
    setContext,
    loading,
    setResource
} from '../../actions/context';
import CONTEXT_DATA from '../../test-resources/geostore/data/context_1.json';
import CONTEXT_SHORT_RESOURCE from '../../test-resources/geostore/resources/resource/context_1.json';

const stateMocker = createStateMocker({context});
describe('context selectors', () => {
    it('currentContextSelector', () => {
        expect(currentContextSelector(stateMocker(setContext(CONTEXT_DATA)))).toBe(CONTEXT_DATA);
    });
    it('contextMonitoredStateSelector', () => {
        expect(contextMonitoredStateSelector(stateMocker())).toBe('{}');
    });
    it('isLoadingSelector', () => {
        expect(isLoadingSelector(stateMocker(loading(true)))).toBe(true);
    });
    it('pluginsSelector', () => {
        const contextPlugins = PluginsUtils.makeInternalPluginsConfig(CONTEXT_DATA.plugins);
        const emptyUserPlugins = {
            desktop: [],
            mobile: [],
            embedded: []
        };
        expect(pluginsSelector(stateMocker(setContext(CONTEXT_DATA, contextPlugins, emptyUserPlugins)))).toEqual(contextPlugins);
        // when loading, use default plugins
        const DUMMY_PLUGINS = { mapviewer: {desktop: [{name: "TEST"}]} };
        const OLD_PLUGINS = ConfigUtils.getConfigProp('internalPlugins');
        ConfigUtils.setConfigProp('internalPlugins', DUMMY_PLUGINS);
        expect(pluginsSelector(stateMocker(loading(true)))).toEqual({mapviewer: {desktop: [{name: "TEST"}, {name: "Context"}]}});
        ConfigUtils.setConfigProp('internalPlugins', OLD_PLUGINS);
    });

    it('resourceSelector', () => {
        expect(resourceSelector(stateMocker(setResource(CONTEXT_SHORT_RESOURCE)))).toBe(CONTEXT_SHORT_RESOURCE);
    });
});
