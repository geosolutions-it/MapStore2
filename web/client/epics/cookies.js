/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import Rx from 'rxjs';

import { setCookieVisibility, setDetailsCookieHtml, SET_MORE_DETAILS_VISIBILITY } from '../actions/cookie';
import axios from '../libs/ajax';
import { CHANGE_LOCALE } from '../actions/locale';
import { LOCATION_CHANGE } from 'connected-react-router';


/**
 * Show the cookie policy notification
 * @param  {external:Observable} action$ triggers on "LOCATION_CHANGE"
 * @param  {object} store   the store, to get current notifications
 * @memberof epics.cookies
 * @return {external:Observable} the steam of actions to trigger to display the noitification.
 */

export const cookiePolicyChecker = (action$) =>
    action$.ofType(LOCATION_CHANGE )
        .take(1)
        .filter( () => !localStorage.getItem("cookies-policy-approved"))
        .switchMap(() =>
            Rx.Observable.of(setCookieVisibility(true))
        );

export const loadCookieDetailsPage = (action$, store) =>
    action$.ofType(SET_MORE_DETAILS_VISIBILITY, CHANGE_LOCALE )
        .filter( () => !localStorage.getItem("cookies-policy-approved") && store.getState().cookie.seeMore && !store.getState().cookie.html[store.getState().locale.current])
        .switchMap(() => Rx.Observable.fromPromise(
            axios.get("translations/fragments/cookie/cookieDetails-" + store.getState().locale.current + ".html", null, {
                timeout: 60000,
                headers: {'Accept': 'text/html', 'Content-Type': 'text/html'}
            }).then(res => res.data)
        ))
        .switchMap(html => Rx.Observable.of(setDetailsCookieHtml(html, store.getState().locale.current )));

/**
 * Epics for cookies policy informations
 * @name epics.cookies
 * @type {Object}
 */
export default {
    cookiePolicyChecker,
    loadCookieDetailsPage
};
