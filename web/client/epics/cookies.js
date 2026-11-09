/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { LOCATION_CHANGE } from 'connected-react-router';
import Rx from 'rxjs';

import { setCookieVisibility } from '../actions/cookie';
import { isCookieNoticeAcknowledged } from '../utils/CookieNoticeUtils';
import { privacyConfigSelector } from '../utils/PrivacyChoices';

/**
 * Show the cookie policy notification
 * @param  {external:Observable} action$ triggers on "LOCATION_CHANGE"
 * @param  {object} store   the store, to get current notifications
 * @memberof epics.cookies
 * @return {external:Observable} the steam of actions to trigger to display the noitification.
 */
export const cookiePolicyChecker = (action$, store) =>
    action$.ofType(LOCATION_CHANGE )
        .take(1)
        .filter(() => !isCookieNoticeAcknowledged(privacyConfigSelector(store.getState())))
        .switchMap(() =>
            Rx.Observable.of(setCookieVisibility(true))
        );

/**
 * Epics for cookies policy informations
 * @name epics.cookies
 * @type {Object}
 */
export default {
    cookiePolicyChecker
};
