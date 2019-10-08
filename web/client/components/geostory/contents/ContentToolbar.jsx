
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
import ToolbarButton from '../../misc/toolbar/ToolbarButton';
import Message from '../../I18N/Message';
import withConfirm from "../../misc/toolbar/withConfirm";
const DeleteButton = withConfirm(ToolbarButton);
const BUTTON_CLASSES = 'square-button-md no-border';
const toolButtons = {
    size: ({ size, update = () => {} }) => ({
        Element: () => <ToolbarDropdownButton
            value={size}
            glyph="resize-horizontal"
            tooltipId="geostory.contentToolbar.contentSize"
            options={[{
                value: 'small',
                glyph: 'size-small',
                label: <Message msgId="geostory.contentToolbar.smallSizeLabel"/>
            }, {
                value: 'medium',
                glyph: 'size-medium',
                label: <Message msgId="geostory.contentToolbar.mediumSizeLabel"/>
            }, {
                value: 'large',
                glyph: 'size-large',
                label: <Message msgId="geostory.contentToolbar.largeSizeLabel"/>
            }, {
                value: 'full',
                glyph: 'size-extra-large',
                label: <Message msgId="geostory.contentToolbar.fullSizeLabel"/>
            }]}
            onSelect={(selected) => update('size', selected)}/>
    }),
    align: ({ size, align, update = () => {} }) => ({
        Element: () => <ToolbarDropdownButton
            value={align}
            disabled={size === 'full'}
            glyph="align-center"
            tooltipId="geostory.contentToolbar.contentAlign"
            options={[{
                value: 'left',
                label: <Message msgId="geostory.contentToolbar.leftAlignLabel"/>,
                glyph: 'align-left'
            }, {
                value: 'center',
                label: <Message msgId="geostory.contentToolbar.centerAlignLabel"/>,
                glyph: 'align-center'
            }, {
                value: 'right',
                label: <Message msgId="geostory.contentToolbar.rightAlignLabel"/>,
                glyph: 'align-right'
            }]}
            onSelect={(selected) => update('align', selected)}/>
    }),
    theme: ({ theme, update = () => {}, fit, themeOptions, size }) => ({
        Element: () => <ToolbarDropdownButton
            value={theme}
            glyph="dropper"
            tooltipId="geostory.contentToolbar.contentTheme"
            disabled={fit === 'cover' && size === 'full'}
            options={themeOptions || [{
                value: 'bright',
                label: <Message msgId="geostory.contentToolbar.brightThemeLabel"/>
            }, {
                value: 'bright-text',
                label: <Message msgId="geostory.contentToolbar.brightTextThemeLabel"/>
            }, {
                value: 'dark',
                label: <Message msgId="geostory.contentToolbar.darkThemeLabel"/>
            }, {
                value: 'dark-text',
                label: <Message msgId="geostory.contentToolbar.darkTextThemeLabel"/>
            }]}
            onSelect={(selected) => update('theme', selected)}/>
    }),
    fit: ({ fit, update = () => {} }) => ({
        // using normal ToolbarButton because this is a toggle button without options
        value: fit,
        glyph: fit === "contain" ? "fit-cover" : "fit-contain",
        visible: true,
        tooltipId: fit === "contain" ? "geostory.contentToolbar.cover" : "geostory.contentToolbar.fit",
        onClick: () => update('fit', fit === "contain" ? "cover" : "contain")
    }),
    cover: ({ cover, updateSection = () => {} }) => ({
        // using normal ToolbarButton because this is a toggle button without options
        value: cover,
        glyph: cover ? "height-auto" : "height-view",
        visible: true,
        tooltipId: cover ? "geostory.contentToolbar.contentHeightAuto" : "geostory.contentToolbar.contentHeightView",
        onClick: () => updateSection({cover: !cover}, "merge")
    }),
    editMedia: ({ path, editMedia = () => {} }) => ({
        // using normal ToolbarButton because this has no options
        glyph: "pencil",
        visible: true,
        tooltipId: "geostory.contentToolbar.editMedia",
        onClick: () => {
            editMedia({path});
        }
    }),
    // remove content
    remove: ({ path, remove = () => { } }) => ({
        Element: () => (<DeleteButton
            glyph={"trash"}
            visible
            className={BUTTON_CLASSES}
            tooltipId={"geostory.contentToolbar.remove"}
            confirmTitle={<Message msgId="geostory.contentToolbar.removeConfirmTitle" />}
            confirmContent={<Message msgId="geostory.contentToolbar.removeConfirmContent" />}
            onClick={ () => {
                remove(path);
            }} />)

    })
};

/**
 * Toolbar to update properties of content,
 * @prop {array} tools list of tool's names to display in the edit toolbar, available tools `size`, `align` and `theme`
 * @prop {string} size one of `small`, `medium`, `large` and `full`
 * @prop {string} align one of `left`, `center` and `right`
 * @prop {string} theme one of `bright`, `bright-text`, `dark` and `dark-text`
 * @prop {string} fit one of `contain` and `cover`
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
                    className: BUTTON_CLASSES
                }}
                buttons={tools
                    .filter((id) => toolButtons[id])
                    .map(id => toolButtons[id](props))}/>
        </div>
    );
}
