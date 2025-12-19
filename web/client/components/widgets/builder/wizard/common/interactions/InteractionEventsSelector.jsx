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
    detachNodeAndPromoteChildren,
    generateNodePath
} from '../../../../../../utils/InteractionUtils';
import tooltip from '../../../../../misc/enhancers/tooltip';
import { getWidgetInteractionTree, getWidgetInteractionTreeGenerated } from '../../../../../../selectors/widgets';
import { registerInteraction, unregisterInteraction } from '../../../../../../actions/interactions';
import './interaction-wizard.less';
import { getConnectedInteractions } from '../../../../../../selectors/interactions';

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
    const sourceNodePath = tree ? (generateNodePath(tree, filterId) || `widgets["${sourceWidgetId}"]`) : `widgets["${sourceWidgetId}"]`;
    const targetNodePath = buildNodePathFromItem(item, tree);
    const targetProperty = targetMetadata.attributeName || targetMetadata.targetProperty || 'dependencies.filters';

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

const InteractionsRow = ({item, event, plugAllTrigger, dispatch, interactions, sourceWidgetId, widgetInteractionTree, filterId}) => {
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
    const sourceNodePath = sourceWidgetId && widgetInteractionTree ? generateNodePath(widgetInteractionTree, filterId) : null;
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
        if (plugAllTrigger && isPluggable && dispatch && sourceWidgetId && targetMetadataRef.current && !plugged) {
            const interaction = buildInteractionObject(
                itemRef.current,
                eventRef.current,
                targetMetadataRef.current,
                sourceWidgetId,
                originalTreeRef.current,
                filterId
            );
            dispatch(registerInteraction(interaction));
        }
    }, [plugAllTrigger, isPluggable, dispatch, sourceWidgetId, plugged, filterId]);

    // Handle plug/unplug
    const handlePlugToggle = (shouldPlug) => {
        // eslint-disable-next-line no-console
        console.log('Interaction -> handlePlugToggle called',
            shouldPlug,
            !!dispatch,
            sourceWidgetId,
            !!targetMetadata
        );

        if (!dispatch || !sourceWidgetId || !targetMetadata) {
            // eslint-disable-next-line no-console
            console.log('Interaction -> Cannot plug/unplug: missing required data',
                !!dispatch,
                sourceWidgetId,
                !!targetMetadata
            );
            return;
        }

        if (shouldPlug) {
            // Register interaction
            const interaction = buildInteractionObject(item, event, targetMetadata, sourceWidgetId, widgetInteractionTree, filterId);
            dispatch(registerInteraction(interaction));
        } else {
            // Unregister interaction
            if (existingInteraction) {
                dispatch(unregisterInteraction(existingInteraction.id));
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
                            dispatch={dispatch}
                            interactions={interactions}
                            sourceWidgetId={sourceWidgetId}
                            widgetInteractionTree={widgetInteractionTree}
                            filterId={filterId}
                        />
                    ))}
                </FlexBox>
            )}
        </FlexBox>
    );
};

