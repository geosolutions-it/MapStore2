/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {compose} = require('recompose');
const {createSelector} = require('reselect');
const {push} = require('react-router-redux');
const {Button: ButtonRB, Glyphicon} = require('react-bootstrap');
const {get} = require('lodash');

const withMask = require('../components/misc/enhancers/withMask');
const emptyState = require('../components/misc/enhancers/emptyState');
const {isLoggedIn} = require('../selectors/security');
const Message = require('../components/I18N/Message');
const HTML = require('../components/I18N/HTML');
const tooltip = require('../components/misc/enhancers/tooltip');

const Button = tooltip(ButtonRB);

const feedbackMaskSelector = createSelector([
    state => get(state, 'feedbackMask', {}),
    isLoggedIn,
    state => !get(state, 'security')
], ({loading, enabled, status, mode, errorMessage}, login, alwaysVisible) => ({
    loading,
    enabled,
    status,
    mode,
    errorMessage,
    login,
    alwaysVisible,
    showHomeButton: !alwaysVisible
}));

const HomeButton = connect(() => ({}), {
    onClick: push.bind(null, '/')
})(
    ({onClick = () => {}}) => <Button
        className="square-button-md"
        bsStyle="primary"
        tooltipId="gohome"
        onClick={() => onClick()}>
        <Glyphicon glyph="home"/>
    </Button>
);

const MaskBody = emptyState(
    ({enabled, login, status, alwaysVisible}) => enabled && alwaysVisible || enabled && login || enabled && status !== 403,
    ({status, mode = 'map', errorMessage, showHomeButton}) => ({
        glyph: mode === 'map' ? '1-map' : 'dashboard',
        title: status === 403 && <Message msgId={`${mode}.errors.loading.notAccessible`} />
        || status === 404 && <Message msgId={`${mode}.errors.loading.notFound`} />
        || <Message msgId={`${mode}.errors.loading.title`} />,
        description: (
            <div className="text-center">
                {errorMessage && <Message msgId={errorMessage} />
                || <HTML msgId={`${mode}.errors.loading.unknownError`} />}
            </div>
        ),
        content: showHomeButton && <div className="text-center"><HomeButton/></div>
    })
)(() => null);

/**
 * FeedbackMask plugin.
 * Create a mask on dashboard and map pages when they are not accessible or not found.
 * @memberof plugins
 * @name FeedbackMask
 * @class
 * @prop {string} cfg.loadingText change loading text
 */

const FeedbackMaskPlugin = compose(
    connect(feedbackMaskSelector),
    withMask(
    ({loading, enabled}) => loading || enabled,
    props => props.loading ?
        <span>
            <div className="_ms2_init_spinner _ms2_init_center">
                <div/>
            </div>
            <div className="_ms2_init_text _ms2_init_center">{props.loadingText || 'Loading MapStore'}</div>
        </span>
        :
        <MaskBody {...props} />, {
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
