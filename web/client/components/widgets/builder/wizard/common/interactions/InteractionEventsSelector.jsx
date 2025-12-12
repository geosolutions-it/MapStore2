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

import {Glyphicon, Checkbox} from 'react-bootstrap';
import {
    getDirectlyPluggableTargets,
    getConfigurableTargets,
    getConfiguredTargets
} from '../../../../../../utils/InteractionUtils';
import tooltip from '../../../../../misc/enhancers/tooltip';
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
                <div key={key}>
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
                </div>
            );
        })}
    </div>);
};
const InteractionsRow = ({item, event, plugAllTrigger}) => {
    // from interactions we can derive if the target is plugged or not, and its configuration

    const hasChildren = item?.children?.length > 0;
    const [expanded, setExpanded] = React.useState(true);
    const directlyPluggableTargets = getDirectlyPluggableTargets(item, event);
    const configurableTargets = getConfigurableTargets(item, event);
    const [plugged, setPlugged] = React.useState(false); // TODO derive from interaction
    const [showConfiguration, setShowConfiguration] = React.useState(false);
    const [configuration, setConfiguration] = React.useState({
        forcePlug: {
            // TODO: add info saying ( checking this you confirm that the filter can be applied also to this data source, even if different from the original one)
            label: "Apply filter anyway",
            value: false
        }
    }); // TODO derive from interaction
    const configuredTargets = getConfiguredTargets(item, event, configuration); // TODO derive from interactions

    // tree should be already filtered but just in case
    // if (directlyPluggableTargets.length === 0 && configurableTargets.length === 0) {
    //     return null;
    // }

    const isPluggable = directlyPluggableTargets.length === 1 || configuredTargets.length > 0;
    const isConfigurable = configurableTargets.length > 0;

    // Effect to handle plug all action
    React.useEffect(() => {
        if (plugAllTrigger && isPluggable) {
            setPlugged(true);
        }
    }, [plugAllTrigger, isPluggable]);

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
                <Glyphicon glyph={item.glyph}/>
                <Text className="ms-flex-fill">{item.title}</Text>
                {item.interactionMetadata && (
                    <InteractionButtons
                        item={item}
                        plugged={plugged}
                        isPluggable={isPluggable || configuration.forcePlug.value}
                        isConfigurable={isConfigurable}
                        configuration={configuration}
                        setPlugged={setPlugged}
                        showConfiguration={showConfiguration}
                        setShowConfiguration={setShowConfiguration}
                    />
                )}
            </FlexBox>
            <InteractionConfiguration item={item} show={showConfiguration} configuration={configuration} setConfiguration={setConfiguration} setPlugged={setPlugged} />
            {hasChildren && expanded && (
                <FlexBox component="ul" column gap="xs">
                    {item.children?.map((child, idx) => (
                        <InteractionsRow key={idx} item={child} event={event} plugAllTrigger={plugAllTrigger} />
                    ))}
                </FlexBox>
            )}
        </FlexBox>
    );
};

const InteractionTargetsList = ({event, plugAllTrigger}) => {
    const [widgetsExpanded, setWidgetsExpanded] = React.useState(true);
    const [mapsExpanded, setMapsExpanded] = React.useState(true);

    const widgetsContainer = {
        id: 'container1',
        glyph: 'dashboard',
        title: 'Widgets'
    };

    const mapsContainer = {
        id: 'container2',
        glyph: '1-map',
        title: 'Map'
    };

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
                            title: "Unemploy",
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
    ];

    const mapsChildren = [
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

    const renderContainer = (container, children, expanded, setExpanded) => (
        <FlexBox className="ms-interaction-target" component="li" gap="xs" key={container.id} column onPointerOver={() => {/* todo highlight*/}} >
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
                    {children?.map((item) => <InteractionsRow key={item.id} item={item} event={event} plugAllTrigger={plugAllTrigger} />)}
                </FlexBox>
            )}
        </FlexBox>
    );

    return (
        <FlexBox component="ul" column gap="xs">
            {renderContainer(widgetsContainer, widgetsChildren, widgetsExpanded, setWidgetsExpanded)}
            {renderContainer(mapsContainer, mapsChildren, mapsExpanded, setMapsExpanded)}
        </FlexBox>
    );
};


const InteractionEventsSelector = ({event, expanded, toggleExpanded = () => {}}) => {
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
                <Glyphicon glyph={event.glyph} />
                <Text className="ms-flex-fill" fontSize="md">{event.title}</Text>
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
                <InteractionTargetsList event={event} plugAllTrigger={plugAllTrigger} />
            </FlexBox>}
        </FlexBox>
    </FlexBox>);
};

export default InteractionEventsSelector;
