
export const DATATYPES = {
    LAYER_FILTER: 'LAYER_FILTER',
    FEATURE: "FEATURE",
    STRING: "STRING",
    BBOX_COORDINATES: 'BBOX_COORDINATES',
    POINT: 'POINT',
    NUMBER: 'NUMBER',
    STRING_ARRAY: 'STRING_ARRAY',
    OBJECT_ARRAY: 'OBJECT_ARRAY',
    FEATURE_ARRAY: 'FEATURE_ARRAY'
    // Future datatypes: DATE, DATETIME
};

export const EVENTS = {
    // Map events
    VIEWPORT_CHANGE: 'viewportChange',
    CENTER_CHANGE: 'centerChange',
    ZOOM_CHANGE: 'zoomChange',
    FEATURE_CLICK: 'featureClick',
    // Chart events (future)
    TRACE_CLICK: 'traceClick',
    // Table events
    FILTER_CHANGE: 'filter_change',
    ZOOM_CLICK: 'zoomClick',
    // Legend events
    VISIBILITY_TOGGLE: 'visibilityToggle',
    // DynamicFilter events
    SELECTION_CHANGE: 'selectionChange'
};

export const TARGET_TYPES = {
    ZOOM_TO_VIEWPORT: 'zoomToViewport',
    VIEWPORT_FILTER: 'viewportFilter',
    APPLY_FILTER: 'applyFilter',
    CHANGE_CENTER: 'changeCenter',
    CHANGE_ZOOM: 'changeZoom',
    FILTER_BY_VIEWPORT: 'filterByViewport'
};

// Human-readable labels for target types
export const TARGET_TYPE_LABELS = {
    [TARGET_TYPES.ZOOM_TO_VIEWPORT]: 'Zoom to viewport',
    [TARGET_TYPES.VIEWPORT_FILTER]: 'Viewport filter',
    [TARGET_TYPES.APPLY_FILTER]: 'Apply filter',
    [TARGET_TYPES.CHANGE_CENTER]: 'Change center',
    [TARGET_TYPES.CHANGE_ZOOM]: 'Change zoom',
    [TARGET_TYPES.FILTER_BY_VIEWPORT]: 'Filter by viewport'
};

/**
 * Map of events to the target types they typically emit/drive.
 * Values are arrays to support multiple targets per event.
 */
export const EVENT_TARGET_MAP = {
    [EVENTS.FILTER_CHANGE]: [TARGET_TYPES.APPLY_FILTER]
};

// Events available by widget type
export const WIDGET_EVENTS_BY_TYPE = {
    map: [
        { eventType: EVENTS.VIEWPORT_CHANGE, dataType: DATATYPES.BBOX_COORDINATES },
        { eventType: EVENTS.CENTER_CHANGE, dataType: DATATYPES.POINT },
        { eventType: EVENTS.ZOOM_CHANGE, dataType: DATATYPES.NUMBER },
        { eventType: EVENTS.FEATURE_CLICK, dataType: DATATYPES.FEATURE }
    ],
    table: [
        { eventType: EVENTS.FILTER_CHANGE, dataType: DATATYPES.LAYER_FILTER },
        { eventType: EVENTS.ZOOM_CLICK, dataType: DATATYPES.FEATURE }
    ],
    filter: [
        { eventType: EVENTS.FILTER_CHANGE, dataType: DATATYPES.LAYER_FILTER }
    ]
};

