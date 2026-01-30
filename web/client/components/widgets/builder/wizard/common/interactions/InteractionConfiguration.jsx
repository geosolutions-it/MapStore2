/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../../../layout/FlexBox';
import { Glyphicon, Checkbox, OverlayTrigger, Popover } from 'react-bootstrap';
import { CONFIGURATION_METADATA } from './interactionConstants';
import { TARGET_TYPES } from '../../../../../../utils/InteractionUtils';
import Message from '../../../../../I18N/Message';

const InteractionConfiguration = ({show, configuration, setConfiguration, setPlugged = () => {}, target}) => {
    if (!show) return null;
    if (!configuration) return null;
    return (<div className="ms-interaction-configuration">
        {Object.keys(configuration).map((key) => {
            const configValue = configuration[key];
            const metadata = CONFIGURATION_METADATA[key];
            // Determine which info message to show based on target type
            const infoMsgId = target?.targetType === TARGET_TYPES.APPLY_STYLE
                ? "widgets.filterWidget.styleForcePlugInfo"
                : "widgets.filterWidget.filterForcePlugInfo";
            return (
                <FlexBox key={key} gap="xs" centerChildrenVertically>
                    <Checkbox
                        checked={configValue || false}
                        onChange={(e) => {
                            const newConfiguration = {
                                ...configuration,
                                [key]: e.target.checked
                            };
                            if (!e.target.checked) {
                                setPlugged(false);
                            }
                            setConfiguration(newConfiguration);
                        }}
                    >
                        {<Message msgId={metadata.label} />}
                    </Checkbox>
                    {infoMsgId && (
                        <OverlayTrigger
                            trigger={['hover', 'focus']}
                            placement="top"
                            overlay={
                                <Popover id={`popover-${key}`}>
                                    {<Message msgId={infoMsgId} />}
                                </Popover>
                            }
                        >
                            <Glyphicon glyph="info-sign" />
                        </OverlayTrigger>
                    )}
                </FlexBox>
            );
        })}
    </div>);
};

export default InteractionConfiguration;

