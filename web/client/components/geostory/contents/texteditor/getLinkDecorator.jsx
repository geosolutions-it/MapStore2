/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { openlink } from 'react-draft-wysiwyg';

function findLinkEntities(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(
        (character) => {
            const entityKey = character.getEntity();
            return (
                entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
            );
        },
        callback,
    );
}

function getLinkComponent(config) {
    const { showOpenOptionOnHover } = config;
    return class Link extends Component {
    static propTypes = {
        entityKey: PropTypes.string.isRequired,
        children: PropTypes.array,
        contentState: PropTypes.object
    };

    state = {
        showPopOver: false
    };

    openLink = () => {
        const { entityKey, contentState } = this.props;
        const { url } = contentState.getEntity(entityKey).getData();
        const linkTab = window.open(url, 'blank'); // eslint-disable-line no-undef
        // linkTab can be null when the window failed to open.
        if (linkTab) {
            linkTab.focus();
        }
    };

    toggleShowPopOver = () => {
        const showPopOver = !this.state.showPopOver;
        this.setState({
            showPopOver
        });
    };

    renderDecorator = () => {
        const { children, entityKey, contentState } = this.props;
        const { url, targetOption, attributes } = contentState.getEntity(entityKey).getData();
        const { showPopOver } = this.state;

        if (attributes && attributes['data-geostory-interaction-type']) {
            return (
                <span
                    className="rdw-link-decorator-wrapper"
                >
                    <a
                        data-geostory-interaction-type={attributes['data-geostory-interaction-type']}
                        data-geostory-interaction-params={attributes['data-geostory-interaction-params']}>
                        {children}
                    </a>
                </span>
            );
        }

        return (
            <span
                className="rdw-link-decorator-wrapper"
                onMouseEnter={this.toggleShowPopOver}
                onMouseLeave={this.toggleShowPopOver}
            >
                <a href={url} target={targetOption}>{children}</a>
                {showPopOver && showOpenOptionOnHover ?
                    <img
                        src={openlink}
                        alt=""
                        onClick={this.openLink}
                        className="rdw-link-decorator-icon"
                    />
                    : undefined
                }
            </span>
        );
    }

    render() {
        return this.renderDecorator();
    }
    };
}

export default config => ({
    strategy: findLinkEntities,
    component: getLinkComponent(config)
});
