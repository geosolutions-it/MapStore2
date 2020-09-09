/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import VisibilityContainer from '../common/VisibilityContainer';
import { Glyphicon } from 'react-bootstrap';
import image from './Image';
import map from './Map';
import video from './Video';
import Loader from '../../misc/Loader';

export const Image = image;

export const typesMap = {
    image,
    map,
    video
};

const ErrorComponent = () => <div className="ms-media-error"><Glyphicon glyph="exclamation-sign"/></div>;
const LoaderComponent = () => <div className="ms-media-loader"><Loader size={52}/></div>;

/**
 * Media component renders different kind of media based on type or mediaType
 * @prop {string} id unique id that represent the media
 * @prop {boolean} lazy if true renders the component only if in view
 * @prop {string} mediaType one of 'image' or 'map'
 * @prop {string} type one of 'image' or 'map' (used when mediaType is equal to undefined)
 * @prop {number} debounceTime debounce time for lazy loading
 */
const Media = ({ debounceTime, mediaViewer, ...props }) => {
    // store all ids inside an immersive section
    // in this way every media is loaded only when in view
    const [loading, onLoad] = useState({});
    const isLoading = loading[props.id] === undefined
        ? true
        : loading[props.id];

    const MediaType = mediaViewer || typesMap[props.mediaType || props.type] || Image;

    return props.lazy
        ? (
            <VisibilityContainer
                // key needed for immersive background children
                key={props.id}
                id={props.id}
                debounceTime={debounceTime}
                loading={isLoading}
                onLoad={(id) => onLoad({ ...loading, [id]: false })}
                loaderComponent={LoaderComponent}>
                <MediaType
                    {...props}
                    type={props.mediaType || props.type}
                    loaderComponent={LoaderComponent}
                    errorComponent={ErrorComponent}/>
            </VisibilityContainer>
        )
        : (
            <MediaType
                {...props}
                key={props.id}
                type={props.mediaType || props.type}
                loaderComponent={LoaderComponent}
                errorComponent={ErrorComponent}/>
        );
};

Media.propTypes = {
    id: PropTypes.string,
    lazy: PropTypes.bool,
    mediaType: PropTypes.string,
    type: PropTypes.string,
    debounceTime: PropTypes.number
};

Media.defaultProps = {
    id: '',
    lazy: true,
    mediaType: '',
    type: ''
};

export default Media;
