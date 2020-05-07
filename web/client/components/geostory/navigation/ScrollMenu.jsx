/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef  } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import debounce from 'lodash/debounce';
import { useSwipeable } from 'react-swipeable';
import { withResizeDetector } from 'react-resize-detector';

/**
 * One item component
 * selected prop will be passed
*/
const MenuItem = ({ tabindex, text, selected, style }) => {
    return <Button tabindex={tabindex} className={`${selected ? 'active' : 'btn-tray'} btn-xs btn-default`} style={style} >{text}</Button>;
};

/**
 * useSwipeControls: hook to add swipe controls to a list of items
 * @prop {string} direction direction of list, one of `horizontal` or `vertical`, default `horizontal`
 * @prop {number} deltaScroll delta in pixel move left or right while scrolling on the list
 * @prop {number} width width of the container
 * @prop {number} height height of the container
 * @prop {number} transition transition of swipe/scroll in milliseconds
 * @return {object}
 * @example
 *
 * const Menu = ({ width, height, items = [] }) => {
 *
 *     const {
 *         canSwipe, // {boolean} detect if the list of item cha swipe
 *         isStartControlActive, // {boolean} detect if the list has hidden items to the start (useful to display button control)
 *         isEndControlActive, // {boolean} detect if the list has hidden items to the end (useful to display button control)
 *         positionLabel, // {string} position of the list: `start`, `center` or `end`
 *         coordinates, // {object} position of the content
 *         containerPropsHandlers, // required {function} return needed props of container component
 *         contentPropsHandlers, // required {function} return needed props of content component
 *         itemPropsHandlers, // {function} return needed props of item component
 *         updateCoordinates,  // {function} update position of the content
 *         moveItemInViewById,  // {function} move an item in the view
 *         moveToDeltaSize  // {function} move content to left/up or right/down given a delta value in pixel (+delta or -delta)
 *     } = useSwipeControls({
 *         direction: 'horizontal',
 *         width,
 *         height,
 *         transition: 300,
 *         deltaScroll: 200
 *     });
 *
 *     return (
 *         <div
 *             { ...containerPropsHandlers() }
 *             className="swipe-menu">
 *             <div { ...contentPropsHandlers() }>
 *                 {items.map(({ title, id }) => {
 *                     return (
 *                         <div { ...itemPropsHandlers({ id }) }>
 *                             {title}
 *                         </div>
 *                     );
 *                 })}
 *             </div>
 *         </div>
 *     );
 * }
 *
 */

