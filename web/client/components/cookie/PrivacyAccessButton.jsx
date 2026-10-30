/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import Button from '../layout/Button';
import tooltip from '../misc/enhancers/tooltip';
import { privacyConfigSelector } from '../../utils/PrivacyChoices';
import { setCookieVisibility } from '../../actions/cookie';
import { getMessageById } from '../../utils/LocaleUtils';

const ButtonWithTooltip = tooltip(Button);

export const PRIVACY_GLYPH = 'user-shield';
export const USER_MENU_SELECTOR = '#mapstore-login-menu';
// bootstrap modal windows, which keep the focus inside their dialog
export const MODAL_SELECTOR = '.modal';

// accesses to the privacy settings injected in the page, the floating button is shown without them
const mountedAccesses = new Set();
const accessListeners = new Set();
const notifyAccesses = () => accessListeners.forEach(listener => listener(mountedAccesses.size > 0));

function useRegisterAccess(active) {
    useEffect(() => {
        const access = {};
        if (active) {
            mountedAccesses.add(access);
            notifyAccesses();
        }
        return () => {
            if (mountedAccesses.delete(access)) notifyAccesses();
        };
    }, [active]);
}

/**
 * Tells whether the page shows an access to the privacy settings injected in a container
 * (Footer, MapFooter or the user menu of Login).
 * @returns {boolean} true when at least one access is shown
 */
export function useInjectedAccess() {
    const [present, setPresent] = useState(mountedAccesses.size > 0);
    useEffect(() => {
        accessListeners.add(setPresent);
        setPresent(mountedAccesses.size > 0);
        return () => accessListeners.delete(setPresent);
    }, []);
    return present;
}

function PrivacyAccessButton({enabled, onOpen, id = 'privacy-settings', register}, context) {
    useRegisterAccess(enabled && register);
    if (!enabled) return null;
    const label = getMessageById(context.messages, 'privacySettings.settings');
    return (<Button id={id} type="button" className="mapstore-privacy-open"
        title={label} aria-label={label} onClick={onOpen}>
        <Glyphicon glyph={PRIVACY_GLYPH} aria-hidden="true" /> <span>{label}</span>
    </Button>);
}

PrivacyAccessButton.contextTypes = {
    messages: PropTypes.object
};

// icon only, among the attribution of the map
function MapFooterPrivacyAccessButton({enabled, onOpen}, context) {
    useRegisterAccess(enabled);
    if (!enabled) return null;
    return (<ButtonWithTooltip id="privacy-settings" type="button" className="mapstore-privacy-open"
        tooltipId="privacySettings.settings" tooltipPosition="top"
        aria-label={getMessageById(context.messages, 'privacySettings.settings')} onClick={onOpen}>
        <Glyphicon glyph={PRIVACY_GLYPH} aria-hidden="true" />
    </ButtonWithTooltip>);
}

MapFooterPrivacyAccessButton.contextTypes = {
    messages: PropTypes.object
};

function UserMenuPrivacyAccessItem({enabled, onOpen, itemComponent: ItemComponent}) {
    useRegisterAccess(enabled && !!ItemComponent);
    if (!enabled || !ItemComponent) return null;
    return <ItemComponent glyph={PRIVACY_GLYPH} msgId="privacySettings.settings" onClick={onOpen}/>;
}

// locale makes the connected button render again when the language changes
const connectAccess = connect(state => ({
    locale: state.locale?.current,
    enabled: privacyConfigSelector(state)?.enabled
}), {onOpen: () => setCookieVisibility(true)});

const ConnectedPrivacyAccessButton = connectAccess(PrivacyAccessButton);

export const MapFooterPrivacyAccess = connectAccess(MapFooterPrivacyAccessButton);

export const FooterPrivacyAccess = props => <li><ConnectedPrivacyAccessButton register {...props}/></li>;

export const LoginPrivacyAccess = props => <ConnectedPrivacyAccessButton id="privacy-settings-login" {...props}/>;

export const UserMenuPrivacyAccess = connectAccess(UserMenuPrivacyAccessItem);
