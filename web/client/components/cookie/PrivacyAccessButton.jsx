/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import Button from '../layout/Button';
import { privacyConfigSelector } from '../../utils/PrivacyChoices';
import { setCookieVisibility } from '../../actions/cookie';
import { getMessageById } from '../../utils/LocaleUtils';

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

// locale makes the connected button render again when the language changes
export const MapFooterPrivacyAccess = connect(state => ({
    locale: state.locale?.current,
    enabled: privacyConfigSelector(state)?.enabled
}), {onOpen: () => setCookieVisibility(true)})(PrivacyAccessButton);

export const FooterPrivacyAccess = props => <li><MapFooterPrivacyAccess {...props}/></li>;
