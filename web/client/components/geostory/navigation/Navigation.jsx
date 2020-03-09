/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Toolbar from '../../misc/toolbar/Toolbar';
import ScrollMenu from './ScrollMenu';
import Home from '../../../components/home/Home';
import { getQueryParams } from '../../../utils/URLUtils';

/**
 * Navigation Bar for view mode of GeoStory
 * Contains the button to switch to edit mode and the navigation menu.
 * @prop {function} scrollTo handler to scroll to a particular section or id. Gets id of the HTML element as first argument and scroll options as second. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
 * @prop {object} story the current story to navigate
 * @prop {object} currentPage contains current `sectionId`
 * @prop {number} currentPosition currentPosition indicates the position of current sections
 * @prop {number} totalItems totalItems is the total number of sections present in the story
 * @prop {object} router router object in store contains location data
 * @prop {array} buttons array of buttons for Toolbar
 */
export default ({
    settings,
    scrollTo = () => {},
    navigableItems = [],
    currentPage, // current page progress (current page + 1/totPages),
    totalItems = 1,
    currentPosition = 0,
    router,
    buttons = []
}) => {
    return (
        <div className="ms-geostory-navigation-bar">
            <div className="progress-bar" key="progress-bar">
                <div
                    className="progress-percent"
                    style={{
                        width: `${(currentPosition + 1) / totalItems * 100}%`
                    }}
                />
            </div>
            <div className="ms-geostory-navigation-tools">

                <div className="ms-geostory-navigation-toolbar">
                    <Toolbar buttons={buttons} />
                </div>
                {
                    router &&
                    router.pathname &&
                    router.search &&
                    getQueryParams(router.search).showHome === 'true' &&
                    router.pathname.includes('/geostory/shared') && (
                        <Home
                            bsStyle="default"
                            className="square-button-md no-border"
                            tooltipPosition="right"
                            renderUnsavedMapChangesDialog={false}
                        />
                    )
                }
                <div className="ms-geostory-navigation-elements">
                    {navigableItems && navigableItems.length && settings && settings.isNavbarEnabled ?
                        (<div className="ms-geostory-navigation-navigableItems">
                            <ScrollMenu
                                items={navigableItems}
                                currentPage={currentPage}
                                scrollTo={scrollTo}
                            />
                        </div>) : null}
                    <div className="ms-geostory-navigation-metadata">
                        {settings && settings.isLogoEnabled &&
                            <div className="ms-geostory-navigation-logo">
                                <img src={settings.thumbnail && (settings.thumbnail.data || settings.thumbnail.url) || ""} height={32}/>
                            </div>
                        }
                        {settings && settings.isTitleEnabled &&
                            <div className="ms-geostory-navigation-title">
                                {settings.storyTitle}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};
