/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { createPlugin } from '../../utils/PluginsUtils';
import ExtensionsManagerTool from './containers/ExtensionsManagerTool';
import extensionsManager from './reducers/extensionsManager';
import { MANAGER_TOOL_NAME, MANAGER_TOOL_GLYPH } from './constants';

/**
 * Adds an Extensions tab to the manager, where administrators see, install and update extensions.
 * The list is read from the plugins catalog: title, description and version of an extension
 * come from the plugin entry of the `index.json` of its zip. The catalog is the one of the
 * context creator, `contextPluginsConfiguration` in `localConfig.json`.
 * A zip with the plugin name of an installed extension replaces it: the new version is used after
 * the page is reloaded.
 * @name ExtensionsManager
 * @memberof plugins
 * @class
 * @example
 * {
 *   "name": "ExtensionsManager"
 * }
 */
export default createPlugin('ExtensionsManager', {
    component: () => null,
    reducers: { extensionsManager },
    containers: {
        Manager: {
            name: MANAGER_TOOL_NAME,
            position: 5,
            priority: 1,
            glyph: MANAGER_TOOL_GLYPH,
            Component: ExtensionsManagerTool
        }
    }
});