export const useSwipeControls = ({
    direction = 'horizontal',
    deltaScroll,
    width,
    height,
    transition
}) => {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    // store coordinates of for wheel event listener
    const coords = useRef({ x: 0, y: 0 });

    const [canSwipe, setCanSwipe] = useState(false);
    const [positionLabel, setPositionLabel] = useState('start');
    const [status, setStatus] = useState();
    const contentRef = useRef();
    const itemsRefs = useRef({});

    function updateCoordinates(newX, newY) {
        setStatus('move:start');
        const contentNode = contentRef.current;
        const containerNode = contentNode.parentNode;
        const contentBoundingClientRect = contentNode.getBoundingClientRect();
        const containerBoundingClientRect = containerNode.getBoundingClientRect();

        if (direction === 'horizontal') {
            const containerRelativeRight = newX + contentBoundingClientRect.width;
            if (newX < 0 && containerRelativeRight > containerBoundingClientRect.width) {
                setX(newX);
                coords.current.x = newX;
                setPositionLabel('center');
            } else if (newX >= 0) {
                setX(0);
                coords.current.x = 0;
                setPositionLabel('start');
            } else if (containerRelativeRight <= containerBoundingClientRect.width ) {
                setX(containerBoundingClientRect.width - contentBoundingClientRect.width);
                coords.current.x = containerBoundingClientRect.width - contentBoundingClientRect.width;
                setPositionLabel('end');
            }
        }

        if (direction === 'vertical') {
            const containerRelativeBottom = newY + contentBoundingClientRect.height;
            if (newY < 0 && containerRelativeBottom > containerBoundingClientRect.height) {
                setY(newY);
                coords.current.y = newY;
                setPositionLabel('center');
            } else if (newY >= 0) {
                setY(0);
                coords.current.y = 0;
                setPositionLabel('start');
            } else if (containerRelativeBottom <= containerBoundingClientRect.height ) {
                setY(containerBoundingClientRect.height - contentBoundingClientRect.height);
                coords.current.y = containerBoundingClientRect.height - contentBoundingClientRect.height;
                setPositionLabel('end');
            }
        }

        setTimeout(() => {
            setStatus('move:end');
        }, transition);
    }

    function moveToDeltaSize(delta) {
        updateCoordinates(x + delta, y + delta);
    }

    function computeCanSwipe() {
        const contentNode = contentRef.current;
        const containerNode = contentNode.parentNode;
        const contentBoundingClientRect = contentNode.getBoundingClientRect();
        const containerBoundingClientRect = containerNode.getBoundingClientRect();
        if (direction === 'horizontal' && containerBoundingClientRect.width >= contentBoundingClientRect.width
        || direction === 'vertical' && containerBoundingClientRect.height >= contentBoundingClientRect.height) {
            return false;
        }
        return true;
    }

    useEffect(() => {
        function onWheel(event) {
            const newCanSwipe = computeCanSwipe();
            setCanSwipe(computeCanSwipe());
            if (!newCanSwipe) {
                return null;
            }
            const newX = coords.current.x - (event.deltaY > 0 ? deltaScroll : -deltaScroll);
            const newY = coords.current.y - (event.deltaY > 0 ? deltaScroll : -deltaScroll);
            return updateCoordinates(newX, newY);
        }
        const newCanSwipe = computeCanSwipe();
        setCanSwipe(newCanSwipe);
        const contentNode = contentRef.current;
        const containerNode = contentNode.parentNode;
        if (newCanSwipe) {
            // force update new position
            updateCoordinates(coords.current.x, coords.current.y);
        }
        if (newCanSwipe && containerNode && containerNode.addEventListener) {
            containerNode.addEventListener('wheel', onWheel);
        }
        return () => {
            if (newCanSwipe && containerNode && containerNode.removeEventListener) {
                containerNode.removeEventListener('wheel', onWheel);
            }
        };
    }, [width, height]);

    const handlers = useSwipeable({
        onSwiping: (data) => {
            data.event.stopPropagation();
            const newCanSwipe = computeCanSwipe();
            setCanSwipe(computeCanSwipe());

            if (!newCanSwipe) {
                return null;
            }

            const newX = x - data.deltaX * data.velocity;
            const newY = y - data.deltaY * data.velocity;
            return updateCoordinates(newX, newY);
        },
        trackTouch: true,
        trackMouse: true
    });

    function getItemsRef(id, ref) {
        itemsRefs.current = {
            ...itemsRefs.current,
            [id]: ref
        };
    }

    function isItemVisible(id) {
        const itemNode = itemsRefs.current[id];
        if (itemNode) {
            const contentNode = contentRef.current;
            const containerNode = contentNode && contentNode.parentNode;
            const containerBoundingClientRect = containerNode.getBoundingClientRect();
            const itemBoundingClientRect = itemNode.getBoundingClientRect();
            if (direction === 'horizontal') {
                const { width: containerWidth, left: containerLeft } = containerBoundingClientRect;
                const { width: itemWidth, left: itemLeft } = itemBoundingClientRect;

                const containerRight = containerLeft + containerWidth;
                const itemRight = itemLeft + itemWidth;
                const isInView = containerLeft <= itemLeft && containerRight >= itemLeft
                    || containerLeft <= itemRight && containerRight >= itemRight;
                return isInView;
            }
        }
        return false;
    }

    function moveItemInViewById(id, options = {}) {
        const { margin = 0 } = options;
        const itemNode = itemsRefs.current[id];
        if (itemNode) {
            const contentNode = contentRef.current;
            const containerNode = contentNode && contentNode.parentNode;
            const containerBoundingClientRect = containerNode.getBoundingClientRect();
            const itemBoundingClientRect = itemNode.getBoundingClientRect();
            if (direction === 'horizontal') {
                const { width: containerWidth, left: containerLeft } = containerBoundingClientRect;
                const { width: itemWidth, left: itemLeft } = itemBoundingClientRect;

                const containerRight = containerLeft + containerWidth;
                const itemRight = itemLeft + itemWidth;
                const isInView = containerLeft <= itemLeft && containerRight >= itemRight;
                if (!isInView) {
                    const contentClientRect = contentNode.getBoundingClientRect();
                    const { left: contentLeft } = contentClientRect;
                    updateCoordinates(-(itemLeft - contentLeft) + margin, undefined);
                }
            }
            // missing vertical direction
        }
    }

    const isStartControlActive = canSwipe && (positionLabel === 'end' || positionLabel === 'center');
    const isEndControlActive = canSwipe && (positionLabel === 'start' || positionLabel === 'center');

    return {
        status,
        canSwipe,
        isStartControlActive,
        isEndControlActive,
        positionLabel,
        coordinates: { x, y },
        containerPropsHandlers: ({ style = {} } = {}) => ({
            ...handlers,
            style: {
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                height: '100%',
                ...style
            }
        }),
        contentPropsHandlers: ({ style = {} } = {}) => ({
            ref: contentRef,
            style: {
                position: 'absolute',
                display: 'flex',
                ...(transition && { transition: `transform ${transition}ms ease 0s` }),
                flexDirection: direction === 'horizontal' ? 'row' : 'column',
                ...(canSwipe && direction === 'horizontal' && { transform: `translateX(${x}px)` }),
                ...(canSwipe && direction === 'vertical' && { transform: `translateY(${y}px)` }),
                ...style
            }
        }),
        itemPropsHandlers: ({ id, onClick } = {}) => ({
            key: id,
            ref: ref => ref && getItemsRef(id, ref),
            ...(onClick
                ? {
                    onClick,
                    tabindex: isItemVisible(id) ? 0 : -1,
                    onKeyDown: (event) => {
                        if (event.key === 'Enter') {
                            onClick();
                        }
                    }
                }
                : { tabindex: -1 }
            )
        }),
        updateCoordinates,
        moveItemInViewById,
        moveToDeltaSize
    };
};

