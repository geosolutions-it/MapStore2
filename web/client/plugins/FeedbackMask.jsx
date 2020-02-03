/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {compose} = require('recompose');
const {createSelector} = require('reselect');
const {push} = require('connected-react-router');
const {Button} = require('react-bootstrap');
const {get} = require('lodash');

const withMask = require('../components/misc/enhancers/withMask');
const {isLoggedIn} = require('../selectors/security');
const Message = require('../components/I18N/Message');
const ResourceUnavailable = require('../components/errors/ResourceUnavailable');
const {feedbackMaskSelector} = require('../selectors/feedbackmask');
const {isSharedStory} = require('../selectors/geostory');

const feedbackMaskPluginSelector = createSelector([
    feedbackMaskSelector,
    isLoggedIn,
    state => !get(state, 'security'),
    isSharedStory
], ({loading, enabled, status, mode, errorMessage, errorMessageParams}, login, alwaysVisible, shared) => ({
    loading,
    enabled,
    status,
    mode,
    errorMessage,
    errorMessageParams,
    login,
    alwaysVisible,
    showHomeButton: !alwaysVisible,
    isSharedStory: shared
}));

const HomeButton = connect(() => ({}), {
    onClick: push.bind(null, '/')
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
                    {props.loadingText || props.mode && <Message msgId={`${props.mode}.loadingSpinner`}/> || 'Loading MapStore'}
                </div>
            </span>
            :
            <ResourceUnavailable {...props} homeButton={<HomeButton />} />, {
            className: 'ms2-loading-mask'
        })
)(() => null);

module.exports = {
    FeedbackMaskPlugin,
    reducers: {
        feedbackMask: require('../reducers/feedbackMask')
    },
    epics: require('../epics/feedbackMask')
};
