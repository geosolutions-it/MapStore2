/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import TextB from './Text';
import { compose, withHandlers } from 'recompose';
import withIntersectionObserver from '../../misc/enhancers/withIntersectionObserver';

const enhanceContents = compose(
    withHandlers({
        onVisibilityChange: ({ id, onVisibilityChange = () => {} } = {}) => (visible, element) => onVisibilityChange({ id, visible, element })
    }),
    withIntersectionObserver()
);

const Text = enhanceContents(TextB);
const DummyComponent = ({ type, inViewRef }) => <div ref={inViewRef} className="ms-content ms-content-unknown">{`warning: unknown content type "${type}"`}</div>;


/**
 * Returns the Component to use for the given type
 * @param {string} type the type of the Content
 */
const getComponent = type => {
    switch (type) {
        case 'text':
            return Text;
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
