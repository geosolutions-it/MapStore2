/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../../../layout/FlexBox';
import Button from '../../../../../layout/Button';
import { Glyphicon } from 'react-bootstrap';
import tooltip from '../../../../../misc/enhancers/tooltip';
import Message from '../../../../../I18N/Message';

const TButton = tooltip(Button);

/**
 * Buttons to manage the interaction (plug/unplug and configuration)
 * @param {object} item the InteractionMetadata item
 * @param {boolean} plugged this means there the interaction is active
 * @param {boolean} setPlugged activates the plug for the interaction
 * @param {object} configuration the configuration for the interaction, if any
 * @param {boolean} showConfiguration tells if the configuration is visible or not
 * @param {function} setShowConfiguration toggles the UI for configuration
 * @param {boolean} isPluggable tells if the interaction can be plugged or not
 * @param {boolean} isConfigurable tells if the interaction can be configured or not
 * @param {object} plugConstraints describes whether plugging is disabled and why
 * @returns {React.ReactElement}
 */
const InteractionButtons = ({ plugged, setPlugged, showConfiguration, setShowConfiguration = () => {}, isPluggable, isConfigurable, plugConstraints = {} }) => {
    const { disabled: isPlugConstrained = false, reason: plugConstraintReason = null } = plugConstraints;
    return (
        <FlexBox gap="xs" className={`ms-interaction-buttons${isPlugConstrained ? ' is-disabled' : ''}`}>
            {isConfigurable && <TButton
                visible={isConfigurable}
                disabled={isPlugConstrained}
                onClick={() => setShowConfiguration(!showConfiguration)}
                borderTransparent
                tooltip={plugConstraintReason || <Message msgId="widgets.filterWidget.targetAutomaticallyNotConnectableTooltip" />}
                variant={showConfiguration ? "primary" : undefined}

            >
                <Glyphicon glyph="cog" />
            </TButton>}
            <TButton
                disabled={!isPluggable || isPlugConstrained}
                tooltip={plugConstraintReason || undefined}
                onClick={() => setPlugged(!plugged)}
                borderTransparent
                variant={plugged ? "success" : undefined}
            >
                <Glyphicon glyph={plugged ? "plug" : "unplug"} />
            </TButton>
        </FlexBox>
    );
};

export default InteractionButtons;
