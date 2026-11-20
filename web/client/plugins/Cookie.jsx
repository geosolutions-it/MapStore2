/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { setCookieVisibility, setPrivacyChoice, addPrivacyAccess, removePrivacyAccess } from '../actions/cookie';
import CookieComp from '../components/cookie/Cookie';
import PrivacyAccessButton, { MapFooterPrivacyAccessButton, UserMenuPrivacyAccessItem } from '../components/cookie/PrivacyAccessButton';
import { PRIVACY_ACCESS } from '../components/cookie/constants';
import cookies from '../epics/cookies';
import cookie from '../reducers/cookie';
import { hasPrivacyAccessSelector } from '../selectors/cookie';
import { privacyConfigSelector } from '../utils/PrivacyChoices';

// locale makes the connected accesses render again when the language changes
const accessState = state => ({
    locale: state.locale?.current,
    enabled: privacyConfigSelector(state)?.enabled
});
const openPrivacySettings = () => setCookieVisibility(true);

const connectAccess = connect(accessState, {
    onOpen: openPrivacySettings,
    onAddAccess: addPrivacyAccess,
    onRemoveAccess: removePrivacyAccess
});

/**
 * Connects the access of a page container and records it in the state while it is shown,
 * so the privacy panel hides its floating button.
 * @param {function} Access the access component
 * @param {string} id the container, one of the `PRIVACY_ACCESS` values
 * @param {function} isShown tells from the props whether the access is shown
 */
const recordedAccess = (Access, id, isShown = ({enabled}) => enabled) => connectAccess(({onAddAccess, onRemoveAccess, ...props}) => {
    const shown = !!isShown(props);
    useEffect(() => {
        if (shown) onAddAccess(id);
        return () => {
            if (shown) onRemoveAccess(id);
        };
    }, [shown]);
    return <Access {...props}/>;
});

const FooterAccess = recordedAccess(PrivacyAccessButton, PRIVACY_ACCESS.FOOTER);
const FooterPrivacyAccess = props => <li><FooterAccess {...props}/></li>;
const UserMenuPrivacyAccess = recordedAccess(UserMenuPrivacyAccessItem, PRIVACY_ACCESS.USER_MENU,
    ({enabled, itemComponent}) => enabled && itemComponent);
const MapFooterPrivacyAccess = recordedAccess(MapFooterPrivacyAccessButton, PRIVACY_ACCESS.MAP_FOOTER);
// the login window is temporary, so its button does not replace the floating one
const ConnectedLoginAccess = connect(accessState, {onOpen: openPrivacySettings})(PrivacyAccessButton);
const LoginPrivacyAccess = props => <ConnectedLoginAccess id="privacy-settings-login" {...props}/>;

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
    hasPrivacyAccess: hasPrivacyAccessSelector(state),
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
