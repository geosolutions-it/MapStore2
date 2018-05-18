/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const withResizeSpy = require('../../misc/enhancers/withResizeSpy');
const { compose, defaultProps, withStateHandlers} = require('recompose');
const ContainerDimensions = require('react-container-dimensions').default;

/**
 * Width and height providers for react-grid-layout. Replace default.
 */
module.exports = {
    /**
     * widthProvider that checks the container size
     * Useful in widgets container for dashboard and map context.
     * Can optionally override default widthProvider in WidgetView, for instance
     */
    widthProvider: ({overrideWidthProvider} = {}) => compose(
        defaultProps({
            useDefaultWidthProvider: !overrideWidthProvider
        }),
        C => props => <ContainerDimensions>{({ width } = {}) => <C width={width} {...props} />}</ContainerDimensions>

    ),
    /**
     * heightProvider that checks the fill div by default.
     * Useful in widgets container for map context
     */
    heightProvider: (opts) => compose(
        withStateHandlers(() => ({}), {
            onResize: () => ({ height }) => ({ height })
        }),
        withResizeSpy(opts)
    )
};
