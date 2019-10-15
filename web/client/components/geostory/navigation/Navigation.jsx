/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {ButtonToolbar} from 'react-bootstrap';

import Toolbar from '../../misc/toolbar/Toolbar';
import ScrollMenu from './ScrollMenu';

/**
 * Navigation Bar for view mode of GeoStory
 * Contains the button to switch to edit mode and the navigation menu.
 * @prop {function} scrollTo handler to scroll to a particular section or id. Gets id of the HTML element as first argument and scroll options as second. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
 * @prop {function} setEditing handler to set edit/view mode. Takes the `editing` flag as argument.
 * @prop {object} story the current story to navigate
 * @prop {object} currentPage contains current `sectionId`
 * @prop {number} currentPosition currentPosition indicates the position of current sections
 * @prop {number} totalItems totalItems is the total number of sections present in the story
 */
export default ({
    scrollTo = () => {},
    setEditing = () => {},
    navigableItems = [],
    currentPage, // current page progress (current page + 1/totPages),
    totalItems = 1,
    currentPosition = 0
}) => {
    return (
        <div className="ms-geostory-navigation-bar">
            <div className="progress-bar" key="progress-bar">
                <div
                    className="progress-percent"
                    style={{
                        width: `${(currentPosition + 1) / totalItems * 100}%`
                    }}
                >
                </div>
            </div>
            <div className="ms-geostory-navigation-initial-toolbar">
                <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md no-border',
                        bsStyle: 'default',
                        tooltipPosition: 'bottom'
                    }}
                    buttons={[
                        {
                            glyph: 'pencil',
                            tooltip: 'navigation.edit',
                            onClick: () => setEditing(true)
                        }
                    ]} />

                <div style={{ flex: 1, display: 'flex' }}>
                    <ButtonToolbar
                        style={{ marginRight: 0, marginLeft: 'auto' }}>
                        <ScrollMenu
                            items={navigableItems}
                            currentPage={currentPage}
                            scrollTo={scrollTo}
                        />
                    </ButtonToolbar>
                </div>
            </div>
        </div>
    );
};
