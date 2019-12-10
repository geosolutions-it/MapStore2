/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';
import image from './Image';
import map from './Map';
import Loader from '../../misc/Loader';
import debounce from 'lodash/debounce';

export const Image = image;
const typesMap = {
    image,
    map
};

/**
 * MediaVisibilityContainer: container to control loading state of a media based on component visibility
 */

const MediaVisibilityContainer = ({
    id,
    onLoad,
    loading,
    debounceTime,
    children
}) => {
    const  [ref, inView] = useInView();
    const updateVisibility = useRef(null);

    useEffect(() => {
        updateVisibility.current = debounce((loadedId) => {
            onLoad(loadedId);
        }, debounceTime);
        return () => {
            updateVisibility.current.cancel();
        };
    }, []);

    useEffect(() => {
        if (inView && loading) {
            updateVisibility.current(id);
        }
        // cancel visibility update when user scroll faster than debounce time
        if (!inView && loading) {
            updateVisibility.current.cancel();
        }
    }, [ inView, loading, id ]);

    return (
        <div
            ref={ref}
            className="ms-media-visibility-container">
            {!loading
                ? children
                : <div className="ms-media-loader"><Loader size={52}/></div>}
        </div>
    );
};

MediaVisibilityContainer.propTypes = {
    id: PropTypes.string,
    debounceTime: PropTypes.number,
    loading: PropTypes.bool,
    onLoad: PropTypes.func
};

MediaVisibilityContainer.defaultProps = {
    id: '',
    debounceTime: 300,
    loading: true,
    onLoad: () => {}
};

/**
 * Media component renders different kind of media based on type or mediaType
 * @prop {string} id unique id that represent the media
 * @prop {boolean} lazy if true renders the component only if in view
 * @prop {string} mediaType one of 'image' or 'map'
 * @prop {string} type one of 'image' or 'map' (used when mediaType is equal to undefined)
 * @prop {number} debounceTime debounce time for lazy loading
 */

export const Media = ({ debounceTime, ...props }) => {
    // store all ids inside an immersive section
    // in this way every media is loaded only when in view
    const [loading, onLoad] = useState({});
    const isLoading = loading[props.id] === undefined
        ? true
        : loading[props.id];
    const MediaType = typesMap[props.mediaType || props.type] || Image;
    return props.lazy
        ? (
            <MediaVisibilityContainer
                // key needed for immersive background children
                key={props.id}
                id={props.id}
                debounceTime={debounceTime}
                loading={isLoading}
                onLoad={(id) => onLoad({ ...loading, [id]: false })}>
                <MediaType {...props}/>
            </MediaVisibilityContainer>
        )
        : (
            <MediaType
                key={props.id}
                {...props}/>
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

export default typesMap;
