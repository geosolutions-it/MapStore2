/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';

import { setCookieVisibility, setMoreDetailsVisibility, setPrivacyChoice } from '../actions/cookie';
import CookieComp from '../components/cookie/Cookie';
import cookies from '../epics/cookies';
import cookie from '../reducers/cookie';
import ConfigUtils from '../utils/ConfigUtils';
import { MapFooterPrivacyAccess, FooterPrivacyAccess } from '../components/cookie/PrivacyAccessButton';

/**
  * Provides privacy information and optional consent management when the top-level
  * privacy configuration is enabled. Contributes access to Footer and MapFooter,
  * with a bottom bar on routes without a native footer.
  * With privacy disabled, retains the legacy cookie information panel.
  * @name Cookie
  * @memberof plugins
  * @class
  * @classdesc
  * @prop {string} externalCookieUrl if provided then it link to that url otherwise it will opens a section with more details.
  * @prop {string} declineUrl The url associated with the leave button
  */
const Cookie = connect((state) => ({
    show: state.cookie && state.cookie.showCookiePanel,
    html: state.cookie && state.cookie.html && state.cookie.html[state.locale && state.locale.current],
    seeMore: state.cookie && state.cookie.seeMore,
    privacyChoice: state.cookie && state.cookie.privacyChoice,
    privacy: ConfigUtils.getConfigProp('privacy'),
    locale: state.locale && state.locale.current
}), {
    onSetCookieVisibility: setCookieVisibility,
    onMoreDetails: setMoreDetailsVisibility,
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
