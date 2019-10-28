/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Button} from 'react-bootstrap';
import ScrollMenu from 'react-horizontal-scrolling-menu';

import Toolbar from '../../misc/toolbar/Toolbar';

/**
 * One item component
 * selected prop will be passed
*/
const MenuItem = ({text, selected}) => {
    return <Button className={`menu-item ${selected ? 'active' : 'btn-tray'} btn-xs btn-default`} >{text}</Button>;
};

/**
 * All items component
 * Important! add unique key
*/
export const getItems = (list, selected) =>
    list.map(({title, id}) => {
        return <MenuItem text={title || "title"} key={id} id={id} selected={selected} />;
    });

const getArrow = ({ glyph }) => {
    return (
        <Toolbar
            btnDefaultProps={{
                bsSize: 'xs',
                className: 'square-button-md no-border',
                bsStyle: 'default',
                tooltipPosition: 'bottom',
                style: {
                    marginRight: 4
                }
            }}
            buttons={[{
                glyph
            }]}
        />
    );
};

const ArrowLeft = getArrow({ glyph: 'chevron-left' });
const ArrowRight = getArrow({ glyph: 'chevron-right' });

/**
 * Navigation Bar for view mode of GeoStory
*/
export default ({
    currentPage,
    items,
    scrollTo = () => {},
    scrollBy = 3
}) => {
    const currentColumn = currentPage && currentPage.columns && currentPage.sectionId && currentPage.columns[currentPage.sectionId];
    const selected = currentColumn || currentPage && currentPage.sectionId;
    return (
        <div className="ms-horizontal-menu">
            <ScrollMenu
                hideArrows
                hideSingleArrow
                alignCenter={false}
                scrollBy={scrollBy}
                data={getItems(items, currentPage)}
                arrowLeft={ArrowLeft}
                scrollToSelected
                arrowRight={ArrowRight}
                selected={selected}
                onSelect={id => {
                    if (currentPage && currentPage.sectionId !== id) {
                        scrollTo(id);
                    }
                }}
            />
        </div>
    );
};