// Targets available by widget type (or sub-type)
export const WIDGET_TARGETS_BY_TYPE = {
    chartTrace: [
        {
            targetType: TARGET_TYPES.APPLY_FILTER,
            expectedDataType: DATATYPES.LAYER_FILTER,
            targetProperty: "dependencies.filters",
            constraints: {},
            mode: "upsert"
        },
        {
            targetType: TARGET_TYPES.FILTER_BY_VIEWPORT,
            expectedDataType: DATATYPES.BBOX_COORDINATES,
            targetProperty: "dependencies.viewports",
            mode: "upsert"
        }
    ],
    layer: [
        {
            targetType: TARGET_TYPES.APPLY_FILTER,
            expectedDataType: DATATYPES.LAYER_FILTER,
            attributeName: "layerFilter.filters",
            constraints: {},
            mode: "upsert"
        },
        {
            targetType: TARGET_TYPES.FILTER_BY_VIEWPORT,
            expectedDataType: DATATYPES.BBOX_COORDINATES,
            attributeName: 'layerFilter.filters',
            mode: 'upsert'
        }
    ],
    table: [
        {
            targetType: TARGET_TYPES.APPLY_FILTER,
            expectedDataType: DATATYPES.LAYER_FILTER,
            attributeName: "layerFilter.filters",
            constraints: {},
            mode: "upsert"
        },
        {
            targetType: TARGET_TYPES.FILTER_BY_VIEWPORT,
            expectedDataType: DATATYPES.BBOX_COORDINATES,
            attributeName: 'layerFilter.filters',
            mode: 'upsert'
        }
    ],
    counter: [
        {
            targetType: TARGET_TYPES.APPLY_FILTER,
            expectedDataType: DATATYPES.LAYER_FILTER,
            attributeName: "layerFilter.filters",
            constraints: {},
            mode: "upsert"
        },
        {
            targetType: TARGET_TYPES.FILTER_BY_VIEWPORT,
            expectedDataType: DATATYPES.BBOX_COORDINATES,
            attributeName: 'layerFilter.filters',
            mode: 'upsert'
        }
    ]
};

export const getDirectlyPluggableTargets = (item, event) => {
    const interactionMetadata = item?.interactionMetadata;
    if (!interactionMetadata) return [];
    return (interactionMetadata?.targets || []).filter( t =>
        t.expectedDataType === event.dataType &&
        JSON.stringify(t.constraints) === JSON.stringify(event?.constraints)
    );
};
export const getConfigurableTargets = (item, event) => {
    const interactionMetadata = item?.interactionMetadata;
    if (!interactionMetadata) return [];
    return (interactionMetadata?.targets || []).filter( t =>
        t.expectedDataType === event.dataType &&
        JSON.stringify(t.constraints) !== JSON.stringify(event?.constraints)
        // TODO: check compatibility by transformation rules
    );
};

export const isConfigurationValidForTarget = () => false; // TODO: implement configuration validation rules

export const getConfiguredTargets = (item, event, configuration) => {
    const interactionMetadata = item?.interactionMetadata;
    if (!interactionMetadata) return [];
    return (interactionMetadata?.targets || []).filter( t =>
        t.expectedDataType === event.dataType &&
        isConfigurationValidForTarget(configuration, t, event)
    );
};
export function generateLayerMetadataTree(layer) {
    return {
        type: "element",
        name: layer.id,
        title: layer.title ?? layer.name ?? layer.id, // NOTE: title can be localized
        icon: '1-layer',
        interactionMetadata: {
            targets: WIDGET_TARGETS_BY_TYPE.layer.map(t => ({
                ...t,
                constraints: {
                    layer: {
                        name: layer.name,
                        id: layer.id
                    }
                }
            }))
        }
    };
}
/**
 * Returns true if the layer supports interactions
 * @param {object} layer the layer
 * @returns {boolean}
 */
export function isInteractionSupported(layer) {
    return ['wms', 'wfs'].includes(layer?.type);
}

/**
 * Returns the layers metadata tree array.
 * @param {object[]} layers array of layers
 * @returns {object[]}
 */
export function generateLayersMetadataTree(layers) {
    return layers.filter(isInteractionSupported).map(generateLayerMetadataTree);
}

/**
 * Generates the map metadata tree.
 * @param {object} mapState the state of the map
 * @param {object[]} layers the list of layers
 * @returns {object}
 */
