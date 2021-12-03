/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import { SketchPicker } from 'react-color';
import tinycolor from 'tinycolor2';
import { createPortal } from 'react-dom';
import { getConfigProp } from '../../utils/ConfigUtils';
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
    containerNode: containerNodeProp,
    onOpen,
    placement
}) {

    const margin = 10;
    const defaultStyle = {
        picker: {
            opacity: 0
        },
        arrow: {
            opacity: 0
        },
        overlay: {}
    };

    const [color, setColor] = useState();
    const [styles, setStyles] = useState(defaultStyle);
    const [displayColorPicker, setDisplayColorPicker] = useState();

    const valueString = tinycolor(value).toString();

    const containerNode = isFunction(containerNodeProp) ? containerNodeProp() : containerNodeProp;

    useEffect(() => {
        const colorString = color && tinycolor(color).toString();
        if (colorString && valueString
        && valueString !== colorString) {
            setColor(value);
        }
    }, [valueString]);

    useEffect(() => {
        onOpen(displayColorPicker);
        if (!displayColorPicker) {
            // reset styles
            setStyles(defaultStyle);
        }
    }, [displayColorPicker]);

    const swatch = useRef();
    const overlay = useRef();

    // compute the position of picker and arrow in the view
    function computeStyles() {
        const placementCenterStyle = {
            picker: {},
            overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
            },
            arrow: {
                opacity: 0
            }
        };

        if (placement === 'center') {
            return placementCenterStyle;
        }
        const swatchBoundingClientRect = swatch?.current?.getBoundingClientRect?.();
        const overlayBoundingClientRect = overlay?.current?.getBoundingClientRect?.();
        const sketchPickerNode = overlay?.current?.querySelector?.('.ms-sketch-picker');
        const sketchPickerBoundingClientRect = sketchPickerNode?.getBoundingClientRect?.();
        if (swatchBoundingClientRect && overlayBoundingClientRect && sketchPickerBoundingClientRect) {
            const {
                width: pickerWidth,
                height: pickerHeight
            } = sketchPickerBoundingClientRect;
            const {
                top: overlayTop,
                left: overlayLeft,
                width: overlayWidth,
                height: overlayHeight
            } = overlayBoundingClientRect;
            const {
                top: swatchTop,
                left: swatchLeft,
                width: swatchWidth,
                height: swatchHeight
            } = swatchBoundingClientRect;

            const swatchCenter = [
                swatchLeft + swatchWidth / 2,
                swatchTop + swatchHeight / 2
            ];

            const isInsideWidth = (swatchCenter[0] - overlayLeft) > (pickerWidth / 2 + margin)
                && (overlayLeft + overlayWidth) - swatchCenter[0] > (pickerWidth / 2 + margin);

            const isInsideHeight = (swatchCenter[1] - overlayTop) > (pickerHeight / 2 + margin)
                && (overlayTop + overlayHeight) - swatchCenter[1] > (pickerHeight / 2 + margin);

            const placements = {
                top: {
                    filter: () => isInsideWidth
                        && swatchTop - overlayTop > pickerHeight + margin,
                    styles: () => {
                        const top = swatchTop - pickerHeight - margin - overlayTop;
                        const left = swatchLeft + swatchWidth / 2 - pickerWidth / 2 - overlayLeft;
                        return {
                            picker: {
                                position: 'absolute',
                                top,
                                left
                            },
                            overlay: {},
                            arrow: {
                                top: swatchTop + 2,
                                left: swatchLeft + swatchWidth / 2,
                                transform: 'translate(-50%, -50%) rotateZ(270deg) translateX(50%)'
                            }
                        };
                    }
                },
                right: {
                    filter: () => isInsideHeight
                        && (overlayLeft + overlayWidth) - (swatchLeft + swatchWidth) > pickerWidth + margin,
                    styles: () => {
                        const top = swatchTop - pickerHeight / 2 - overlayTop;
                        const left = swatchLeft + swatchWidth + margin - overlayLeft;
                        return {
                            picker: {
                                position: 'absolute',
                                top,
                                left
                            },
                            overlay: {},
                            arrow: {
                                top: swatchTop + swatchHeight / 2,
                                left: swatchLeft + swatchWidth - 2,
                                transform: 'translate(-50%, -50%) rotateZ(0deg) translateX(50%)'
                            }
                        };
                    }
                },
                bottom: {
                    filter: () => isInsideWidth
                        && (overlayTop + overlayHeight) - (swatchTop + swatchHeight)  > pickerHeight + margin,
                    styles: () => {
                        const top = swatchTop + swatchHeight + margin - overlayTop;
                        const left = swatchLeft + swatchWidth / 2 - pickerWidth / 2 - overlayLeft;
                        return {
                            picker: {
                                position: 'absolute',
                                top,
                                left
                            },
                            overlay: {},
                            arrow: {
                                top: swatchTop + swatchHeight - 2,
                                left: swatchLeft + swatchWidth / 2,
                                transform: 'translate(-50%, -50%) rotateZ(90deg) translateX(50%)'
                            }
                        };
                    }
                },
                left: {
                    filter: () => isInsideHeight
                        && swatchLeft - overlayLeft > pickerWidth + margin,
                    styles: () => {
                        const top = swatchTop - pickerHeight / 2 - overlayTop;
                        const left = swatchLeft - pickerWidth - margin - overlayLeft;
                        return {
                            picker: {
                                position: 'absolute',
                                top,
                                left
                            },
                            overlay: {},
                            arrow: {
                                top: swatchTop + swatchHeight / 2,
                                left: swatchLeft + 2,
                                transform: 'translate(-50%, -50%) rotateZ(180deg) translateX(50%)'
                            }
                        };
                    }
                }
            };

            if (placements?.[placement]?.filter?.()) {
                return placements?.[placement]?.styles?.();
            }

            if (placement !== 'top' && placements.top.filter()) {
                return placements.top.styles();
            }

            if (placement !== 'right' && placements.right.filter()) {
                return placements.right.styles();
            }

            if (placement !== 'bottom' && placements.bottom.filter()) {
                return placements.bottom.styles();
            }

            if (placement !== 'left' && placements.left.filter()) {
                return placements.left.styles();
            }
        }

        // render as centered picker if it's not possible to place near the swatch
        return {
            picker: {},
            overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
            },
            arrow: {
                opacity: 0
            }
        };
    }
    useEffect(() => {
        const updateStyleOnResize = () => setStyles(computeStyles());
        window.addEventListener('resize', updateStyleOnResize);
        return () => {
            window.removeEventListener('resize', updateStyleOnResize);
        };
    }, []);
    useEffect(() => {
        if (displayColorPicker) {
            setStyles(computeStyles());
        }
    }, [ displayColorPicker ]);


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
            ref={overlay}
            className="ms-color-picker-overlay"
            style={{
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                ...styles?.overlay
            }}>
            <div
                className="ms-color-picker-cover"
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0
                }}
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
                className="ms-sketch-picker"
                styles={{
                    picker: {
                        width: 200,
                        padding: '10px 10px 0',
                        boxSizing: 'initial',
                        ...styles?.picker
                    }
                }}
                color={tinycolor(color || value).toRgb()}
                onChange={(newColor) => setColor(newColor.rgb)}
            />
            <div
                className="ms-sketch-picker-arrow"
                style={{
                    position: 'absolute',
                    borderWidth: margin + 2,
                    ...styles?.arrow
                }}/>
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
                ref={swatch}
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
    onOpen: () => {},
    containerNode: () => document.querySelector('.' + (getConfigProp('themePrefix') || 'ms2') + " > div") || document.body
};

export default ColorPicker;
