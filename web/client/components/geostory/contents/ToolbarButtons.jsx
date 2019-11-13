
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import Message from '../../I18N/Message';
import ToolbarButton from '../../misc/toolbar/ToolbarButton';
import ToolbarDropdownButton from '../common/ToolbarDropdownButton';
import withConfirm from "../../misc/toolbar/withConfirm";
const DeleteButton = withConfirm(ToolbarButton);
const BUTTON_CLASSES = 'square-button-md no-border';

/**
 * these components have been created because it was causing an excessive re-rendering
 */

export const SizeButtonToolbar = ({editMap: disabled = false, align, sectionType, size, update = () => {} }) =>
    (<ToolbarDropdownButton
        value={size}
        disabled={disabled}
        glyph="resize-horizontal"
        pullRight={(align === "right" || size === "full" || size === "large") && !sectionType}
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
    );

export const AlignButtonToolbar = ({editMap: disabled = false, align, sectionType, size, update = () => {} }) =>
    (<ToolbarDropdownButton
        value={align}
        disabled={size === 'full' || disabled}
        glyph="align-center"
        pullRight={(align === "right" || size === "full" || size === "large") && !sectionType}
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
    );

export const ThemeButtonToolbar = ({editMap: disabled = false, theme, align, sectionType, update = () => {}, fit, themeOptions, size }) =>
    (<ToolbarDropdownButton
        value={theme}
        pullRight={(align === "right" || size === "full" || size === "large") && !sectionType}
        glyph="dropper"
        tooltipId="geostory.contentToolbar.contentTheme"
        disabled={fit === 'cover' && size === 'full' || disabled}
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
    );


export const DeleteButtonToolbar = ({ editMap: disabled = false, path, remove = () => { } }) =>
    (<DeleteButton
        glyph={"trash"}
        visible
        disabled={disabled}
        className={BUTTON_CLASSES}
        tooltipId={"geostory.contentToolbar.remove"}
        confirmTitle={<Message msgId="geostory.contentToolbar.removeConfirmTitle" />}
        confirmContent={<Message msgId="geostory.contentToolbar.removeConfirmContent" />}
        onClick={ () => {
            remove(path);
        }} />
    );