export function generateMapMetadataTree(mapState, layers) {
    return {
        type: "element",
        name: "map",
        children: [/*
            // TO DO: enable map interactions{
            type: "element",
            name: "viewport"
            interactionMetadata: {
                events: [
                    { eventType: "viewportChange", dataType: "BBOX_COORDINATES"},

                ],
                "targets": [
                    {
                        targetType: "zoomToViewport",
                        attributeName: "viewport",
                        expectedDataType: "BBOX_COORDINATES",
                        mode: "update"
                    },
                    {
                        attributeName: "center",
                        expectedDataType: "POINT",
                        mode: "update"
                    },
                    {
                        attributeName: "zoom",
                        expectedDataType: "MU",
                        mode: "update"
                    }
                ]
            },
            MORE for
                { eventType: "centerChange", dataType: "POINT"},
                { eventType: "zoomChange", dataType: "NUMBER"}

        }, */
            {
                type: "collection",
                name: "layers",
                children: generateLayersMetadataTree(layers)
            }

        ]
    };
}

export function generateWidgetMetadataTree(widget) {
    switch (widget?.widgetType) {
    case "map":
        return {
            type: "element",
            name: widget.id,
            title: widget.title || widget.id,
            icon: 'map',
            children: [{
                type: "collection",
                name: "maps",
                children: [] // TO DO: add map layers metadata tree
            }]
        };
    case "chart":
        return {
            type: "element",
            name: widget.id,
            collection: 'charts',
            title: widget.title || widget.id,
            icon: 'chart',
            children: []
        };
    default:
        return {
            type: "element",
            name: widget.id,
            title: widget.title || widget.id,
            icon: 'widget',
            children: []
        };
    }
}
export function isInteractionSupportedWidget(widget) {
    return (widget?.widgetType === "map" || widget?.widgetType === "table");
}

export function generateWidgetsMetadataTree(widgets) {
    const collection = {
        type: 'collection',
        name: 'widgets',
        icon: 'dashboard',
        children: widgets.filter(isInteractionSupportedWidget).map( w => generateWidgetMetadataTree(w))
    };
    return collection;
}

export function generateInteractionMetadataTree(plugins, widgets, mapState, layers) {
    // eslint-disable-next-line no-console
    console.log(plugins, widgets, mapState, layers, "plugins1");

    const tree = {
        type: "element",
        name: "root",
        children: []
    };

    // if (plugins.includes("Map")) {
    tree.children.push(generateMapMetadataTree(mapState, layers));
    // }

    // if (plugins.includes("Widgets")) {
    //     tree.children.push(generateWidgetsMetadataTree(widgets));
    // }
    return tree;
}

/**
 * This utility generates a sub-tree for the interaction metadata for the given events and targets,
 * filtering by the supported data types.
 * @param {object} tree the metadata tree
 * @param {array} events the events that should be used to filter the interaction metadata tree by supported data types in targets
 * @returns {object} the interaction metadata sub-tree
 */
export function generateInteractionMetadataSubTree(tree, events = []) {
    const supportedDataTypes = events?.map(e => e.dataType) || [];
    const interactionMetadata = tree?.interactionMetadata;
    if (!interactionMetadata) return null;
    const filteredTargets = (interactionMetadata?.targets || []).filter( t => supportedDataTypes.includes(t.expectedDataType));
    if (filteredTargets.length === 0) return null;
    return {
        ...interactionMetadata,
        targets: filteredTargets
    };
}

/**
 * Creates a base element tree node structure.
 * @param {object} item the item object (widget, trace, etc.)
 * @param {string} icon the icon identifier
 * @param {array} children the children array
 * @param {string} title optional title override
 * @returns {object} the base element tree node
 */
function createBaseElementNode(item, icon, children = [], title) {
    return {
        type: "element",
        id: item?.id,
        title: title || item?.title || item.name || item?.id,
        icon,
        children,
        glyph: 'filter'
    };
}

/**
 * Maps trace type to icon name.
 * @param {string} traceType the trace type (bar, pie, line)
 * @returns {string} the icon name
 */
function getTraceIcon(traceType) {
    if (traceType === 'bar') return 'stats';
    if (traceType === 'pie') return 'pie-chart';
    if (traceType === 'line') return 'line';
    return 'bar-chart'; // default
}

/**
 * Generates a tree node for a chart trace element.
 * @param {object} trace the chart trace object
 * @returns {object} the chart trace metadata tree node
 */
