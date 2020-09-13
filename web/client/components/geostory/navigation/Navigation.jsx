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
import isObject from 'lodash/isObject';

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
 * @prop {boolean} enableScrollOnLoad should scroll to the element after loading
 * @prop {function} updateUrlOnScroll dispatches enableScrollOnLoad to the geostory reducer
 */
export default ({
    settings,
    scrollTo = () => {},
    navigableItems = [],
    currentPage = {}, // current page progress (current page + 1/totPages),
    totalItems = 1,
    currentPosition = 0,
    router,
    buttons = []
}) => {
    const theme = settings?.theme?.general;
    const {
        fontFamily,
        borderColor,
        color,
        backgroundColor
    } = isObject(theme) && theme || {};

    const {
        isTitleEnabled,
        isLogoEnabled,
        isNavbarEnabled
    } = settings || {};
    const isToolbarEnabled = buttons.length > 0;
    const isHomeButtonEnabled = router &&
        router.pathname &&
        router.search &&
        getQueryParams(router.search).showHome === 'true' &&
        router.pathname.includes('/geostory/shared');
    const isNavbarVisible = isNavbarEnabled && navigableItems?.length > 0;

    const isVisible = isTitleEnabled
        || isLogoEnabled
        || isNavbarVisible
        || isToolbarEnabled
        || isHomeButtonEnabled;

    return (
        <div
            className="ms-geostory-navigation-bar"
            style={{
                color,
                backgroundColor,
                ...(borderColor && { borderBottom: `1px solid ${borderColor}` }),
                fontFamily
            }}>
            <div
                className="progress-bar"
                key="progress-bar"
                style={{
                    backgroundColor: borderColor
                }}>
                <div
                    className="progress-percent"
                    style={{
                        width: `${(currentPosition + 1) / totalItems * 100}%`,
                        backgroundColor: color
                    }}
                />
            </div>
            {isVisible && <div className="ms-geostory-navigation-tools">

                <div className="ms-geostory-navigation-toolbar">
                    <Toolbar buttons={buttons} />
                    {
                        isHomeButtonEnabled && (
                            <Home
                                bsStyle="default"
                                className="square-button-md no-border"
                                tooltipPosition="right"
                                renderUnsavedMapChangesDialog={false}
                            />
                        )
                    }
                </div>
                <div className="ms-geostory-navigation-elements">
                    {isNavbarVisible ?
                        (<div className="ms-geostory-navigation-navigable-items">
                            <ScrollMenu
                                items={navigableItems}
                                currentPage={currentPage}
                                scrollTo={scrollTo}
                                getItemStyle={(isSelected) => !isSelected
                                    ? {
                                        outlineColor: color,
                                        borderColor: color
                                    }
                                    : {
                                        color: backgroundColor,
                                        backgroundColor: color
                                    }}
                            />
                        </div>) : null}
                    <div className="ms-geostory-navigation-metadata">
                        {isTitleEnabled &&
                            <div className="ms-geostory-navigation-title" style={{fontSize: settings.storyTitleFontSize || "14px"}}>
                                {settings.storyTitle}
                            </div>
                        }
                        {isLogoEnabled &&
                            <div className="ms-geostory-navigation-logo">
                                <img src={settings.thumbnail && (settings.thumbnail.data || settings.thumbnail.url) || ""} height={32}/>
                            </div>
                        }
                    </div>
                </div>
            </div>}
        </div>
    );
};
