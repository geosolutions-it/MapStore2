/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../../../layout/FlexBox';
import Text from '../../../../../layout/Text';
import Button from '../../../../../layout/Button';
import { Glyphicon } from 'react-bootstrap';
import InteractionButtons from './InteractionButtons';
import InteractionConfiguration from './InteractionConfiguration';
import Message from '../../../../../I18N/Message';
import tooltip from '../../../../../misc/enhancers/tooltip';

import LocalizedString from '../../../../../I18N/LocalizedString';

const itemTitleTranslationMap = {
    "Maps": "widgets.filterWidget.maps",
    "Map": "widgets.filterWidget.map"
};

const TFlexBox = tooltip(FlexBox);


const InteractionsRow = ({
    item,
    target,
    plugged = false,
    isPluggable = false,
    isConfigurable = false,
    configuration,
    configurationContext,
    nodeDisabled = { disabled: false, reason: null },
    onPlugChange = () => {},
    onConfigurationChange = () => {},
    children
}) => {
    const hasChildren = item?.children?.length > 0;
    const [expanded, setExpanded] = React.useState(true);
    const [showConfiguration, setShowConfiguration] = React.useState(false);
    const rowDisabled = item.type === 'element'
        ? nodeDisabled
        : {
            disabled: false,
            reason: null
        };

    return (
        <FlexBox key={item.id} component="li" gap="xs" column>
            <TFlexBox
                gap="xs"
                className={`ms-connection-row${rowDisabled.disabled ? ' is-disabled' : ''}`}
                centerChildrenVertically
                tooltip={rowDisabled.disabled ? rowDisabled.reason : null}
                tooltipPosition="top"
            >
                {hasChildren && (
                    <Button
                        onClick={() => setExpanded(!expanded)}
                        borderTransparent
                        style={{ padding: 0, background: 'transparent' }}>
                        <Glyphicon glyph={expanded ? "bottom" : "next"} />
                    </Button>
                )}
                <Glyphicon glyph={item.icon}/>
                <Text className="ms-flex-fill ">{itemTitleTranslationMap[item.title] ? <Message msgId={itemTitleTranslationMap[item.title] } /> : <LocalizedString value={item.title}/> }</Text>
                {item.interactionMetadata && item.type === "element" && !rowDisabled.disabled && (
                    <InteractionButtons
                        item={item}
                        plugged={plugged}
                        isPluggable={isPluggable}
                        isConfigurable={isConfigurable}
                        configuration={configuration}
                        setPlugged={onPlugChange}
                        showConfiguration={showConfiguration}
                        setShowConfiguration={setShowConfiguration}
                        plugConstraints={nodeDisabled}
                    />
                )}
            </TFlexBox>
            {!rowDisabled.disabled && (
                <InteractionConfiguration item={item} show={showConfiguration} configuration={configuration} setConfiguration={onConfigurationChange} setPlugged={onPlugChange} target={target} nodePath={item.nodePath} configurationContext={configurationContext} />
            )}
            {hasChildren && expanded && (
                <FlexBox component="ul" column gap="xs">
                    {children}
                </FlexBox>
            )}
        </FlexBox>
    );
};

export default InteractionsRow;
