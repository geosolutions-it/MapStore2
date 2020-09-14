/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useRef, useEffect, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';
import debounce from 'lodash/debounce';

/**
 * VisibilityContainer: mount the actual component only when in view
 * @prop {string} id unique id that represent the media
 * @prop {function} onLoad triggered when actual component is mounted
 * @prop {bool} loading current stored state of loading
 * @prop {number} debounceTime debounce time for lazy loading
 * @prop {element} loaderComponent loading component to use as a placeholder
 */
const VisibilityContainer = ({
    id,
    onLoad,
    loading,
    debounceTime,
    children,
    loaderComponent,
    loaderStyle
}) => {
    const  [ref, inView] = useInView();
    const updateVisibility = useRef(null);
    const LoaderComponent = loaderComponent;

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
            className="ms-visibility-container">
            {!loading
                ? cloneElement(children, { inView })
                : LoaderComponent
                    ? <LoaderComponent style={{ ...loaderStyle }} />
                    : null}
        </div>
    );
};

VisibilityContainer.propTypes = {
    id: PropTypes.string,
    debounceTime: PropTypes.number,
    loading: PropTypes.bool,
    onLoad: PropTypes.func,
    loaderComponent: PropTypes.element
};

VisibilityContainer.defaultProps = {
    id: '',
    debounceTime: 300,
    loading: true,
    onLoad: () => {},
    loaderComponent: null
};

export default VisibilityContainer;
