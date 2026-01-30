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
 * @returns {React.ReactElement}
 */
const InteractionButtons = ({ plugged, setPlugged, showConfiguration, setShowConfiguration = () => {}, isPluggable, isConfigurable, notConnectableForSpecialCase, notConnectableForSpecialCaseMsg}) => {

    if (notConnectableForSpecialCase) {
        return (
            <FlexBox gap="xs" className="ms-interaction-buttons">
                <TButton
                    disabled
                    borderTransparent
                    tooltip={<Message msgId={notConnectableForSpecialCaseMsg} />}
                >
                    <Glyphicon glyph="ban-circle" />
                </TButton>
            </FlexBox>
        );
    }
    return (
        <FlexBox gap="xs" className="ms-interaction-buttons">
            {isConfigurable && <TButton
                visible={isConfigurable}
                onClick={() => setShowConfiguration(!showConfiguration)}
                borderTransparent
                tooltip={<Message msgId="widgets.filterWidget.targetAutomaticallyNotConnectableTooltip" />}
                variant={showConfiguration ? "primary" : undefined}

            >
                <Glyphicon glyph="cog" />
            </TButton>}
            <TButton
                disabled={!isPluggable}
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

