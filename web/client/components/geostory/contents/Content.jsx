/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Text from './Text';
import { ContentTypes, MediaTypes } from '../../../utils/GeoStoryUtils';
import Media from '../media';
import WebPage from './WebPageWrapper';
const DummyComponent = ({ type }) => <div className="ms-content ms-content-unknown">{`warning: unknown content type "${type}"`}</div>;

/**
 * Returns the Component to use for the given type
 * @param {string} type the type of the Content
 */
const getComponent = type => {
    switch (type) {
    case ContentTypes.TEXT:
        return Text;
    case ContentTypes.MEDIA:
    case MediaTypes.IMAGE:
    case MediaTypes.MAP:
    case MediaTypes.VIDEO:
        return Media;
    case ContentTypes.WEBPAGE:
        return WebPage;
    default:
        return DummyComponent;
    }
};

/**
 * Generic Wrapper for story Contents.
 * Switch content type
 */
export default ({type, ...props}) => {
    const Component = getComponent(type);
    return <Component type={type} {...props} />;
};
