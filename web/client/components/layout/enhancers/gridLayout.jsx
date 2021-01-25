/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactResizeDetector  from 'react-resize-detector';
import { compose, defaultProps, withStateHandlers } from 'recompose';

import withResizeSpy from '../../misc/enhancers/withResizeSpy';

/**
 * Width and height providers for react-grid-layout. Replace default.
 */
/**
 * widthProvider that checks the container size
 * Useful in widgets container for dashboard and map context.
 * Can optionally override default widthProvider in WidgetView, for instance
 */
export const widthProvider = ({overrideWidthProvider} = {}) => compose(
    defaultProps({
        useDefaultWidthProvider: !overrideWidthProvider
    }),
    C => props => <ReactResizeDetector handleWidth >{({ width } = {}) => <C width={width} {...props} />}</ReactResizeDetector>

);
/**
 * heightProvider that checks the fill div by default.
 * Useful in widgets container for map context
 */
export const heightProvider = (opts) => compose(
    withStateHandlers(() => ({}), {
        onResize: () => ({ height }) => ({ height })
    }),
    withResizeSpy(opts)
);


export default {
    /**
     * widthProvider that checks the container size
     * Useful in widgets container for dashboard and map context.
     * Can optionally override default widthProvider in WidgetView, for instance
     */
    widthProvider,
    /**
     * heightProvider that checks the fill div by default.
     * Useful in widgets container for map context
     */
    heightProvider
};
