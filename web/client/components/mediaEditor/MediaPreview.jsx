/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { MediaTypes } from './../../utils/GeoStoryUtils';
import ImagePreview from './image/ImagePreview';
import VideoPreview from './video/VideoPreview';
import MapPreview from './map/MapPreview';

/**
 * preview component for the media editor
 */
export default (props = {}) => {

    return props.mediaType && (
        <div className="ms-media-preview" key="preview" style={{ width: '100%', height: '100%', boxShadow: "inset 0px 0px 30px -5px rgba(0,0,0,0.16)" }}>
            {props.mediaType === MediaTypes.IMAGE && <ImagePreview {...props}/>}
            {props.mediaType === MediaTypes.VIDEO && <VideoPreview {...props}/>}
            {props.mediaType === MediaTypes.MAP && <MapPreview {...props}/>}
        </div>) || null;
};
