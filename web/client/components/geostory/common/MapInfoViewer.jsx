/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import loadingState from '../../misc/enhancers/loadingState';
import {defaultViewerHandlers, defaultViewerDefaultProps} from '../../data/identify/enhancers/defaultViewer';
import { compose, defaultProps, withStateHandlers} from 'recompose';
import Viewer from '../../data/identify/DefaultViewer';
import {isArray} from 'lodash';
import SwipeHeader from '../../data/identify/SwipeHeader';

/**
 * Container that render only the selected result
 */
const Container = ({index, children}) => (<React.Fragment>{isArray(children) && children[index] || children}</React.Fragment>);

/*
 * Enhancer to enable set index only if Component has not header in viewerOptions props
 */
const identifyIndex = compose(
    withStateHandlers({index: 0}, {
        setIndex: () => (index) => {
            return {index};
        }
    }),
    defaultProps({
        index: 0,
        responses: []
    })
);


export  default compose(
    defaultProps({
        responses: [],
        container: Container,
        header: SwipeHeader
    }),
    identifyIndex,
    defaultViewerDefaultProps,
    defaultViewerHandlers,
    loadingState(({responses}) => responses.length === 0)
)(Viewer);
