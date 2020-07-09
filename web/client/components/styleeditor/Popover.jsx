/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect, useRef, useCallback, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { getConfigProp } from '../../utils/ConfigUtils';
import isFunction from 'lodash/isFunction';

/**
 * Popover used for style components.
 * This component provide a simple implementation of popover without react bootstrap
 * I will center the content on the view if space is not available
 * @memberof components.styleeditor
 * @name ControlledPopover
 * @class
 * @prop {node|function} containerNode container node target for picker overlay or a function that return the target node
 * @prop {object} placement position of popover, one of center, left, right, top, bottom
 * @prop {node} content content of floating popover
 * @prop {boolean} open open/close content
 * @prop {function} onOpen triggered when child is clicked
 */
export function ControlledPopover({
    containerNode: containerNodeProp = () => document.querySelector('.' + (getConfigProp('themePrefix') || 'ms2') + " > div") || document.body,
    placement,
    content,
    children,
    open,
    onOpen = () => {}
}) {

    const margin = 10;
    const containerNode = isFunction(containerNodeProp) ? containerNodeProp() : containerNodeProp;

    const defaultStyle = useRef({
        picker: {
            opacity: 0
        },
        arrow: {
            opacity: 0
        },
        overlay: {}
    });

    const [styles, setStyles] = useState(defaultStyle.current);

    const swatch = useRef();
    const overlay = useRef();
    const popover = useRef();

    const computeStyles = useCallback(
        () => {
            if (!open) {
                return defaultStyle.current;
            }

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
            const popoverBoundingClientRect = popover?.current?.getBoundingClientRect?.();
            if (swatchBoundingClientRect && overlayBoundingClientRect && popoverBoundingClientRect) {
                const {
                    width: popoverWidth,
                    height: popoverHeight
                } = popoverBoundingClientRect;
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

                const isInsideWidth = (swatchCenter[0] - overlayLeft) > (popoverWidth / 2 + margin)
                    && (overlayLeft + overlayWidth) - swatchCenter[0] > (popoverWidth / 2 + margin);

                const isInsideHeight = (swatchCenter[1] - overlayTop) > (popoverHeight / 2 + margin)
                    && (overlayTop + overlayHeight) - swatchCenter[1] > (popoverHeight / 2 + margin);

                const placements = {
                    top: {
                        filter: () => isInsideWidth
                            && swatchTop - overlayTop > popoverHeight + margin,
                        styles: () => {
                            const top = swatchTop - popoverHeight - margin - overlayTop;
                            const left = swatchLeft + swatchWidth / 2 - popoverWidth / 2 - overlayLeft;
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
                            && (overlayLeft + overlayWidth) - (swatchLeft + swatchWidth) > popoverWidth + margin,
                        styles: () => {
                            const top = swatchTop - popoverHeight / 2 - overlayTop;
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
                            && (overlayTop + overlayHeight) - (swatchTop + swatchHeight)  > popoverHeight + margin,
                        styles: () => {
                            const top = swatchTop + swatchHeight + margin - overlayTop;
                            const left = swatchLeft + swatchWidth / 2 - popoverWidth / 2 - overlayLeft;
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
                            && swatchLeft - overlayLeft > popoverWidth + margin,
                        styles: () => {
                            const top = swatchTop - popoverHeight / 2 - overlayTop;
                            const left = swatchLeft - popoverWidth - margin - overlayLeft;
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
            return placementCenterStyle;
        },
        [ placement, open ]
    );

    useEffect(() => {
        setStyles(computeStyles());
        const updateStyleOnResize = () => setStyles(computeStyles());
        window.addEventListener('resize', updateStyleOnResize);
        return () => {
            window.removeEventListener('resize', updateStyleOnResize);
        };
    }, [ computeStyles ]);


    const state = useRef();
    state.current = {
        open
    };

    useEffect(() => {
        function computeActive(event) {
            const popoverNode = popover.current;
            const isTargetContained = popoverNode && event.target && popoverNode.contains(event.target);
            if (state.current.open && !isTargetContained) {
                const { clientX, clientY } = event;
                const { left, top, width, height } = popover?.current?.getBoundingClientRect?.() || {};
                const isOutsidePopover = clientX !== undefined
                    && clientY !== undefined
                    && !(clientX >= left
                        && clientX <= left + width
                        && clientY >= top
                        && clientY <= top + height);
                if (isOutsidePopover) {
                    onOpen(false);
                }
            }
        }
        window.addEventListener('click', computeActive, true);
        window.addEventListener('wheel', computeActive, true);
        window.addEventListener('scroll', computeActive, true);
        return () => {
            window.removeEventListener('click', computeActive, true);
            window.removeEventListener('wheel', computeActive, true);
            window.removeEventListener('scroll', computeActive, true);
        };
    }, [ ]);

    return (
        <>
        <div
            className="ms-popover"
            ref={swatch}>
            {cloneElement(children, {
                onClick: (event) => {
                    event.stopPropagation();
                    const newOpen = !open;
                    onOpen(newOpen);
                }
            })}
        </div>
        {containerNode && open
            ? createPortal(
                <div
                    className="ms-popover-overlay"
                    ref={overlay}
                    style={{
                        position: 'fixed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                        ...styles?.overlay
                    }}>
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            top: 0,
                            left: 0
                        }}
                    />
                    <div
                        ref={popover}
                        style={{
                            pointerEvents: 'auto',
                            ...styles?.picker
                        }}>
                        {content}
                    </div>
                    <div
                        className="ms-popover-arrow"
                        style={{
                            position: 'absolute',
                            borderTop: `${margin - 1}px solid transparent`,
                            borderBottom: `${margin - 1}px solid transparent`,
                            borderRight: `${margin - 1}px solid #ffffff`,
                            filter: 'drop-shadow(-4px 2px 4px rgba(0, 0, 0, 0.2))',
                            ...styles?.arrow
                        }}/>
                </div>, containerNode)
            : null }
        </>
    );
}

function Popover({
    open: openProp,
    onOpen = () => {},
    ...props
}) {
    const [open, setOpen] = useState(openProp);
    return (
        <ControlledPopover
            {...props}
            open={open}
            onOpen={(isOpen) => {
                setOpen(isOpen);
                onOpen(isOpen);
            }}
        />
    );
}

export default Popover;
