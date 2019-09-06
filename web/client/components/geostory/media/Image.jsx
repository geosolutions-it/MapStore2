/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { Component } from 'react';
import { find } from 'lodash';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';
import Lightbox from 'react-image-lightbox';
import objectFitImages from 'object-fit-images';
import { connect } from "react-redux";
import { compose, withState, withProps, branch } from 'recompose';

import { resourcesSelector } from '../../../selectors/geostory';
import emptyState from '../../misc/enhancers/emptyState';


/**
 * Image media component
 * @class
 * @name Image
 * @prop {string} src source of the image
 * @prop {string} fit one of 'cover' or 'contain'
 * @prop {boolean} enableFullscreen enable fullscreen preview with pan and zoom options
 */

class Image extends Component {

    static propTypes = {
        src: PropTypes.string,
        id: PropTypes.string,
        fit: PropTypes.string,
        description: PropTypes.string,
        descriptionEnabled: PropTypes.bool,
        credits: PropTypes.string,
        altText: PropTypes.string,
        enableFullscreen: PropTypes.bool,
        fullscreen: PropTypes.bool,
        onClick: PropTypes.func
    };

    componentDidMount() {
        objectFitImages(this._node);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.src !== this.props.src) {
            objectFitImages(this._node);
        }
    }

    render() {
        const {
            id,
            src,
            fit = 'cover',
            enableFullscreen = true,
            fullscreen,
            onClick,
            description,
            descriptionEnabled = true,
            credits
        } = this.props;
        return (
            <div
                id={id}
                className="ms-media ms-media-image">
                {src && <img
                    ref={node => { this._node = node; }}
                    src={src}
                    onClick={enableFullscreen ? () => onClick(true) : undefined}
                    style={{
                        objectFit: fit,
                        // polyfill ie11
                        fontFamily: `object-fit: ${fit};`,
                        cursor: enableFullscreen ? 'pointer' : 'default'
                    }}/>}
                {credits && <div className="ms-media-credits">
                    <small>
                        {credits}
                    </small>
                </div>}
                {descriptionEnabled && description && <div className="ms-media-description">
                    <small>
                        {description}
                    </small>
                </div>}
                {enableFullscreen && fullscreen ?
                    <Lightbox
                        mainSrc={src}
                        onCloseRequest={() => onClick(false)}/>
                : null}
            </div>
        );
    }
}

export default compose(
    branch(
        ({resourceId}) => resourceId,
        compose(
            connect(createSelector(resourcesSelector, (resources) => ({resources}))),
            withProps(
                ({ resources, resourceId: id }) => {
                    const resource = find(resources, { id }) || {};
                    return resource.data;
                }
            )
        ),
        emptyState(
            ({src = ""} = {}) => !src,
            () => ({
                glyph: "picture"
            })
        )
    ),
    withState('fullscreen', 'onClick', false)
)(Image);
