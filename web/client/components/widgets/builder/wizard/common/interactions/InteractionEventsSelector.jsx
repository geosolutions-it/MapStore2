/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import FlexBox from '../../../../../layout/FlexBox';
import Text from '../../../../../layout/Text';
import Button from '../../../../../layout/Button';
import uuid from 'uuid/v1';

import {Glyphicon, Checkbox, OverlayTrigger, Popover} from 'react-bootstrap';
import {
    getDirectlyPluggableTargets,
    getConfigurableTargets,
    getConfiguredTargets,
    filterTreeWithTarget,
    generateNodePath
} from '../../../../../../utils/InteractionUtils';
import tooltip from '../../../../../misc/enhancers/tooltip';
import { getWidgetInteractionTreeGenerated, getEditingWidget } from '../../../../../../selectors/widgets';
import './interaction-wizard.less';

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
const InteractionButtons = ({ plugged, setPlugged, showConfiguration, setShowConfiguration = () => {}, isPluggable, isConfigurable}) => {

    return (
        <FlexBox gap="xs" className="ms-interaction-buttons">
            {isConfigurable && <TButton
                visible={isConfigurable}
                onClick={() => setShowConfiguration(!showConfiguration)}
                borderTransparent
                tooltip="The target is not automatically connectable, please configure it to connect it"
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
const InteractionConfiguration = ({show, configuration, setConfiguration, setPlugged = () => {}}) => {
    if (!show) return null;
    if (!configuration) return null;
    return (<div className="ms-interaction-configuration">
        {Object.keys(configuration).map((key) => {
            const configItem = configuration[key];
            return (
                <FlexBox key={key} gap="xs" centerChildrenVertically>
                    <Checkbox
                        checked={configItem.value || false}
                        onChange={(e) => {
                            if (!e.target.checked) {
                                setPlugged(false);
                            }
                            setConfiguration({
                                ...configuration,
                                [key]: {
                                    ...configItem,
                                    value: e.target.checked
                                }
                            });
                        }}
                    >
                        {configItem.label}
                    </Checkbox>
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="right"
                        overlay={
                            <Popover id={`popover-${key}`}>
                                {configItem.info}
                            </Popover>
                        }
                    >
                        <Glyphicon glyph="info-sign" />
                    </OverlayTrigger>
                </FlexBox>
            );
        })}
    </div>);
};
/**
 * Helper: Build node path from item using generateNodePath
 * Supports complex paths like root.widgets[chart-1].traces[trace-1]
 */
function buildNodePathFromItem(item, tree) {
    if (!item || !item.id || !tree) {
        return null;
    }
    // Use generateNodePath to get the proper path format
    const path = generateNodePath(tree, item.id);
    return path;
}

/**
 * Helper: Build interaction object from item, event, and target metadata
 */
function buildInteractionObject(item, event, targetMetadata, sourceWidgetId, tree, filterId) {
    const sourceNodePath = generateNodePath(tree, filterId) || `root.widgets[${sourceWidgetId}][${filterId}]`;
    const targetNodePath = buildNodePathFromItem(item, tree);
    const targetProperty = targetMetadata.attributeName || targetMetadata.targetProperty;

    return {
        id: uuid(),
        source: {
            nodePath: sourceNodePath,
            eventType: event.eventType || event.type
        },
        target: {
            nodePath: targetNodePath,
            target: targetProperty,
            mode: targetMetadata.mode || 'upsert'
        }
    };
}

const InteractionsRow = ({item, event, plugAllTrigger, interactions, sourceWidgetId, widgetInteractionTree, filterId, onEditorChange}) => {
    // from interactions we can derive if the target is plugged or not, and its configuration

    const hasChildren = item?.children?.length > 0;
    const [expanded, setExpanded] = React.useState(true);
    const directlyPluggableTargets = getDirectlyPluggableTargets(item, event);
    const configurableTargets = getConfigurableTargets(item, event);
    const [showConfiguration, setShowConfiguration] = React.useState(false);
    const [configuration, setConfiguration] = React.useState({
        forcePlug: {
            label: "Apply regardless of data source",
            value: false,
            info: "Check to confirm that the filter may be applied to this data source, even if different from the original"
        }
    });
    const configuredTargets = getConfiguredTargets(item, event, configuration);

    // Get the target metadata (use first directly pluggable or first configured)
    const targetMetadata = directlyPluggableTargets[0] || configuredTargets[0];

    // Build source and target node paths using generateNodePath with original tree
    const sourceNodePath = generateNodePath(widgetInteractionTree, filterId) || `root.widgets[${sourceWidgetId}][${filterId}]`;
    const targetNodePath = buildNodePathFromItem(item, widgetInteractionTree);

    // Check if interaction is already plugged
    const existingInteraction = interactions.find(i =>
        i.source.nodePath === sourceNodePath &&
        i.source.eventType === (event.eventType || event.type) &&
        i.target.nodePath === targetNodePath
    );

    // Derive plugged state directly from Redux state (reactive)
    const plugged = !!existingInteraction;

    // tree should be already filtered but just in case
    // if (directlyPluggableTargets.length === 0 && configurableTargets.length === 0) {
    //     return null;
    // }

    const isPluggable = directlyPluggableTargets.length === 1 || configuredTargets.length > 0;
    const isConfigurable = configurableTargets.length > 0;

    // Effect to handle plug all action - dispatch action to register interaction
    // Use refs to store latest values without causing re-renders
    const itemRef = React.useRef(item);
    const eventRef = React.useRef(event);
    const targetMetadataRef = React.useRef(targetMetadata);
    const originalTreeRef = React.useRef(widgetInteractionTree);

    React.useEffect(() => {
        itemRef.current = item;
        eventRef.current = event;
        targetMetadataRef.current = targetMetadata;
        originalTreeRef.current = widgetInteractionTree;
    });

    React.useEffect(() => {
        if (plugAllTrigger && isPluggable && sourceWidgetId && targetMetadataRef.current && !plugged && onEditorChange) {
            const interaction = buildInteractionObject(
                itemRef.current,
                eventRef.current,
                targetMetadataRef.current,
                sourceWidgetId,
                originalTreeRef.current,
                filterId
            );
            // Save to widget object
            onEditorChange('interactions', [...(interactions || []), interaction]);
        }
    }, [plugAllTrigger, isPluggable, sourceWidgetId, plugged, filterId, onEditorChange, interactions]);

    // Handle plug/unplug
    const handlePlugToggle = (shouldPlug) => {

        if (!sourceWidgetId || !targetMetadata || !onEditorChange) {
            // eslint-disable-next-line no-console
            console.log('Interaction -> Cannot plug/unplug: missing required data',
                sourceWidgetId,
                !!targetMetadata,
                !!onEditorChange
            );
            return;
        }

        if (shouldPlug) {
            // Register interaction - save to widget object
            const interaction = buildInteractionObject(item, event, targetMetadata, sourceWidgetId, widgetInteractionTree, filterId);
            onEditorChange('interactions', [...(interactions || []), interaction]);
        } else {
            // Unregister interaction - remove from widget object
            if (existingInteraction) {
                const updatedInteractions = (interactions || []).filter(i => i.id !== existingInteraction.id);
                onEditorChange('interactions', updatedInteractions);
            }
        }
    };

    return (
        <FlexBox key={item.id} component="li" gap="xs" column>
            <FlexBox gap="xs" className="ms-connection-row"  centerChildrenVertically>
                {hasChildren && (
                    <Button
                        onClick={() => setExpanded(!expanded)}
                        borderTransparent
                        style={{ padding: 0, background: 'transparent' }}>
                        <Glyphicon glyph={expanded ? "bottom" : "next"} />
                    </Button>
                )}
                <Glyphicon glyph={item.icon}/>
                <Text className="ms-flex-fill">{item.title}</Text>
                {item.interactionMetadata && item.type === "element" && (
                    <InteractionButtons
                        item={item}
                        plugged={plugged}
                        isPluggable={isPluggable || configuration.forcePlug.value}
                        isConfigurable={isConfigurable}
                        configuration={configuration}
                        setPlugged={handlePlugToggle}
                        showConfiguration={showConfiguration}
                        setShowConfiguration={setShowConfiguration}
                    />
                )}
            </FlexBox>
            <InteractionConfiguration item={item} show={showConfiguration} configuration={configuration} setConfiguration={setConfiguration} setPlugged={handlePlugToggle} />
            {hasChildren && expanded && (
                <FlexBox component="ul" column gap="xs">
                    {item.children?.map((child, idx) => (
                        <InteractionsRow
                            key={idx}
                            item={child}
                            event={event}
                            plugAllTrigger={plugAllTrigger}
                            interactions={interactions}
                            sourceWidgetId={sourceWidgetId}
                            widgetInteractionTree={widgetInteractionTree}
                            filterId={filterId}
                            onEditorChange={onEditorChange}
                        />
                    ))}
                </FlexBox>
            )}
        </FlexBox>
    );
};

const InteractionTargetsList = ({target, plugAllTrigger, widgetInteractionTree, interactions, sourceWidgetId, filterId, onEditorChange}) => {
    const [widgetsExpanded, setWidgetsExpanded] = React.useState(true);
    const [mapsExpanded, setMapsExpanded] = React.useState(true);
    const filteredTree = React.useMemo(() => filterTreeWithTarget(widgetInteractionTree, target), [widgetInteractionTree, target]);

    const widgetsContainer = {
        id: 'container1',
        glyph: 'dashboard',
        title: 'Widgets'
    };
    const mapsContainer = {
        id: 'container2',
        glyph: 'map',
        title: 'Map'
    };


    const renderContainer = (container, children, expanded, setExpanded) => (
        <FlexBox className="ms-interaction-target" component="li" gap="xs" key={container.id} column onPointerOver={() => { /* todo highlight */ }} >
            <FlexBox gap="xs" className="ms-connection-row">
                <Button
                    onClick={() => setExpanded(!expanded)}
                    borderTransparent
                    style={{ padding: 0, background: 'transparent' }}>
                    <Glyphicon glyph={expanded ? "bottom" : "next"} />
                </Button>
                <Glyphicon glyph={container.glyph} />
                <Text className="ms-flex-fill">{container.title}</Text>
            </FlexBox>
            {expanded && (
                <FlexBox style={{paddingLeft: 16}} component="ul" column gap="xs">
                    {children?.map((item) => (
                        <InteractionsRow
                            key={item.id}
                            item={item}
                            event={target}
                            plugAllTrigger={plugAllTrigger}
                            interactions={interactions}
                            sourceWidgetId={sourceWidgetId}
                            widgetInteractionTree={widgetInteractionTree}
                            filterId={filterId}
                            onEditorChange={onEditorChange}
                        />
                    ))}
                </FlexBox>
            )}
        </FlexBox>
    );

    return (
        <FlexBox component="ul" column gap="xs">
            {renderContainer(widgetsContainer, filteredTree.children[0].children, widgetsExpanded, setWidgetsExpanded)}
            {filteredTree.children[1]?.children && renderContainer(mapsContainer, filteredTree.children[1]?.children, mapsExpanded, setMapsExpanded)}
        </FlexBox>
    );
};


const InteractionEventsSelector = ({target, expanded, toggleExpanded = () => {}, widgetInteractionTree, interactions, sourceWidgetId, filterId, onEditorChange}) => {
    const [plugAllTrigger, setPlugAllTrigger] = React.useState(0);
    const handlePlugAll = () => {
        setPlugAllTrigger(prev => prev + 1);
    };

    return (<FlexBox className="ms-interactions-container" component="ul" column gap="sm">
        <FlexBox component="li" gap="xs" column>
            <FlexBox className="ms-interactions-event"gap="sm" centerChildrenVertically >
                <Button
                    onClick={() => toggleExpanded()}
                    borderTransparent
                    style={{ padding: 0, background: 'transparent' }}>
                    {
                        expanded ? <Glyphicon glyph="bottom" /> : <Glyphicon glyph="next" />
                    }
                </Button>
                <Glyphicon glyph={target?.glyph} />
                <Text className="ms-flex-fill" fontSize="md">{target?.title}</Text>
                <TButton
                    id="plug-all-button"
                    onClick={handlePlugAll}
                    visible
                    variant="primary"
                    tooltip="Plug all pluggable items"
                    tooltipPosition="top"
                ><Glyphicon glyph="plug"/></TButton>


            </FlexBox>
            {expanded && <FlexBox className="ms-interactions-targets" component="ul" column gap="sm" >
                <InteractionTargetsList
                    target={target}
                    plugAllTrigger={plugAllTrigger}
                    widgetInteractionTree={widgetInteractionTree}
                    interactions={interactions}
                    sourceWidgetId={sourceWidgetId}
                    filterId={filterId}
                    onEditorChange={onEditorChange}
                />
            </FlexBox>}
        </FlexBox>
    </FlexBox>);
};

export default connect((state) => {
    const originalTree = getWidgetInteractionTreeGenerated(state);
    const editingWidget = getEditingWidget(state);
    // Use interactions from widget object only
    const interactions = editingWidget?.interactions || [];
    return {
        widgetInteractionTree: originalTree,
        interactions
    };
}, null)(InteractionEventsSelector);
