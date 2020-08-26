/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { getConfigProp } from '../../utils/ConfigUtils';

function MarkerPropertyPicker({
    disabled,
    containerNode,
    onOpen,
    placement,
    children,
    triggerNode
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

    const [styles, setStyles] = useState(defaultStyle);
    const [displayPropertyPicker, setDisplayPropertyPicker] = useState();

    useEffect(() => {
        onOpen(displayPropertyPicker);
        if (!displayPropertyPicker) {
            // reset styles
            setStyles(defaultStyle);
        }
    }, [displayPropertyPicker]);

    const swatch = useRef();
    const overlay = useRef();

    // compute the position of picker and arrow in the view
    function computeStyles() {
        const swatchBoundingClientRect = swatch?.current?.getBoundingClientRect?.();
        const overlayBoundingClientRect = overlay?.current?.getBoundingClientRect?.();
        const sketchPickerNode = overlay?.current?.querySelector?.('.ms-picker-node');
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
        if (displayPropertyPicker) {
            setStyles(computeStyles());
        }
    }, [ displayPropertyPicker ]);

    const disabledClassName = disabled ? ' ms-disabled' : '';

    const pickerContent = (
        <div
            ref={overlay}
            className="ms-property-picker-overlay"
            style={{...styles?.overlay}}>
            <div
                className="ms-property-picker-cover"
                onClick={() => {
                    setDisplayPropertyPicker(false);
                }}/>
            <div
                className="ms-picker-node shadow-soft"
                style={{
                    ...styles?.picker
                }}>
                {children}
            </div>
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
            className={`ms-property-picker${disabledClassName}`}>
            <div
                className="ms-property-picker-swatch"
                ref={swatch}
                style={{ padding: 0, backgroundColor: '#ffffff', boxShadow: 'none' }}
                onClick={ () => {
                    if (!disabled) {
                        setDisplayPropertyPicker(!displayPropertyPicker);
                    }
                }}>
                {triggerNode}
            </div>
            {displayPropertyPicker
                ? content
                : null }
        </div>
    );
}

MarkerPropertyPicker.propTypes = {
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
    containerNode: PropTypes.node,
    onOpen: PropTypes.function,
    placement: PropTypes.string
};

MarkerPropertyPicker.defaultProps = {
    disabled: false,
    line: false,
    onChangeColor: () => {},
    pickerProps: {},
    onOpen: () => {},
    containerNode: document.querySelector('.' + (getConfigProp('themePrefix') || 'ms2') + " > div") || document.body
};

export default MarkerPropertyPicker;
