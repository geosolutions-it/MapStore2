/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import ColorSelector from '../../style/ColorSelector';
import isObject from 'lodash/isObject';
import tinycolor from 'tinycolor2';
import { Button as ButtonRB, MenuItem, Glyphicon } from 'react-bootstrap';
import ToolbarPopover from './ToolbarPopover';
import SwitchButton from '../../misc/switch/SwitchButton';
import Message from '../../I18N/Message';
import HTML from '../../I18N/HTML';
import tooltip from '../../misc/enhancers/tooltip';

const Button = tooltip(ButtonRB);
/**
 * CustomThemePicker: compact theme input fields provides editing for text, background and shadow
 * @prop {object} themeStyle theme object
 * @prop {string} themeStyle.color theme text color css style
 * @prop {string} themeStyle.backgroundColor theme background color css style
 * @prop {string} themeStyle.boxShadow theme box shadow css style
 * @prop {bool} disableBackgroundAlpha disable alpha for background color picker
 * @prop {bool} disableTextColor disable text color input field
 * @prop {bool} disableShadow disable shadow input field
 * @prop {function} onChange return changed theme
 * @prop {function} onOpen detect when color picker is open
 * @prop {string} placement preferred placement of picker, one of `top`, `right`, `bottom` or `left`
 */
function CustomThemePicker({
    themeStyle,
    disableBackgroundPicker = false,
    disableBackgroundAlpha,
    disableTextColor,
    disableShadow,
    onChange = () => {},
    onOpen = () => {},
    placement
}) {

    const trigger = useRef();
    const backgroundColor = themeStyle?.backgroundColor;
    const color = themeStyle?.color;

    const mostReadableTextColor = !disableTextColor && backgroundColor && color
        && !tinycolor.isReadable(color, backgroundColor)
        ? tinycolor.mostReadable(backgroundColor, [color, '#000000', '#ffffff'], { includeFallbackColors: true }).toHexString()
        : null;

    return (
        <>
        {!disableBackgroundPicker && (
            <div className="ms-custom-theme-picker-field">
                <div><Message msgId="geostory.customizeTheme.backgroundColorLabel"/></div>
                <div>
                    <ColorSelector
                        placement={placement}
                        key={backgroundColor}
                        onOpen={onOpen}
                        color={backgroundColor}
                        format={!disableBackgroundAlpha ? 'rgb' : 'hex'}
                        disableAlpha={disableBackgroundAlpha}
                        presetColors={[]}
                        onChangeColor={(newBackgroundColor) => {
                            const borderColor = tinycolor(newBackgroundColor).isLight()
                                ? tinycolor(newBackgroundColor).darken(10).toHexString()
                                : tinycolor(newBackgroundColor).lighten(15).toHexString();
                            const readableTextColor = !disableTextColor && !themeStyle?.color && {
                                color: tinycolor.mostReadable(newBackgroundColor, ['#000000', '#ffffff'], { includeFallbackColors: true }).toHexString()
                            };
                            onChange({
                                ...themeStyle,
                                backgroundColor: newBackgroundColor,
                                borderColor,
                                ...(!disableTextColor && readableTextColor)
                            });
                        }}/>
                </div>
            </div>
        )}
        {!disableTextColor &&
        <div className="ms-custom-theme-picker-field">
            <div>
                <div><Message msgId="geostory.customizeTheme.textColorLabel"/></div>
                <ToolbarPopover
                    className="ms-custom-theme-picker-popover"
                    ref={(popover) => {
                        if (popover) {
                            trigger.current = popover.trigger;
                        }
                    }}
                    placement="top"
                    content={
                        <>
                        <HTML
                            msgId="geostory.customizeTheme.alternativeTextColorPopover"
                            msgParams={{
                                color: mostReadableTextColor
                            }}/>
                        <Button
                            bsSize="xs"
                            bsStyle="primary"
                            style={{
                                margin: 'auto',
                                display: 'block'
                            }}
                            onClick={() =>  {
                                onChange({ ...themeStyle, color: mostReadableTextColor });
                                trigger.current?.hide?.();
                            }}>
                            <Message msgId="geostory.customizeTheme.useAlternativeTextColor"/>
                        </Button>
                        </>
                    }>
                    {mostReadableTextColor && <Button
                        className="square-button-md no-border"
                        style={{ display: mostReadableTextColor ? 'block' : 'none' }}>
                        <Glyphicon glyph="exclamation-mark"/>
                    </Button> || <div />}
                </ToolbarPopover>
            </div>
            <div>
                <ColorSelector
                    placement={placement}
                    key={color}
                    color={color}
                    onOpen={onOpen}
                    format="hex"
                    disableAlpha
                    presetColors={[]}
                    onChangeColor={(newColor) => {
                        onChange({
                            ...themeStyle,
                            color: newColor
                        });
                    }}/>
            </div>
        </div>}
        {!disableShadow &&
        <div className="ms-custom-theme-picker-field">
            <div><Message msgId="geostory.customizeTheme.shadowLabel"/></div>
            <div>
                <SwitchButton
                    checked={themeStyle?.boxShadow}
                    onChange={() => {
                        const { boxShadow, MozBoxShadow, WebkitBoxShadow, ...newTheme } = themeStyle || {};
                        onChange(boxShadow
                            ? { ...newTheme }
                            : {
                                ...newTheme,
                                boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)'
                            });
                    }}
                />
            </div>
        </div>}
        </>
    );
}

export function CustomThemePickerMenuItem({
    selected,
    value,
    storyTheme,
    onUpdate,
    onActive,
    disableBackgroundAlpha,
    disableTextColor,
    disableShadow
}) {

    const handleUpdateTheme = (key, themeStyle) => {
        const selectedTheme = isObject(selected) && selected;
        if (themeStyle) {
            return onUpdate('theme', {
                ...selectedTheme,
                value: key,
                [value]: {
                    ...themeStyle
                }
            });
        }
        return onUpdate('theme', {
            ...selectedTheme,
            value: key
        });
    };

    const {
        color,
        backgroundColor
    } = storyTheme || {};

    const storyThemeColorProperty = !disableTextColor && color && { color };
    const storyThemeBackgroundColor = backgroundColor && { backgroundColor };
    const defaultTheme = {
        ...storyThemeColorProperty,
        ...storyThemeBackgroundColor
    };

    const isActive = selected?.value === value;
    const themeStyle = selected?.[value] || defaultTheme;

    return (
        <>
        {isActive ?
            <div
                className="ms-custom-theme-picker-menuitem-header">
                <div><Message msgId="geostory.contentToolbar.customizeThemeLabel"/></div>
                <Button
                    tooltipId="geostory.contentToolbar.customizeThemeRemoveLabel"
                    className="square-button-md no-border"
                    onClick={(event) => {
                        event.stopPropagation();
                        handleUpdateTheme('');
                    }}>
                    <Glyphicon glyph="trash"/>
                </Button>
            </div>
            : <>
            <MenuItem
                active={isActive}
                onClick={() => handleUpdateTheme(value, themeStyle)}>
                <Message msgId="geostory.contentToolbar.customizeThemeLabel"/>
            </MenuItem>
            </>}
        {isActive &&
        <div className="ms-custom-theme-picker-menuitem">
            <CustomThemePicker
                disableBackgroundAlpha={disableBackgroundAlpha}
                disableTextColor={disableTextColor}
                disableShadow={disableShadow}
                themeStyle={themeStyle}
                onChange={(newTheme) => handleUpdateTheme(value, newTheme)}
                onOpen={onActive}
            />
        </div>}
        </>
    );
}

export default CustomThemePicker;
