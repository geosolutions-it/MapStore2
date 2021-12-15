
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
import withConfirm from "../../misc/withConfirm";
import { CustomThemePickerMenuItem } from '../common/CustomThemePicker';
import isObject from "lodash/isObject";
import isString from "lodash/isString";
const DeleteButton = withConfirm(ToolbarButton);
const BUTTON_CLASSES = 'square-button-md no-border';
const BUTTON_BSSTYLE = { primary: 'btn-primary', "default": 'btn-default'};

const getToolbarSizeProps = (size, sizeType) => {
    const HORIZONTAL = 'horizontal';
    const VERTICAL = 'vertical';
    let pre = '';
    let [hSize, vSize] = size && size.split(',') || [];
    let _size = size;
    let glyph = 'resize-horizontal';
    if (sizeType === HORIZONTAL) {
        pre = 'h-';
        _size = hSize;
    } else if (sizeType === 'vertical') {
        pre = 'v-';
        _size = vSize;
        glyph = 'resize-vertical';
    }
    return {
        sizeProp: (selected) => (
            sizeType
                ? `${sizeType === HORIZONTAL ? selected : hSize},${sizeType === VERTICAL ? selected : vSize}`
                : selected
        ),
        pre, _size, glyph
    };
};

/**
 * these components have been created because it was causing an excessive re-rendering
 */

/**
 * Size dropdown
 * @prop {string} size one of `small`, `medium`, `large` and `full`
 * @prop {string} align one of `left`, `center` and `right`
 * @prop {function} filterOptions filter dropdown options by value (eg `({ value }) => value !== 'full'` to exclude `full` option)
 * @prop {function} pullRight pull dropdown right
 */
export const SizeButtonToolbar = ({editMap: disabled = false, align, sectionType, size, update = () => {}, filterOptions, pullRight, sizeType}) => {
    const {pre, _size, glyph, sizeProp} = getToolbarSizeProps(size, sizeType);
    return (<ToolbarDropdownButton
        value={_size}
        noTooltipWhenDisabled
        disabled={disabled}
        glyph={glyph}
        pullRight={pullRight || (align === "right" || _size === `${pre}full` || _size === `${pre}large`) && !sectionType}
        tooltipId="geostory.contentToolbar.contentSize"
        options={[{
            value: `${pre}small`,
            glyph: 'size-small',
            label: <Message msgId="geostory.contentToolbar.smallSizeLabel"/>
        }, {
            value: `${pre}medium`,
            glyph: 'size-medium',
            label: <Message msgId="geostory.contentToolbar.mediumSizeLabel"/>
        }, {
            value: `${pre}large`,
            glyph: 'size-large',
            label: <Message msgId="geostory.contentToolbar.largeSizeLabel"/>
        }, {
            value: `${pre}full`,
            glyph: 'size-extra-large',
            label: <Message msgId="geostory.contentToolbar.fullSizeLabel"/>
        }].filter((option) => !filterOptions || filterOptions(option))}
        onSelect={(selected) => update('size', sizeProp(selected))}
        {...sizeType && {showSelectionInTitle: false}}
    />);
};

export const AlignButtonToolbar = ({editMap: disabled = false, align, sectionType, size, update = () => {} }) =>
    (<ToolbarDropdownButton
        value={align}
        noTooltipWhenDisabled
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

export const ThemeButtonToolbar = ({editMap: disabled = false, theme, storyTheme, align, sectionType, update = () => {}, themeProps, size}) =>
    (<ToolbarDropdownButton
        value={theme}
        noTooltipWhenDisabled
        pullRight={(align === "right" || size === "full" || size === "large") && !sectionType}
        glyph="dropper"
        tooltipId="geostory.contentToolbar.contentTheme"
        disabled={disabled}
        shouldClose={(value, event) => {
            return isObject(value) && event?.target?.getAttribute?.('class') !== 'ms-color-picker-cover'
            || isString(value)
            || value === undefined;
        }}
        hideMenuItem={(selected, options) => {
            return selected?.value === 'custom' && options?.value !== 'custom';
        }}
        options={[{
            value: '',
            isActive: (current) => current === undefined || current === ''
                || isObject(current) && (current.value === undefined || current.value === ''),
            label: <Message msgId="geostory.contentToolbar.defaultThemeLabel"/>
        }, {
            value: 'bright',
            isActive: (current) => current?.value === 'bright' || current === 'bright',
            label: <Message msgId="geostory.contentToolbar.brightThemeLabel"/>
        }, {
            value: 'dark',
            isActive: (current) => current?.value === 'dark' || current === 'dark',
            label: <Message msgId="geostory.contentToolbar.darkThemeLabel"/>
        }, {
            value: 'custom',
            Component: (props) => (
                <CustomThemePickerMenuItem
                    { ...props }
                    disableBackgroundAlpha={themeProps?.disableBackgroundAlpha}
                    disableShadow={themeProps?.disableShadow}
                    disableTextColor={themeProps?.disableTextColor}
                    onUpdate={update}
                    storyTheme={storyTheme}
                />
            )
        }]}
        onSelect={(value) => update('theme', { ...(isObject(theme) && theme), value })}/>
    );


export const DeleteButtonToolbar = ({ editMap: disabled = false, forceDelBtnDisable = false, path, remove = () => { }, bsStyle }) =>
    (<DeleteButton
        glyph={"trash"}
        visible
        noTooltipWhenDisabled
        disabled={disabled || forceDelBtnDisable}
        className={`${BUTTON_CLASSES} ${bsStyle && BUTTON_BSSTYLE[bsStyle]}`}
        tooltipId={"geostory.contentToolbar.remove"}
        confirmTitle={<Message msgId="geostory.contentToolbar.removeConfirmTitle" />}
        confirmContent={<Message msgId="geostory.contentToolbar.removeConfirmContent" />}
        onClick={ () => {
            remove(path);
        }} />
    );
