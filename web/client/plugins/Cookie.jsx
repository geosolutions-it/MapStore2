/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';

import { setCookieVisibility, setPrivacyChoice } from '../actions/cookie';
import CookieComp from '../components/cookie/Cookie';
import cookies from '../epics/cookies';
import cookie from '../reducers/cookie';
import { privacyConfigSelector } from '../utils/PrivacyChoices';
import { MapFooterPrivacyAccess, FooterPrivacyAccess } from '../components/cookie/PrivacyAccessButton';

/**
  * Provides privacy information and optional consent management when the top-level
  * privacy configuration is enabled. Contributes access to Footer and MapFooter,
  * with a bottom bar on routes without a native footer.
  * With privacy disabled, or without a privacy configuration, it shows nothing.
  * See the privacy settings section of the developer guide for the configuration.
  * @name Cookie
  * @memberof plugins
  * @class
  * @classdesc
  */
const Cookie = connect((state) => ({
    show: state.cookie && state.cookie.showCookiePanel,
    privacyChoice: state.cookie && state.cookie.privacyChoice,
    privacy: privacyConfigSelector(state),
    locale: state.locale && state.locale.current
}), {
    onSetCookieVisibility: setCookieVisibility,
    onPrivacyChoice: setPrivacyChoice
})(CookieComp);

export default {
    CookiePlugin: Object.assign(Cookie, {
        MapFooter: {
            name: 'privacyAccess', target: 'right-footer', position: 10,
            Component: MapFooterPrivacyAccess
        },
        Footer: {
            name: 'privacyAccess', target: 'menu', position: 10,
            Component: FooterPrivacyAccess
        }
    }),
    reducers: {cookie: cookie},
    epics: cookies
};
