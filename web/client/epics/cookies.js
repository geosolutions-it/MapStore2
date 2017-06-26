/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');
const {setCookieVisibility} = require('../actions/cookie');
const {UPDATE_LOCATION} = require('react-router-redux');


/**
 * Show the cookie policy notification
 * @param  {external:Observable} action$ triggers on "LOCATION_CHANGE"
 * @param  {object} store   the store, to get current notifications
 * @memberof epics.cookies
 * @return {external:Observable} the steam of actions to trigger to display the noitification.
 */

const cookiePolicyChecker = (action$) =>
    action$.ofType(UPDATE_LOCATION)
        .take(1)
        .filter( () => !localStorage.getItem("cookies-policy-approved"))
        .switchMap(() =>
            Rx.Observable.of(setCookieVisibility(true))
        );

/**
 * Epics for cookies policy informations
 * @name epics.cookies
 * @type {Object}
 */
module.exports = {
    cookiePolicyChecker
};
