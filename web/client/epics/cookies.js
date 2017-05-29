/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {info, HIDE_NOTIFICATION} = require('../actions/notifications');
const Rx = require('rxjs');
const {head} = require('lodash');
import { UPDATE_LOCATION } from 'react-router-redux';


const COOKIE_NOTIFICATION_ID = "cookiesPolicyNotification";
const cookieNotificationSelector = (state) => state && state.notifications && head(state.notifications.filter( n => n.uid === COOKIE_NOTIFICATION_ID));

/**
 * Show the cookie policy notification
 * @param  {external:Observable} action$ triggers on "UPDATE_LOCATION"
 * @param  {object} store   the store, to get current notifications
 * @memberof epics.cookies
 * @return {external:Observable} the steam of actions to trigger to display the noitification.
 */
const cookiePolicyChecker = (action$, store) =>
    action$.ofType(UPDATE_LOCATION)
        .take(1)
        .filter( () => !localStorage.getItem("cookies-policy-approved") && !cookieNotificationSelector(store.getState()))
        .switchMap(() =>
            Rx.Observable.of(info({
                uid: COOKIE_NOTIFICATION_ID,
                title: "cookiesPolicyNotification.title",
                message: "cookiesPolicyNotification.message",
                action: {
                    label: "cookiesPolicyNotification.confirm"
                },
                autoDismiss: 0,
                position: "bl"
            }))
        );

const cookiePolicyDismiss = (action$) =>
    action$.ofType(HIDE_NOTIFICATION)
    .switchMap( (action) => {
        if (action.uid === COOKIE_NOTIFICATION_ID ) {
            localStorage.setItem("cookies-policy-approved", true);
        }
        return Rx.Observable.empty();
    });

/**
 * Epics for cookies policy informations
 * @name epics.cookies
 * @type {Object}
 */
module.exports = {
    cookiePolicyChecker,
    cookiePolicyDismiss
};
