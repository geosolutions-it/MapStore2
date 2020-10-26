/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {setCookieVisibility, setMoreDetailsVisibility} = require('../actions/cookie');

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
})(require('../components/cookie/Cookie'));

module.exports = {
    CookiePlugin: Cookie,
    reducers: {cookie: require('../reducers/cookie').default},
    epics: require('../epics/cookies')
};
