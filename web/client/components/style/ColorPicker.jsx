/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
import tinycolor from 'tinycolor2';
import Popover from '../styleeditor/Popover';

/**
 * color picker
 * @prop {string|object} value color value can be expressed as object ({ r: 0, g: 0, b: 0, a: 1 }) or css color string ('#ff0000', 'rgba(255, 0, 0), ...')
 * @prop {string} format format the returned color of onChangeColor function, one of 'rgb', 'prgb', 'hex6', 'hex3', 'hex8', 'name', 'hsl' or 'hsv'
 * @prop {function} onChangeColor return changed color
 * @prop {function} text text inside swatch
 * @prop {function} line show swatch for line style
 * @prop {bool} disabled disable swatch and picker
 * @prop {object} pickerProps props for picker component
 * @prop {node|function} containerNode container node target for picker overlay or a function that return the target node
 * @prop {function} onOpen detect when color picker is open
 * @prop {string} placement preferred placement of picker, one of 'top', 'right', 'bottom' or 'left'
 */
function ColorPicker({
    value,
    format,
    onChangeColor,
    text,
    line,
    disabled,
    pickerProps,
    containerNode,
    onOpen,
    placement
}) {

    const [color, setColor] = useState();
    const valueString = tinycolor(value).toString();

    useEffect(() => {
        const colorString = color && tinycolor(color).toString();
        if (colorString && valueString
        && valueString !== colorString) {
            setColor(value);
        }
    }, [valueString]);

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

    const handleOpen = useRef();
    // keep the function updated to get the correct color value
    handleOpen.current = (isOpen) => {
        onOpen(isOpen);
        if (!isOpen && !disabled && color) {
            onChangeColor(format
                ? tinycolor(color).toString(format)
                : color);
        }
    };

    const disabledClassName = disabled ? ' ms-disabled' : '';

    return (
        <Popover
            disabled={disabled}
            onOpen={(isOpen) => handleOpen.current(isOpen)}
            placement={placement}
            containerNode={containerNode}
            content={
                <SketchPicker
                    {...pickerProps}
                    className="ms-sketch-picker"
                    styles={{
                        picker: {
                            width: 200,
                            padding: '10px 10px 0',
                            boxSizing: 'initial'
                        }
                    }}
                    color={tinycolor(color || value).toRgb()}
                    onChange={(newColor) => setColor(newColor.rgb)}
                />
            }
        >
            <div
                className={`ms-color-picker${disabledClassName}`}>
                <div
                    className="ms-color-picker-swatch"
                    style={getStyle()}
                >
                    {text}
                </div>
            </div>
        </Popover>
    );
}

ColorPicker.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({r: PropTypes.number, g: PropTypes.number, b: PropTypes.number, a: PropTypes.number})
    ]),
    format: PropTypes.string,
    onChangeColor: PropTypes.func,
    text: PropTypes.string,
    line: PropTypes.bool,
    disabled: PropTypes.bool,
    pickerProps: PropTypes.object,
    containerNode: PropTypes.oneOfType([ PropTypes.node, PropTypes.func ]),
    onOpen: PropTypes.function,
    placement: PropTypes.string
};

ColorPicker.defaultProps = {
    disabled: false,
    line: false,
    onChangeColor: () => {},
    pickerProps: {},
    onOpen: () => {}
};

export default ColorPicker;
