/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { createPlugin } from '../../../utils/PluginsUtils';
import withFlexibleLayoutPanel from '../../../plugins/flexiblelayout/withFlexibleLayoutPanel';

const InfoPanelPlugin = () => {
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%'
            }}>
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    padding: 8
                }}>
                <h4>Right panel example</h4>
                <p style={{ fontStyle: 'italic' }}>
                    This plugin shows how to configure a right panel inside the FlexibleLayout
                </p>
                <pre>
                    {"import React from 'react';\n"}
                    {"import { createPlugin } from '../../../utils/PluginsUtils';\n"}
                    {"import withFlexibleLayoutPanel from '../../../plugins/flexiblelayout/withFlexibleLayoutPanel';\n"}
                    {"\n"}
                    {"const MyPlugin = () => {\n"}
                    {"  return (\n"}
                    {"    <div><h4>Right panel example</h4></div>\n"}
                    {"  );\n"}
                    {"};\n"}
                    {"\n"}
                    {"export default createPlugin('MyPlugin', {\n"}
                    {"  component: withFlexibleLayoutPanel(MyPlugin),\n"}
                    {"  containers: {\n"}
                    {"    FlexibleLayout: {\n"}
                    {"      priority: 1,\n"}
                    {"      glyph: 'question-sign',\n"}
                    {"      position: 1,\n"}
                    {"      size: 'auto',\n"}
                    {"      container: 'right-menu'\n"}
                    {"    }\n"}
                    {"  }\n"}
                    {"});\n"}
                </pre>
                <p style={{ fontStyle: 'italic' }}>
                    Note: <code>withFlexibleLayoutPanel</code> is an HOC that provides resize functionality to the panel
                </p>
                <p style={{ fontStyle: 'italic' }}>
                    All available containers of FlexibleLayout:
                </p>
                <ul>
                    <li><code>body</code></li>
                    <li><code>background</code></li>
                    <li><code>center</code></li>
                    <li><code>left-menu</code>*</li>
                    <li><code>right-menu</code>*</li>
                    <li><code>column</code></li>
                    <li><code>bottom</code></li>
                    <li><code>header</code></li>
                    <li><code>footer</code></li>
                </ul>

                <small>
                    * only these containers accept parameters
                    displayed above in the right panel example,
                    others accept only <code>priority</code> and <code>container</code> parameters
                </small>
            </div>
        </div>
    );
};

export default createPlugin('InfoPanel', {
    component: withFlexibleLayoutPanel(InfoPanelPlugin),
    containers: {
        FlexibleLayout: {
            priority: 1,
            glyph: 'question-sign',
            position: 1,
            size: 'auto',
            container: 'right-menu'
        }
    }
});
