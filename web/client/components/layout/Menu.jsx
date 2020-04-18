/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import { useSwipeable } from 'react-swipeable';
import { withResizeDetector } from 'react-resize-detector';

import Tab from './Tab';

const useSwipeControls = ({
    direction,
    deltaSwipeSize,
    width,
    height
}) => {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    // store coordinates of tab position for wheel event listener
    const coords = useRef({ x: 0, y: 0 });

    const [isSwipeable, setIsSwipeable] = useState(false);
    const [position, setPosition] = useState('start');
    const contentRef = useRef();

    function computeIsSwipeable() {
        const contentNode = contentRef.current;
        const containerNode = contentNode.parentNode;
        const menuTabsContainerBoundingClientRect = contentNode.getBoundingClientRect();
        const menuTabsBoundingClientRect = containerNode.getBoundingClientRect();
        if (direction === 'horizontal' && menuTabsBoundingClientRect.width >= menuTabsContainerBoundingClientRect.width
        || direction === 'vertical' && menuTabsBoundingClientRect.height >= menuTabsContainerBoundingClientRect.height) {
            return false;
        }
        return true;
    }

    function updateSwipe(deltaX, deltaY) {
        const contentNode = contentRef.current;
        const containerNode = contentNode.parentNode;
        const menuTabsContainerBoundingClientRect = contentNode.getBoundingClientRect();
        const menuTabsBoundingClientRect = containerNode.getBoundingClientRect();

        if (direction === 'horizontal') {
            const containerRelativeRight = deltaX + menuTabsContainerBoundingClientRect.width;
            if (deltaX < 0 && containerRelativeRight > menuTabsBoundingClientRect.width) {
                setX(deltaX);
                coords.current.x = deltaX;
                setPosition('center');
            } else if (deltaX >= 0) {
                setX(0);
                coords.current.x = 0;
                setPosition('start');
            } else if (containerRelativeRight <= menuTabsBoundingClientRect.width ) {
                setX(menuTabsBoundingClientRect.width - menuTabsContainerBoundingClientRect.width);
                coords.current.x = menuTabsBoundingClientRect.width - menuTabsContainerBoundingClientRect.width;
                setPosition('end');
            }
        }

        if (direction === 'vertical') {
            const containerRelativeBottom = deltaY + menuTabsContainerBoundingClientRect.height;
            if (deltaY < 0 && containerRelativeBottom > menuTabsBoundingClientRect.height) {
                setY(deltaY);
                coords.current.y = deltaY;
                setPosition('center');
            } else if (deltaY >= 0) {
                setY(0);
                coords.current.y = 0;
                setPosition('start');
            } else if (containerRelativeBottom <= menuTabsBoundingClientRect.height ) {
                setY(menuTabsBoundingClientRect.height - menuTabsContainerBoundingClientRect.height);
                coords.current.y = menuTabsBoundingClientRect.height - menuTabsContainerBoundingClientRect.height;
                setPosition('end');
            }
        }
    }

    useEffect(() => {
        function onWheel(event) {
            const newIsSwipeable = computeIsSwipeable();
            setIsSwipeable(computeIsSwipeable());
            if (!newIsSwipeable) {
                return null;
            }
            const newX = coords.current.x - (event.deltaY > 0 ? deltaSwipeSize : -deltaSwipeSize);
            const newY = coords.current.y - (event.deltaY > 0 ? deltaSwipeSize : -deltaSwipeSize);
            return updateSwipe(newX, newY);
        }
        const newIsSwipeable = computeIsSwipeable();
        setIsSwipeable(newIsSwipeable);
        const contentNode = contentRef.current;
        const containerNode = contentNode.parentNode;
        if (newIsSwipeable && containerNode && containerNode.addEventListener) {
            containerNode.addEventListener('wheel', onWheel);
        }
        return () => {
            if (newIsSwipeable && containerNode && containerNode.removeEventListener) {
                containerNode.removeEventListener('wheel', onWheel);
            }
        };
    }, [width, height]);

    const handlers = useSwipeable({
        onSwiping: (data) => {
            const newIsSwipeable = computeIsSwipeable();
            setIsSwipeable(computeIsSwipeable());

            if (!newIsSwipeable) {
                return null;
            }

            const newX = x - data.deltaX * data.velocity;
            const newY = y - data.deltaY * data.velocity;
            return updateSwipe(newX, newY);
        },
        trackTouch: true,
        trackMouse: true
    });

    return {
        isSwipeable,
        position,
        x,
        y,
        updateSwipe,
        containerHandlers: handlers,
        contentRef
    };
};

