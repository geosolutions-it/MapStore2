/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
import tinycolor from 'tinycolor2';
import { createPortal } from 'react-dom';

function ColorPicker({
    value,
    format,
    onChangeColor,
    text,
    line,
    style,
    disabled,
    pickerProps,
    containerNode,
    onOpen
}) {

    const [color, setColor] = useState();
    const [displayColorPicker, setDisplayColorPicker] = useState();

    useEffect(() => {
        onOpen(displayColorPicker);
    }, [displayColorPicker]);

    function getStyle() {
        const newColor = color || value || 'transparent';
        const rgbaColor = tinycolor(newColor).toRgbString();
        if (line) {
            return {
                boxSizing: 'border-box',
                border: `4px solid ${rgbaColor}`,
                backgroundColor: 'transparent'
            };
        }
        const textColor = newColor === 'transparent'
            ? '#000000'
            : tinycolor.mostReadable(rgbaColor, ['#000000'], { includeFallbackColors: true }).toHexString();
        return {
            color: textColor,
            backgroundColor: rgbaColor
        };
    }
    const disabledClassName = disabled ? ' ms-disabled' : '';

    const pickerContent = (
        <div
            className="ms-color-picker-overlay"
            style={{
                width: style?.width
            }}>
            <div
                className="ms-color-picker-cover"
                onClick={() => {
                    setDisplayColorPicker(false);
                    if (color) {
                        onChangeColor(format
                            ? tinycolor(color).toString(format)
                            : color);
                    }
                }}/>
            <SketchPicker
                {...pickerProps}
                color={tinycolor(color || value).toRgb()}
                onChange={(newColor) => setColor(newColor.rgb)}
            />
        </div>
    );

    const content = containerNode
        ? createPortal(pickerContent, containerNode)
        : pickerContent;

    return (
        <div
            className={`ms-color-picker${disabledClassName}`}>
            <div
                className="ms-color-picker-swatch"
                style={getStyle()}
                onClick={ () => {
                    if (!disabled) {
                        setDisplayColorPicker(!displayColorPicker);
                        if (color) {
                            onChangeColor(format
                                ? tinycolor(color).toString(format)
                                : color);
                        }
                    }
                }}>
                {text}
            </div>
            {displayColorPicker
                ? content
                : null }
        </div>
    );
}

ColorPicker.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({r: PropTypes.number, g: PropTypes.number, b: PropTypes.number, a: PropTypes.number})
    ]),
    onChangeColor: PropTypes.func,
    text: PropTypes.string,
    line: PropTypes.bool,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    pickerProps: PropTypes.object,
    onOpen: PropTypes.function
};

ColorPicker.defaultProps = {
    disabled: false,
    line: false,
    onChangeColor: () => {},
    pickerProps: {},
    onOpen: () => {}
};

export default ColorPicker;
