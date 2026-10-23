/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Alert } from 'react-bootstrap';

import { createPlugin } from '../../utils/PluginsUtils';
import FlexBox from '../../components/layout/FlexBox';
import Spinner from '../../components/layout/Spinner';
import Message from '../../components/I18N/Message';
import ExtensionsList from './components/ExtensionsList';
import useInstalledExtensions from './hooks/useInstalledExtensions';
import { MANAGER_TOOL_NAME, MANAGER_TOOL_GLYPH } from './constants';

function ExtensionsManagerTool() {
    const { extensions, loading, error } = useInstalledExtensions();
    return (
        <FlexBox classNames={['ms-extensions-manager', '_relative', 'ms-main-colors']} column>
            <FlexBox gap="sm" centerChildrenVertically classNames={['_padding-sm']}>
                <FlexBox.Fill>{loading ? <Spinner /> : null}</FlexBox.Fill>
            </FlexBox>
            {error ? <Alert bsStyle="danger"><Message msgId="extensionsManager.loadError" /></Alert> : null}
            <ExtensionsList extensions={extensions} />
        </FlexBox>
    );
}

/**
 * Adds an Extensions tab to the manager, where administrators see the installed extensions.
 * The list is read from the plugins catalog: title, description and version of an extension
 * come from the plugin entry of the `index.json` of its zip. The catalog is the one of the
 * context creator, `contextPluginsConfiguration` in `localConfig.json`.
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
