/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Toolbar from '../../misc/toolbar/Toolbar';
import {ButtonToolbar} from 'react-bootstrap';

/**
 * Navigation Bar for view mode of GeoStory
 * Contains the button to switch to edit mode and the navigation menu.
 * @prop {function} scrollTo handler to scroll to a particular section or id. Gets id of the HTML element as first argument and scroll options as second. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView}
 * @prop {function} setEditing hadler to set edit/view mode. Takes the `editing` flag as argument.
 * @prop {object} story the current story to navigate
 * @prop {object} currentPage contains current `sectionId`
 * @prop {number} progress current progress of the page (from 0 to 1)
 */
export default ({
    scrollTo = () => {},
    setEditing = () => {},
    story = {},
    currentPage,
    isEditAllowed,
    progress = 0 // current page progress (current page + 1/totPages)
}) => (<div
    className="ms-geostory-navigation-bar"
    style={{
        position: 'relative',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    }}>
    <div
        key="progress-bar"
        style={{ backgroundColor: '#ddd', height: 4 }}>
        <div style={{
            backgroundColor: '#078aa3',
            height: 4,
            width: `${progress * 100}%`,
            transition: 'width 0.3s'
        }} ></div>
    </div>
    <div
        style={{
            padding: 4,
            display: 'flex',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #ddd'
        }}>
        <Toolbar
            btnDefaultProps={{
                className: 'square-button-md no-border',
                bsStyle: 'default',
                tooltipPosition: 'bottom'
            }}
            buttons={[
                {
                    glyph: 'pencil',
                    tooltip: 'Edit story',
                    visible: isEditAllowed,
                    onClick: () => setEditing(true)
                }
            ]} />
        <div style={{ flex: 1, display: 'flex' }}>
            <ButtonToolbar
                style={{ marginRight: 0, marginLeft: 'auto' }}>
                {<Toolbar
                    btnDefaultProps={{
                        bsSize: 'xs',
                        style: {
                            marginRight: 4
                        }
                    }}
                    buttons={
                        story.sections && story.sections.map((section = {}) => {
                            const selected = (currentPage && currentPage.sectionId === section.id);
                            return {
                                id: `ms-geostory-nav-${section.id}`,
                                text: section.title || section.type || "No Title",
                                bsStyle: selected ? 'primary' : 'default',
                                className: selected ? '' : 'btn-tray',
                                onClick: selected ? () => { } : scrollTo(section.id)
                            };
                        })} />
                }
            </ButtonToolbar>
        </div>
    </div>
</div>);