const Menu = ({
    tabs,
    children,
    msStyle,
    onSelect,
    mirror,
    compact,
    overlay,
    direction,
    deltaSwipeSize,
    tabsAlignment,
    width,
    height,
    style,
    contentStyle
}) => {

    const {
        containerHandlers,
        contentRef,
        isSwipeable,
        position,
        x,
        y,
        updateSwipe
    } = useSwipeControls({ direction, deltaSwipeSize, width, height });

    return (
        <div
            className={`ms-menu ms-${msStyle}${mirror ? ' ms-mirror' : ''}${!children && ' ms-closed' || ''} ms-${direction}${(tabsAlignment && !isSwipeable) ? ` ms-${tabsAlignment}` : ''}`}
            style={style}>
            <div
                { ...containerHandlers }
                className={`ms-menu-tabs${overlay && ' ms-overlay' || ''}${tabs.length === 0 && ' ms-empty' || ''}`}>
                <div
                    className="ms-menu-tabs-container"
                    ref={contentRef}
                    style={{
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: direction === 'horizontal' ? 'row' : 'column',
                        ...(isSwipeable && direction === 'horizontal' && { transform: `translateX(${x}px)` }),
                        ...(isSwipeable && direction === 'vertical' && { transform: `translateY(${y}px)` })
                    }}>
                    {(compact && tabs.length > 1 || !compact)
                    && tabs.map(({...props}, idx) => (
                        <Tab
                            overlay={overlay}
                            msStyle={msStyle}
                            {...props}
                            key={idx}
                            onClick={onSelect}
                            mirror={mirror}/>
                    ))}
                </div>
                {isSwipeable && (position === 'end' || position === 'center') && <Button
                    bsStyle={msStyle}
                    className="ms-menu-btn ms-swipe-btn"
                    style={{ position: 'absolute' }}
                    onClick={() => updateSwipe(x + deltaSwipeSize, y + deltaSwipeSize)}>
                    <Glyphicon glyph={direction === 'horizontal' ? 'chevron-left' : 'chevron-up'}/>
                </Button>}
                {isSwipeable && (position === 'start' || position === 'center') && <Button
                    bsStyle={msStyle}
                    className="ms-menu-btn ms-swipe-btn"
                    style={{
                        position: 'absolute',
                        ...(direction === 'horizontal'
                            ? { right: 0 }
                            : { bottom: 0 })
                    }}
                    onClick={() => updateSwipe(x - deltaSwipeSize, y - deltaSwipeSize)}>
                    <Glyphicon glyph={direction === 'horizontal' ? 'chevron-right' : 'chevron-down'}/>
                </Button>}
            </div>
            <div
                className={`ms-menu-content${overlay && ' ms-overlay' || ''}`}
                style={contentStyle}>
                {children}
            </div>
        </div>
    );
};

Menu.propTypes = {
    tabs: PropTypes.array,
    msStyle: PropTypes.string,
    onSelect: PropTypes.func,
    mirror: PropTypes.bool,
    compact: PropTypes.bool,
    overlay: PropTypes.bool,
    direction: PropTypes.string,
    deltaSwipeSize: PropTypes.number,
    tabsAlignment: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    style: PropTypes.object,
    contentStyle: PropTypes.object
};

Menu.defaultProps = {
    tabs: [],
    msStyle: 'primary',
    onSelect: () => {},
    direction: 'vertical',
    deltaSwipeSize: 80,
    style: {},
    contentStyle: {
        width: '100%'
    }
};

export default withResizeDetector(Menu);
