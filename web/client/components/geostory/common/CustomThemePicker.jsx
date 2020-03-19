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
import { getConfigProp } from '../../../utils/ConfigUtils';
import SwitchButton from '../../misc/switch/SwitchButton';
import Message from '../../I18N/Message';
import HTML from '../../I18N/HTML';
import tooltip from '../../misc/enhancers/tooltip';

const Button = tooltip(ButtonRB);

function CustomThemePicker({
    theme,
    disableBackgroundAlpha,
    disableTextColor,
    disableShadow,
    containerNode,
    onChange = () => {},
    onOpen
}) {

    const trigger = useRef();
    const backgroundColor = theme?.backgroundColor;
    const color = theme?.color;

    const mostReadableTextColor = !disableTextColor && backgroundColor && color
        && !tinycolor.isReadable(color, backgroundColor)
        ? tinycolor.mostReadable(backgroundColor, [color, '#000000', '#ffffff'], { includeFallbackColors: true }).toHexString()
        : null;

    return (
        <>
        <div className="ms-custom-theme-picker-field">
            <div><Message msgId="geostory.customizeTheme.backgroundColorLabel"/></div>
            <div>
                <ColorSelector
                    key={backgroundColor}
                    containerNode={containerNode}
                    onOpen={onOpen}
                    color={backgroundColor}
                    format={!disableBackgroundAlpha ? 'rgb' : 'hex'}
                    disableAlpha={disableBackgroundAlpha}
                    presetColors={[]}
                    onChangeColor={(newBackgroundColor) => {
                        const borderColor = tinycolor(newBackgroundColor).isLight()
                            ? tinycolor(newBackgroundColor).darken(10).toHexString()
                            : tinycolor(newBackgroundColor).lighten(15).toHexString();
                        const readableTextColor = !disableTextColor && !theme?.color && {
                            color: tinycolor.mostReadable(newBackgroundColor, ['#000000', '#ffffff'], { includeFallbackColors: true }).toHexString()
                        };
                        onChange({
                            ...theme,
                            backgroundColor: newBackgroundColor,
                            borderColor,
                            ...(!disableTextColor && readableTextColor)
                        });
                    }}/>
            </div>
        </div>
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
                                onChange({ ...theme, color: mostReadableTextColor });
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
                    key={color}
                    containerNode={containerNode}
                    color={color}
                    onOpen={onOpen}
                    format="hex"
                    disableAlpha
                    presetColors={[]}
                    onChangeColor={(newColor) => {
                        onChange({
                            ...theme,
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
                    checked={theme?.boxShadow}
                    onChange={() => {
                        const { boxShadow, MozBoxShadow, WebkitBoxShadow, ...newTheme } = theme || {};
                        onChange(boxShadow
                            ? { ...newTheme }
                            : {
                                ...newTheme,
                                boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
                                MozBoxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
                                WebkitBoxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)'
                            });
                    }}
                />
            </div>
        </div>}
        </>
    );
}

export function CustomThemePickerMenuItem({
    value,
    themeStyle,
    storyTheme,
    onUpdate,
    onActive,
    disableBackgroundAlpha,
    disableTextColor,
    disableShadow
}) {

    const handleUpdateTheme = (theme) => {
        onUpdate('theme', theme);
        // store properties of the theme style
        if (isObject(theme)) {
            onUpdate('themeStyle', theme);
        }
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

    const isActive = isObject(value);
    const theme = isActive && value || themeStyle || defaultTheme;

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
                        handleUpdateTheme();
                    }}>
                    <Glyphicon glyph="trash"/>
                </Button>
            </div>
            : <>
            <MenuItem
                active={isActive}
                onClick={() => handleUpdateTheme(theme)}>
                <Message msgId="geostory.contentToolbar.customizeThemeLabel"/>
            </MenuItem>
            </>}
        {isActive &&
        <div className="ms-custom-theme-picker-menuitem">
            <CustomThemePicker
                disableBackgroundAlpha={disableBackgroundAlpha}
                disableTextColor={disableTextColor}
                disableShadow={disableShadow}
                theme={theme}
                onChange={handleUpdateTheme}
                onOpen={onActive}
                containerNode={document.querySelector('.' + (getConfigProp('themePrefix') || 'ms2') + " > div") || document.body}/>
        </div>}
        </>
    );
}

export default CustomThemePicker;
