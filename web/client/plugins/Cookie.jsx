/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';

import { setCookieVisibility, setMoreDetailsVisibility } from '../actions/cookie';
import CookieComp from '../components/cookie/Cookie';
import cookies from '../epics/cookies';
import cookie from '../reducers/cookie';

/**
  * Plugin for cookie policy.
  * By default it links to MapStore's cookie information page, but you can customize the
  * links to point to your own cookie information page.
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
    seeMore: state.cookie && state.cookie.seeMore
}), {
    onSetCookieVisibility: setCookieVisibility,
    onMoreDetails: setMoreDetailsVisibility
})(CookieComp);

export default {
    CookiePlugin: Cookie,
    reducers: {cookie: cookie},
    epics: cookies
};
