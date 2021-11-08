/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef  } from 'react';
import { Glyphicon } from 'react-bootstrap';
import debounce from 'lodash/debounce';
import useSwipeControls from '../common/hooks/useSwipeControls';
import { withResizeDetector } from 'react-resize-detector';
import { SectionTypes } from '../../../utils/GeoStoryUtils';

import Button from '../../misc/Button';

/**
 * One item component
 * selected prop will be passed
*/
const MenuItem = ({ tabindex, text, selected, style }) => {
    return <Button tabindex={tabindex} className={`${selected ? 'active' : 'btn-tray'} btn-xs btn-default`} style={style} >{text}</Button>;
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

    /**
     * Indicates which MenuItem is currently active.
     * In case of GeoCarousel, it checks with sectionId since selectedId would be an inner column
     * @param {String} itemId column Id or section Id of current page
     * @param {String} selectedId Id of navigation item for current page
     * @param {String} type type of geostory section (Paragraph, Carousel, etc)
     * @returns a Boolean telilng if MenuItem id corresponds to the id of current page
     */
    const selectedItem = (itemId, selectedId, type) => {
        if (type === SectionTypes.CAROUSEL) {
            return currentPage && currentPage.sectionId === itemId;
        }
        return selectedId === itemId;
    };

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
                {items.map(({ title, id, type }) => {
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
                                selected={selectedItem(id, selected, type)}
                                style={getItemStyle(selectedItem(id, selected, type))}
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
