/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import Button from '../layout/Button';
import ConfigUtils from '../../utils/ConfigUtils';
import { setCookieVisibility } from '../../actions/cookie';

const labels = {'it-IT': 'Impostazioni privacy', 'en-US': 'Privacy settings'};

function PrivacyAccessButton({locale, enabled, onOpen}) {
    if (!enabled) return null;
    const label = labels[locale] || labels['en-US'];
    return (<Button id="privacy-settings" type="button" className="mapstore-privacy-open"
        title={label} aria-label={label} onClick={onOpen}>
        <Glyphicon glyph="lock" aria-hidden="true" /> <span>{label}</span>
    </Button>);
}

export const MapFooterPrivacyAccess = connect(state => ({
    locale: state.locale?.current,
    enabled: ConfigUtils.getConfigProp('privacy')?.enabled
}), {onOpen: () => setCookieVisibility(true)})(PrivacyAccessButton);

export const FooterPrivacyAccess = props => <li><MapFooterPrivacyAccess {...props}/></li>;
