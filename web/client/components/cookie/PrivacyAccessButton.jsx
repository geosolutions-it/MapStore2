/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import Button from '../layout/Button';
import tooltip from '../misc/enhancers/tooltip';
import { getMessageById } from '../../utils/LocaleUtils';
import { PRIVACY_GLYPH } from './constants';

const ButtonWithTooltip = tooltip(Button);

/**
 * Button with icon and label that opens the privacy settings.
 * @prop {boolean} enabled shows the button
 * @prop {function} onOpen opens the privacy settings
 * @prop {string} id id of the button
 */
function PrivacyAccessButton({enabled, onOpen, id = 'privacy-settings'}, context) {
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

/**
 * Icon only button, among the attribution of the map, that opens the privacy settings.
 */
export function MapFooterPrivacyAccessButton({enabled, onOpen}, context) {
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

/**
 * Entry of the user menu that opens the privacy settings, rendered with the item component of the menu.
 */
export function UserMenuPrivacyAccessItem({enabled, onOpen, itemComponent: ItemComponent}) {
    if (!enabled || !ItemComponent) return null;
    return <ItemComponent glyph={PRIVACY_GLYPH} msgId="privacySettings.settings" onClick={onOpen}/>;
}

export default PrivacyAccessButton;