export function generateChartTraceTreeNode(trace) {
    const traceIcon = getTraceIcon(trace?.type);
    const baseNode = createBaseElementNode(trace, traceIcon);
    return {
        ...baseNode,
        interactionMetadata: {
            events: [
                // Future events - to be implemented
                // {
                //     eventType: EVENTS.TRACE_CLICK,
                //     dataType: DATATYPES.FEATURE
                // },
                // {
                //     eventType: EVENTS.LAYER_FILTER_CHANGE,
                //     dataType: DATATYPES.LAYER_FILTER
                // }
            ],
            targets: WIDGET_TARGETS_BY_TYPE.chartTrace.map(t => ({
                ...t,
                constraints: t.constraints?.layer ? t.constraints : {
                    layer: { name: trace?.layer?.name || "",  id: trace?.layer?.id  }
                }
            }))
        }
    };
}

/**
 * Generates a tree node for a chart element.
 * @param {object} chart the chart object
 * @param {string} widgetTitle the widget title to use for the chart
 * @returns {object} the chart element metadata tree node
 */
function generateChartElementNode(chart, widgetTitle) {
    return {
        type: "element",
        id: chart?.chartId || chart?.id,
        title: widgetTitle,
        icon: 'stats',
        children: [{
            type: "collection",
            name: "traces",
            title: "Traces",
            interactionMetadata: {},
            children: (chart?.traces || []).map(generateChartTraceTreeNode)
        }]
    };
}

/**
 * Generates a tree node for a chart widget element.
 * @param {object} widget the chart widget object
 * @returns {object} the chart widget metadata tree node
 */
export function generateChartWidgetTreeNode(widget) {
    const charts = widget?.charts || [];

    return {
        type: "collection",
        id: widget?.id,
        title: "Charts",
        children: charts.map(chart => generateChartElementNode(chart, widget?.title || widget?.id))
    };
}

/**
 * Generates a tree node for a table widget element.
 * @param {object} widget the table widget object
 * @returns {object} the table widget metadata tree node
 */
export function generateTableWidgetTreeNode(widget) {
    const baseNode = createBaseElementNode(widget, 'features-grid');
    return {
        ...baseNode,
        interactionMetadata: {
            events: WIDGET_EVENTS_BY_TYPE.table,
            targets: WIDGET_TARGETS_BY_TYPE.table.map(t => ({
                ...t,
                constraints: t.constraints?.layer ? t.constraints : {
                    layer: { name: widget?.layer?.name || "",  id: widget?.layer?.id  }
                }
            }))
        }
    };
}

/**
 * Generates a tree node for a counter widget element.
 * @param {object} widget the counter widget object
 * @returns {object} the counter widget metadata tree node
 */
export function generateCounterWidgetTreeNode(widget) {
    const baseNode = createBaseElementNode(widget, 'counter');
    return {
        ...baseNode,
        interactionMetadata: {
            events: WIDGET_EVENTS_BY_TYPE.counter,
            targets: WIDGET_TARGETS_BY_TYPE.counter.map(t => ({
                ...t,
                constraints: t.constraints?.layer ? t.constraints : {
                    layer: { name: widget?.layer?.name || "",  id: widget?.layer?.id  }
                }
            }))
        }
    };
}

/**
 * Generates a tree node for a map widget element.
 * @param {object} widget the map widget object
 * @returns {object} the map widget metadata tree node
 */
export function generateMapWidgetTreeNode(widget) {
    const baseNode = createBaseElementNode(widget, 'map');
    return {
        ...baseNode,
        interactionMetadata: {
            events: WIDGET_EVENTS_BY_TYPE.map
        }
    };
}

/**
 * Generates a tree node for a dynamic filter widget element.
 * @param {object} widget the dynamic filter widget object
 * @returns {object} the dynamic filter widget metadata tree node
 */
export function generateDynamicFilterWidgetTreeNode(widget) {
    const baseNode = createBaseElementNode(widget, 'filter');
    return {
        ...baseNode,
        interactionMetadata: {
            events: WIDGET_EVENTS_BY_TYPE.filter
        }
    };
}

