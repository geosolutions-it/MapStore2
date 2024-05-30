/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { createSelector } from 'reselect';

import ResourceUnavailable from '../components/errors/ResourceUnavailable';
import Message from '../components/I18N/Message';
import withMask from '../components/misc/enhancers/withMask';
import epics from '../epics/feedbackMask';
import feedbackMask from '../reducers/feedbackMask';
import { feedbackMaskSelector } from '../selectors/feedbackmask';
import { isSharedStory } from '../selectors/geostory';
import { isLoggedIn } from '../selectors/security';
import Button from '../components/misc/Button';
import { goToHomePage } from '../actions/router';

const feedbackMaskPluginSelector = createSelector([
    feedbackMaskSelector,
    isLoggedIn,
    state => !get(state, 'security'),
    isSharedStory
], ({loading, enabled, status, mode, errorMessage, errorMessageType, errorMessageParams}, login, alwaysVisible, shared) => ({
    loading,
    enabled,
    status,
    mode,
    errorMessage,
    errorMessageType,
    errorMessageParams,
    login,
    alwaysVisible,
    showHomeButton: !alwaysVisible,
    isSharedStory: shared
}));

const HomeButton = connect(() => ({}), {
    onClick: goToHomePage
})(
    ({onClick = () => {}}) => <Button
        bsStyle="primary"
        onClick={() => onClick()}>
        <Message msgId="gohome"/>
    </Button>
);

/**
 * FeedbackMask plugin.
 * Create a mask on dashboard and map pages when they are not accessible or not found.
 * @memberof plugins
 * @name FeedbackMask
 * @class
 * @prop {string} cfg.loadingText change loading text
 */

const FeedbackMaskPlugin = compose(
    connect(feedbackMaskPluginSelector),
    withMask(
        ({loading, enabled}) => loading || enabled,
        props => props.loading ?
            <span>
                <div className="_ms2_init_spinner _ms2_init_center">
                    <div/>
                </div>
                <div className="_ms2_init_text _ms2_init_center">
                    {props.loadingText || props.mode && <Message msgId={`${props.mode}.loadingSpinner`}/> || 'Loading CoreSpatial Portal'}
                </div>
            </span>
            :
            <ResourceUnavailable {...props} homeButton={<HomeButton />} />, {
            className: 'ms2-loading-mask'
        })
)(() => null);

export default {
    FeedbackMaskPlugin,
    reducers: {
        feedbackMask
    },
    epics
};
