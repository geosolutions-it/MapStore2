/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import loadingState from '../../misc/enhancers/loadingState';
import {defaultViewerHandlers, defaultViewerDefaultProps} from './enhancers/defaultViewer';
import { compose, defaultProps} from 'recompose';
import {connect} from 'react-redux';
import { createSelector} from 'reselect';
import {indexSelector, responsesSelector, requestsSelector, showEmptyMessageGFISelector, generalInfoFormatSelector, validResponsesSelector} from '../../../selectors/mapInfo';
import {changePage} from '../../../actions/mapInfo';
import Viewer from './DefaultViewer';
import {isArray} from 'lodash';
import SwipeHeader from './SwipeHeader';

/**
 * Container that render only the selected result
 */
const Container = ({index, children}) => (<React.Fragment>{isArray(children) && children[index] || children}</React.Fragment>);

/*
 * Enhancer to enable set index only if Component has not header in viewerOptions props
 */
const identifyIndex = compose(
    connect(
        createSelector(indexSelector, (index) => ({ index })),
        {
            setIndex: changePage
        }
    ),
    defaultProps({
        index: 0,
        responses: []
    })
)
;
const selector = createSelector([
    responsesSelector,
    validResponsesSelector,
    requestsSelector,
    generalInfoFormatSelector,
    showEmptyMessageGFISelector],
(responses, validResponses, requests, format, showEmptyMessageGFI) => ({
    responses,
    validResponses,
    requests,
    format,
    showEmptyMessageGFI,
    missingResponses: (requests || []).length - (responses || []).length
}));


export  default compose(
    connect(selector),
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