/**
 * Generates a tree node for a generic widget element.
 * Dispatches to the appropriate widget-specific function based on widget type.
 * @param {object} widget the widget object
 * @returns {object} the widget metadata tree node
 */
export function generateWidgetTreeNode(widget) {
    switch (widget?.widgetType) {
    case "chart":
        return generateChartWidgetTreeNode(widget);
    case "table":
        return generateTableWidgetTreeNode(widget);
    case "counter":
        return generateCounterWidgetTreeNode(widget);
    case "map":
        return generateMapWidgetTreeNode(widget);
    case "filter":
        return generateDynamicFilterWidgetTreeNode(widget);
    default:
        return createBaseElementNode(widget, 'widget');
    }
}

/**
 * Detaches a matching child node and promotes its children to the parent.
 * If a child matches the support criteria (e.g., title: "Charts"), it is removed
 * and its children become direct children of the parent.
 * Processes all matching nodes recursively throughout the tree.
 * @param {object} tree root metadata tree
 * @param {object} support object with matching criteria (e.g., {title: "Charts"})
 * @returns {object} modified tree with matching nodes detached
 */
function detachNodeAndPromoteChildren(tree, support) {
    if (!tree || !support) return tree;

    const matchesCriteria = (child) => {
        // Check all properties in support object against child node
        return Object.keys(support).every(key => child[key] === support[key]);
    };

    const cloneNode = (node) => {
        if (!node) return null;

        // Recursively process children first
        const processedChildren = (node.children || [])
            .map(child => cloneNode(child))
            .filter(Boolean);

        // Find all matching children and collect their grandchildren
        const newChildren = [];
        for (const child of processedChildren) {
            if (matchesCriteria(child)) {
                // Detach matching child and promote its children
                const grandchildren = child.children || [];
                newChildren.push(...grandchildren);
            } else {
                // Keep non-matching child
                newChildren.push(child);
            }
        }

        const { children, ...rest } = node;
        return newChildren.length > 0
            ? { ...rest, children: newChildren }
            : { ...rest };
    };

    return cloneNode(tree);
}

/**
 * Generates a root tree node containing all widget tree nodes.
 * @param {array} widgets array of widget objects
 * @returns {object} the root tree node with widgets collection as child TODO: CONSIDER FOR MAP also
 */
export function generateRootTree(widgets) {
    const widgetsArray = widgets || [];
    const widgetNodes = widgetsArray
        .filter(widget => widget !== null && widget !== undefined)
        .map(widget => generateWidgetTreeNode(widget));

    const tree = {
        type: "element",
        name: "root",
        children: [{
            type: "collection",
            name: "widgets",
            children: widgetNodes
        }]
    };

    // Detach intermediate collection nodes like "Charts" and promote their children
    return detachNodeAndPromoteChildren(tree, { title: "Charts" });
}

/**
 * Recursively visits tree nodes (elements or collections) and applies the callback.
 * @param {object} node tree node
 * @param {function} visitor function called with each element node
 */
function walkTree(node, visitor) {
    if (!node) return;
    if (node.type === 'element') {
        visitor(node);
    }
    (node.children || []).forEach(child => walkTree(child, visitor));
}

/**
 * Returns the list of events declared on a widget/element by id.
 * @param {object} tree root metadata tree
 * @param {string} widgetId element id to search
 * @returns {array} events array (empty if none found)
 */
export function getWidgetEventsById(tree, widgetId) {
    let foundEvents = [];
    walkTree(tree, node => {
        if (node.id === widgetId && node.interactionMetadata?.events) {
            const events = node.interactionMetadata.events;
            foundEvents = Array.isArray(events) ? events : [events];
        }
    });
    // eslint-disable-next-line no-console
    console.log('getWidgetEventsById', widgetId, foundEvents);
    return foundEvents;
}

// /**
//  * Finds widgets whose targets accept the given event (dataType and optional constraints).
//  * @param {object} tree root metadata tree
//  * @param {object} event event object containing dataType and optional constraints
//  * @returns {array} array of { id, title, targets } for matching widgets
//  */
// export function findWidgetsByEvent(tree, event) {
//     const matches = [];
//     const matchTarget = target => {
//         const sameType = target.targetType === event?.eventType;
//         return sameType;
//     };