const ScrollMenu = ({
    currentPage,
    items,
    scrollTo = () => {},
    width,
    height,
    deltaSwipeSize = 200,
    transition = 300,
    updateTimeDebounceTime = 500,
    getItemStyle = () => ({})
}) => {

    const {
        isStartControlActive,
        isEndControlActive,
        containerPropsHandlers,
        contentPropsHandlers,
        itemPropsHandlers,
        moveToDeltaSize,
        moveItemInViewById
    } = useSwipeControls({
        direction: 'horizontal',
        width,
        height,
        transition,
        deltaScroll: deltaSwipeSize
    });

    const currentColumn = currentPage && currentPage.columns && currentPage.sectionId && currentPage.columns[currentPage.sectionId];
    const selected = currentColumn || currentPage && currentPage.sectionId;

    const updateItemInView = useRef(null);
    useEffect(() => {
        updateItemInView.current = debounce((newSelected) => {
            moveItemInViewById(newSelected, {
                margin: 32
            });
        }, updateTimeDebounceTime);
        return () => {
            if (updateItemInView.current) {
                updateItemInView.current.cancel();
                updateItemInView.current = null;
            }
        };
    }, []);
    useEffect(() => {
        if (updateItemInView.current) {
            updateItemInView.current.cancel();
            updateItemInView.current(selected);
        }
    }, [ selected ]);

    return (
        <div
            { ...containerPropsHandlers() }
            className="ms-horizontal-menu">
            <div { ...contentPropsHandlers() }>
                {items.map(({ title, id }) => {
                    const itemProps = itemPropsHandlers({
                        id,
                        onClick: () => {
                            if (currentPage && currentPage.sectionId !== id) {
                                scrollTo(id);
                            }
                        }
                    });
                    return (
                        <div
                            { ...itemProps }
                            className="ms-menu-item">
                            <MenuItem
                                tabindex="-1"
                                id={id}
                                text={title || "title"}
                                selected={id === selected}
                                style={getItemStyle(id === selected)}
                            />
                        </div>
                    );
                })}
            </div>
            {isStartControlActive && <Button
                className="square-button-md no-border"
                style={{ position: 'absolute' }}
                onClick={() => moveToDeltaSize(deltaSwipeSize)}>
                <Glyphicon glyph="chevron-left"/>
            </Button>}
            {isEndControlActive && <Button
                className="square-button-md no-border"
                style={{
                    position: 'absolute',
                    right: 0
                }}
                onClick={() => moveToDeltaSize(-deltaSwipeSize)}>
                <Glyphicon glyph="chevron-right"/>
            </Button>}
        </div>
    );
};

export default withResizeDetector(ScrollMenu);
