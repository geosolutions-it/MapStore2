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
import { FooterPrivacyAccess, MapFooterPrivacyAccess, LoginPrivacyAccess, UserMenuPrivacyAccess } from '../components/cookie/PrivacyAccessButton';

/**
  * Provides privacy information and optional consent management when the top-level
  * privacy configuration is enabled. Contributes access, in order of priority, to the Footer,
  * to the user menu of Login and to the MapFooter, with a floating button on routes without any of
  * them. The login window always shows its own button.
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
        // Only the available container with the highest priority shows the access to the privacy settings.
        // doNotHide keeps the privacy panel, rendered by the plugin root, on every page.
        Footer: {
            name: 'privacyAccess', target: 'menu', position: 10, priority: 3, doNotHide: true,
            Component: FooterPrivacyAccess
        },
        Login: [{
            name: 'privacyAccessMenu', target: 'menu-end', position: 1, priority: 2, doNotHide: true,
            Component: UserMenuPrivacyAccess
        }, {
            name: 'privacyAccess', target: 'login-footer', position: 1, alwaysRender: true, doNotHide: true,
            Component: LoginPrivacyAccess
        }],
        MapFooter: {
            name: 'privacyAccess', target: 'left-footer', position: 1, priority: 1, doNotHide: true,
            Component: MapFooterPrivacyAccess
        }
    }),
    reducers: {cookie: cookie},
    epics: cookies
};
