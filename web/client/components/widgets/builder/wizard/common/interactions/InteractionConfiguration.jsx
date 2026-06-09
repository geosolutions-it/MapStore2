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
import Message from '../../../../../I18N/Message';

const matchesCondition = (condition = {}, context = {}) => {
    return Object.keys(condition).every((field) => {
        const rule = condition[field];
        const value = context[field];

        if (rule?.isEqual !== undefined) {
            return value === rule.isEqual;
        }

        if (rule?.isNotEqual !== undefined) {
            return value !== rule.isNotEqual;
        }

        return value === rule;
    });
};

const isConfigurationVisible = (metadata, context) => {
    if (!metadata) {
        return false;
    }
    if (!metadata.visibleWhen) {
        return true;
    }
    return matchesCondition(metadata.visibleWhen, context);
};

const isConfigurationDisabled = (metadata, context) => {
    if (!metadata?.disabledWhen) {
        return false;
    }
    return matchesCondition(metadata.disabledWhen, context);
};

const InteractionConfiguration = ({show, configuration, setConfiguration, setPlugged = () => {}, target, nodePath, configurationContext = {}}) => {
    if (!show) return null;
    if (!configuration) return null;
    const context = {
        targetType: target?.targetType,
        nodePath,
        ...configurationContext
    };
    const visibleConfigurationKeys = Object.keys(configuration)
        .filter(key => isConfigurationVisible(CONFIGURATION_METADATA[key], context));
    return (<div className="ms-interaction-configuration">
        {visibleConfigurationKeys.map((key) => {
            const configValue = configuration[key];
            const metadata = CONFIGURATION_METADATA[key];
            const infoMsgId = metadata?.infoMsgByTargetType?.[target?.targetType]
                || metadata?.infoMsgByTargetType?.default;
            const disabled = isConfigurationDisabled(metadata, context);
            return (
                <FlexBox key={key} gap="xs" centerChildrenVertically>
                    <Checkbox
                        disabled={disabled}
                        checked={configValue || false}
                        onChange={(e) => {
                            const newConfiguration = {
                                ...configuration,
                                [key]: e.target.checked
                            };
                            if (key === 'forcePlug' && !e.target.checked) {
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