const InteractionTargetsList = ({target, plugAllTrigger, widgetInteractionTree, dispatch, interactions, sourceWidgetId, filterId}) => {
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

    /* Hardcoded test data - not currently used
    const widgetsChildren = [
        {
            id: "33fe2eb0-d996-11eb-a33a-93d34dd07255",
            title: "US states",
            widgetType: "table",
            interactionMetadata: {
                targets: [{
                    targetType: "applyFilter",
                    expectedDataType: "LAYER_FILTER",
                    attributeName: "layerFilter.filters",
                    constraints: {
                        layer: {
                            name: "gs:us_states__15",
                            id: "gs:us_states__15"
                        }
                    },
                    mode: "upsert"
                },
                {
                    targetType: 'filterByViewport',
                    expectedDataType: 'BBOX_COORDINATES',
                    attributeName: 'layerFilter.filters',
                    mode: 'upsert'
                }]
            },
            glyph: 'features-grid'
        },
        {
            id: "9f54aae0-d996-11eb-a33a-93d34dd07255",
            title: "US Workers",
            glyph: "stats",
            children: [
                {
                    id: "af678120-6011-11ed-8df5-6f99a75c8882",
                    title: "Chart-1",
                    glyph: "stats",
                    children: [
                        {
                            title: "Workers",
                            glyph: "pie-chart",
                            interactionMetadata: {
                                targets: [{
                                    targetType: "applyFilter",
                                    expectedDataType: "LAYER_FILTER",
                                    attributeName: "layerFilter.filters",
                                    constraints: {
                                        layer: {
                                            name: "gs:us_states__152",
                                            id: "gs:us_states__152"
                                        }
                                    },
                                    mode: "upsert"
                                },
                                {
                                    targetType: 'filterByViewport',
                                    expectedDataType: 'BBOX_COORDINATES',
                                    attributeName: 'layerFilter.filters',
                                    mode: 'upsert'
                                }]
                            }
                        },
                        {
                            title: "Employed",
                            glyph: "pie-chart",
                            interactionMetadata: {
                                targets: [{
                                    targetType: "applyFilter",
                                    expectedDataType: "LAYER_FILTER",
                                    attributeName: "layerFilter.filters",
                                    constraints: {
                                        layer: {
                                            name: "gs:us_states__15",
                                            id: "gs:us_states__15"
                                        }
                                    },
                                    mode: "upsert"
                                },
                                {
                                    targetType: 'filterByViewport',
                                    expectedDataType: 'BBOX_COORDINATES',
                                    attributeName: 'layerFilter.filters',
                                    mode: 'upsert'
                                }]
                            }
                        },
                        {
                            title: "Unemployed",
                            glyph: "pie-chart",
                            interactionMetadata: {
                                targets: [{
                                    targetType: "applyFilter",
                                    expectedDataType: "LAYER_FILTER",
                                    attributeName: "layerFilter.filters",
                                    constraints: {
                                        layer: {
                                            name: "gs:us_states__15",
                                            id: "gs:us_states__15"
                                        }
                                    },
                                    mode: "upsert"
                                },
                                {
                                    targetType: 'filterByViewport',
                                    expectedDataType: 'BBOX_COORDINATES',
                                    attributeName: 'layerFilter.filters',
                                    mode: 'upsert'
                                }]
                            }
                        },
                        {
                            title: "Houshold",
                            glyph: "pie-chart",
                            interactionMetadata: {
                                targets: [{
                                    targetType: "applyFilter",
                                    expectedDataType: "LAYER_FILTER",
                                    attributeName: "layerFilter.filters",
                                    constraints: {
                                        layer: {
                                            name: "gs:us_states__15",
                                            id: "gs:us_states__15"
                                        }
                                    },
                                    mode: "upsert"
                                },
                                {
                                    targetType: 'filterByViewport',
                                    expectedDataType: 'BBOX_COORDINATES',
                                    attributeName: 'layerFilter.filters',
                                    mode: 'upsert'
                                }]
                            }
                        }
                    ]
                }
            ]

        },
        {
            id: "d8f1a910-d996-11eb-a33a-93d34dd07255",
            glyph: "counter",
            interactionMetadata: {
                targets: [{
                    targetType: "applyFilter",
                    expectedDataType: "LAYER_FILTER",
                    attributeName: "layerFilter.filters",
                    constraints: {
                        layer: {
                            name: "gs:us_states__15",
                            id: "gs:us_states__15"
                        }
                    },
                    mode: "upsert"
                },
                {
                    targetType: 'filterByViewport',
                    expectedDataType: 'BBOX_COORDINATES',
                    attributeName: 'layerFilter.filters',
                    mode: 'upsert'
                }]
            },
            title: "US Male"
        },
        {
            id: "d8f1a910-d996-11eb-a33a-93d34dd07255",
            glyph: "counter",
            interactionMetadata: {
                targets: [{
                    targetType: "applyFilter",
                    expectedDataType: "LAYER_FILTER",
                    attributeName: "layerFilter.filters",
                    constraints: {
                        layer: {
                            name: "gs:us_states__15",
                            id: "gs:us_states__15"
                        }
                    },
                    mode: "upsert"
                },
                {
                    targetType: 'filterByViewport',
                    expectedDataType: 'BBOX_COORDINATES',
                    attributeName: 'layerFilter.filters',
                    mode: 'upsert'
                }]
            },
            title: "US Female"
        },
        {
            title: "US Surfaces",
            id: "34f67bf0-d997-11eb-a33a-93d34dd07255",
            glyph: "stats",
            children: [
                {
                    id: "af678121-6011-11ed-8df5-6f99a75c8882",
                    title: "Chart 1",
                    glyph: "stats",
                    children: [
                        {
                            title: "Water Km",
                            glyph: "line",
                            interactionMetadata: {
                                targets: [{
                                    targetType: "applyFilter",
                                    expectedDataType: "LAYER_FILTER",
                                    attributeName: "layerFilter.filters",
                                    constraints: {
                                        layer: {
                                            name: "gs:us_states__15",
                                            id: "gs:us_states__15"
                                        }
                                    },
                                    mode: "upsert"
                                },
                                {
                                    targetType: 'filterByViewport',
                                    expectedDataType: 'BBOX_COORDINATES',
                                    attributeName: 'layerFilter.filters',
                                    mode: 'upsert'
                                }]
                            }
                        },
                        {
                            title: "Land Km",
                            glyph: "line",
                            interactionMetadata: {
                                targets: [{
                                    targetType: "applyFilter",
                                    expectedDataType: "LAYER_FILTER",
                                    attributeName: "layerFilter.filters",
                                    constraints: {
                                        layer: {
                                            name: "gs:us_states__15",
                                            id: "gs:us_states__15"
                                        }
                                    },
                                    mode: "upsert"
                                },
                                {
                                    targetType: 'filterByViewport',
                                    expectedDataType: 'BBOX_COORDINATES',
                                    attributeName: 'layerFilter.filters',
                                    mode: 'upsert'
                                }]
                            }
                        }
                    ]
                }
            ]
        },
        {
            id: "cc462410-d997-11eb-a064-e1981316fca0",
            title: "US Population",
            glyph: "stats",
            children: [
                {
                    id: "62465110-d997-11eb-a064-e1981316fcas0",
                    title: "chart-1",
                    glyph: "stats",
                    children: [
                        {
                            title: "Persons",
                            glyph: "stats",
                            interactionMetadata: {
                                targets: [{
                                    targetType: "applyFilter",
                                    expectedDataType: "LAYER_FILTER",
                                    attributeName: "layerFilter.filters",
                                    constraints: {
                                        layer: {
                                            name: "gs:us_states__15",
                                            id: "gs:us_states__15"
                                        }
                                    },
                                    mode: "upsert"
                                },
                                {
                                    targetType: 'filterByViewport',
                                    expectedDataType: 'BBOX_COORDINATES',
                                    attributeName: 'layerFilter.filters',
                                    mode: 'upsert'
                                }]
                            }
                        },
                        {
                            title: "Families",
                            glyph: "line",
                            interactionMetadata: {
                                targets: [{
                                    targetType: "applyFilter",
                                    expectedDataType: "LAYER_FILTER",
                                    attributeName: "layerFilter.filters",
                                    constraints: {
                                        layer: {
                                            name: "gs:us_states__15",
                                            id: "gs:us_states__15"
                                        }
                                    },
                                    mode: "upsert"
                                },
                                {
                                    targetType: 'filterByViewport',
                                    expectedDataType: 'BBOX_COORDINATES',
                                    attributeName: 'layerFilter.filters',
                                    mode: 'upsert'
                                }]
                            }
                        }
                    ]
                }
            ]
        }
    // ];

    // const mapsChildren = [
        {
            id: "layers",
            title: "Layers",
            glyph: "1-layer",
            children: [
                {
                    id: "gs:us_states__15",
                    title: "US States",
                    glyph: "1-layer",
                    interactionMetadata: {
                        targets: [{
                            targetType: "applyFilter",
                            expectedDataType: "LAYER_FILTER",
                            attributeName: "layerFilter.filters",
                            constraints: {
                                layer: {
                                    name: "gs:us_states__15",
                                    id: "gs:us_states__15"
                                }
                            },
                            mode: "upsert"
                        }]
                    }
                },
                {
                    id: "gs:man_ny_points",
                    title: "Manhattan (NY) points of interest",
                    glyph: "1-layer",
                    interactionMetadata: {
                        targets: [{
                            targetType: "applyFilter",
                            expectedDataType: "LAYER_FILTER",
                            attributeName: "layerFilter.filters",
                            constraints: {
                                layer: {
                                    name: "gs:man_ny_points",
                                    id: "gs:man_ny_points"
                                }
                            },
                            mode: "upsert"
                        }]
                    }
                }
            ]
        }
    ];
    */

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
                            dispatch={dispatch}
                            interactions={interactions}
                            sourceWidgetId={sourceWidgetId}
                            widgetInteractionTree={widgetInteractionTree}
                            filterId={filterId}
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


const InteractionEventsSelector = ({target, expanded, toggleExpanded = () => {}, widgetInteractionTree, dispatch, interactions, sourceWidgetId, filterId}) => {
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
                    dispatch={dispatch}
                    interactions={interactions}
                    sourceWidgetId={sourceWidgetId}
                    filterId={filterId}
                />
            </FlexBox>}
        </FlexBox>
    </FlexBox>);
};

export default connect((state) => {
    const originalTree = getWidgetInteractionTreeGenerated(state);
    // const processedTree = originalTree ? detachNodeAndPromoteChildren(originalTree, { title: "Charts" }) : null;
    // console.log(originalTree, "originalgtree");
    // console.log(processedTree, "processedTree");
    return {
        widgetInteractionTree: originalTree,
        interactions: getConnectedInteractions(state) || []
    };
}, null)(InteractionEventsSelector);