//     walkTree(tree, node => {
//         const targets = node.interactionMetadata?.targets || [];
//         const matchedTargets = targets.filter(matchTarget);
//         if (matchedTargets.length > 0) {
//             matches.push({
//                 id: node.id,
//                 title: node.title,
//                 targets: matchedTargets
//             });
//         }
//     });
//     // eslint-disable-next-line no-console
//     console.log('findWidgetsByEvent', event, matches);
//     return matches;
// }

/**
 * Returns a pruned copy of the tree containing only nodes that declare the given event.
 * Ancestors are kept to preserve hierarchy; non-matching branches are removed.
 * @param {object} tree root metadata tree
 * @param {object} event event object containing eventType and dataType
 * @returns {object|null} pruned tree or null if no matches
 */
export function filterTreeByEvent(tree, event) {
    const matchEvent = node => {
        const events = node?.interactionMetadata?.events;
        if (!events) return false;
        const arr = Array.isArray(events) ? events : [events];
        return arr.some(ev => ev?.eventType === event?.eventType && ev?.dataType === event?.dataType);
    };

    const cloneWithFilteredChildren = node => {
        if (!node) return null;
        const filteredChildren = (node.children || [])
            .map(child => cloneWithFilteredChildren(child))
            .filter(Boolean);
        const isMatch = node.type === 'element' && matchEvent(node);
        if (!isMatch && filteredChildren.length === 0) {
            return null;
        }
        const { children, ...rest } = node; // drop original children reference
        return filteredChildren.length > 0
            ? { ...rest, children: filteredChildren }
            : { ...rest };
    };

    return cloneWithFilteredChildren(tree);
}

/**
 * Returns a pruned copy of the tree containing only nodes that declare a target with the given targetType.
 * Ancestors are kept to preserve hierarchy; non-matching branches are removed.
 * @param {object} tree root metadata tree
 * @param {object} target target object containing targetType
 * @returns {object|null} pruned tree or null if no matches
 */
export function filterTreeWithTarget(tree, target) {
    const desiredTargetType = target?.targetType || target?.eventType;
    if (!desiredTargetType) return null;

    const matchTarget = node => {
        const targets = node?.interactionMetadata?.targets;
        if (!targets) return false;
        const arr = Array.isArray(targets) ? targets : [targets];
        return arr.some(t => t?.targetType === desiredTargetType);
    };

    const cloneWithFilteredChildren = node => {
        if (!node) return null;
        const filteredChildren = (node.children || [])
            .map(child => cloneWithFilteredChildren(child))
            .filter(Boolean);
        const isMatch = node.type === 'element' && matchTarget(node);
        if (!isMatch && filteredChildren.length === 0) {
            return null;
        }
        const { children, ...rest } = node;
        return filteredChildren.length > 0
            ? { ...rest, children: filteredChildren }
            : { ...rest };
    };

    return cloneWithFilteredChildren(tree);
}

/**
 * Collects targets for widgets that match the provided widgetType.
 * Returns an array of objects containing node id, title, and targets.
 * @param {string} widgetType widget type to match (e.g., 'table', 'map')
 * @param {object} layerInvolved optional layer object with name and id
 * @returns {array} [{ id, title, targets }]
 */
export function getTargetsByWidgetType(widgetType, layerInvolved) {
    if (!widgetType) return [];
    const events = WIDGET_EVENTS_BY_TYPE[widgetType] || [];
    const targetTypes = events
        .map(ev => EVENT_TARGET_MAP[ev.eventType] || [])
        .flat();
    const uniqueTargetTypes = Array.from(new Set(targetTypes));
    return uniqueTargetTypes.map(tType => ({
        title: TARGET_TYPE_LABELS[tType] || tType,
        targetType: tType,
        type: tType,
        glyph: 'filter',
        dataType: DATATYPES.LAYER_FILTER,
        constraints: layerInvolved ? {
            layer: {
                name: layerInvolved.name || '',
                id: layerInvolved.id || ''
            }
        } : {}
    }));
}

