
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import Toolbar from '../../misc/toolbar/Toolbar';
import ToolbarDropdownButton from '../common/ToolbarDropdownButton';
import Message from '../../I18N/Message';

const toolButtons = {
    size: ({ size, update }) => ({
        Element: () => <ToolbarDropdownButton
            value={size}
            glyph="resize-horizontal"
            tooltipId="geostory.contentSize"
            options={[{
                value: 'small',
                label: <Message msgId="geostory.smallSizeLabel"/>
            }, {
                value: 'medium',
                label: <Message msgId="geostory.mediumSizeLabel"/>
            }, {
                value: 'large',
                label: <Message msgId="geostory.largeSizeLabel"/>
            }, {
                value: 'full',
                label: <Message msgId="geostory.fullSizeLabel"/>
            }]}
            onSelect={(selected) => update('size', selected)}/>
    }),
    align: ({ size, align, update }) => ({
        Element: () => <ToolbarDropdownButton
            value={align}
            disabled={size === 'full'}
            glyph="align-center"
            tooltipId="geostory.contentAlign"
            options={[{
                value: 'left',
                label: <Message msgId="geostory.leftAlignLabel"/>,
                glyph: 'align-left'
            }, {
                value: 'center',
                label: <Message msgId="geostory.centerAlignLabel"/>,
                glyph: 'align-center'
            }, {
                value: 'right',
                label: <Message msgId="geostory.rightAlignLabel"/>,
                glyph: 'align-right'
            }]}
            onSelect={(selected) => update('align', selected)}/>
    }),
    theme: ({ theme, update }) => ({
        Element: () => <ToolbarDropdownButton
            value={theme}
            glyph="dropper"
            tooltipId="geostory.contentTheme"
            options={[{
                value: 'bright',
                label: <Message msgId="geostory.brightThemeLabel"/>
            }, {
                value: 'bright-text',
                label: <Message msgId="geostory.brightTextThemeLabel"/>
            }, {
                value: 'dark',
                label: <Message msgId="geostory.darkThemeLabel"/>
            }, {
                value: 'dark-text',
                label: <Message msgId="geostory.darkTextThemeLabel"/>
            }]}
            onSelect={(selected) => update('theme', selected)}/>
    })
};
/**
 * Toolbar to update properties of content,
 * @prop {array} tools list of tool's names to display in the edit toolbar, available tools `size`, `align` and `theme`
 * @prop {string} size one of `small`, `medium`, `large` and `full`
 * @prop {string} align one of `left`, `center` and `right`
 * @prop {string} theme one of `bright`, `bright-text`, `dark` and `dark-text`
 * @prop {function} update handler for select properties events, parameters (key, value)
 * @example
 */
export default function ContentToolbar({
    tools = [],
    ...props
}) {
    return (
        <div className="ms-content-toolbar">
            <Toolbar
                btnDefaultProps={{
                    className: 'square-button-md no-border'
                }}
                buttons={tools
                    .filter((id) => toolButtons[id])
                    .map(id => toolButtons[id](props))}/>
        </div>
    );
}
