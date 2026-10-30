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

// footers that show the privacy settings button with its label
export const FOOTER_SELECTOR = '#mapstore-map-footer, #ms-footer';
export const NAVBAR_SELECTOR = '#ms-brand-navbar';

/**
 * Tells whether the page contains an element matching the selector, following the changes of the page.
 * @param {string} selector css selector
 * @returns {boolean} true when at least one element matches
 */
export function useElementPresent(selector) {
    const [present, setPresent] = useState(false);
    useEffect(() => {
        const update = () => setPresent(!!document.querySelector(selector));
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.body, {childList: true, subtree: true});
        return () => observer.disconnect();
    }, [selector]);
    return present;
}

function PrivacyAccessButton({enabled, onOpen}, context) {
    if (!enabled) return null;
    const label = getMessageById(context.messages, 'privacySettings.settings');
    return (<Button id="privacy-settings" type="button" className="mapstore-privacy-open"
        title={label} aria-label={label} onClick={onOpen}>
        <Glyphicon glyph="lock" aria-hidden="true" /> <span>{label}</span>
    </Button>);
}

PrivacyAccessButton.contextTypes = {
    messages: PropTypes.object
};

// icon only, consistent with the other buttons of the navbar; on pages with a footer the button stays in the footer
function NavbarPrivacyAccessButton({enabled, onOpen}, context) {
    const footer = useElementPresent(FOOTER_SELECTOR);
    if (!enabled || footer) return null;
    const label = getMessageById(context.messages, 'privacySettings.settings');
    return (<li>
        <ButtonWithTooltip id="privacy-settings" type="button" square borderTransparent
            tooltipId="privacySettings.settings" tooltipPosition="bottom"
            aria-label={label} onClick={onOpen}>
            <Glyphicon glyph="lock" aria-hidden="true" />
        </ButtonWithTooltip>
    </li>);
}

NavbarPrivacyAccessButton.contextTypes = {
    messages: PropTypes.object
};

// locale makes the connected button render again when the language changes
const connectAccess = connect(state => ({
    locale: state.locale?.current,
    enabled: privacyConfigSelector(state)?.enabled
}), {onOpen: () => setCookieVisibility(true)});

export const MapFooterPrivacyAccess = connectAccess(PrivacyAccessButton);

export const FooterPrivacyAccess = props => <li><MapFooterPrivacyAccess {...props}/></li>;

export const BrandNavbarPrivacyAccess = connectAccess(NavbarPrivacyAccessButton);
