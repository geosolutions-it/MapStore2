
export const DATATYPES = {
    LAYER_FILTER: 'LAYER_FILTER'
};

export const EVENTS = {
    FILTER_CHANGE: 'filter_change'
};

export const TARGET_TYPES = {
    APPLY_FILTER: 'applyFilter'
};

// Human-readable labels for target types
export const TARGET_TYPE_LABELS = {
    [TARGET_TYPES.APPLY_FILTER]: 'Apply filter'
};

// Glyph icons for target types
export const TARGET_TYPE_GLYPHS = {
    [TARGET_TYPES.APPLY_FILTER]: 'filter'
};

/**
 * Map of events to the target types they typically emit/drive.
 * Values are arrays to support multiple targets per event.
 */
export const EVENT_TARGET_MAP = {
    [EVENTS.FILTER_CHANGE]: [TARGET_TYPES.APPLY_FILTER]
};

export const TARGET_EVENT_DATA_TYPES = {
    [TARGET_TYPES.APPLY_FILTER]: DATATYPES.LAYER_FILTER
};

// Events available by widget type
export const WIDGET_EVENTS_BY_WIDGET_TYPE = {
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
        {eventType: EVENTS.FILTER_CHANGE, dataType: DATATYPES.LAYER_FILTER },
        {eventType: EVENTS.STYLE_CHANGE, dataType: DATATYPES.STYLE_NAME }
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
            targetType: TARGET_TYPES.APPLY_STYLE,
            expectedDataType: DATATYPES.STYLE_NAME,
            attributeName: "layer.style",
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

/**
 * Creates a layer constraint object with standardized name and id handling.
 * @param {string|""} name - The layer name
 * @param {string|""} id - The layer id
 * @returns {object} Layer constraint object with name (defaults to "") and id (defaults to undefined)
 */
export function createLayerConstraint(name) {
    return {
        name: name ?? ""
    };
}

export const getDirectlyPluggableTargets = (item, event) => {
    const interactionMetadata = item?.interactionMetadata;
    if (!interactionMetadata) return [];
    return (interactionMetadata?.targets || []).filter( t =>{
        return t.expectedDataType === event.dataType &&
        JSON.stringify(t.constraints) === JSON.stringify(event?.constraints);
    }
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

export const isConfigurationValidForTarget = () => true; // TODO: implement configuration validation rules

export const getConfiguredTargets = (item, event, configuration) => {
    const interactionMetadata = item?.interactionMetadata;
    if (!interactionMetadata) return [];
    return (interactionMetadata?.targets || []).filter( t =>
        t.expectedDataType === event.dataType &&
        isConfigurationValidForTarget(configuration, t, event)
    );
};

/**
 * Determines if an item is directly pluggable or configured to force plug.
 * @param {object} item the item object with interactionMetadata
 * @param {object} event the event object with dataType and constraints
 * @param {object} configuration the configuration object (default: {})
 * @returns {object} object with directlyPluggable and configuredToForcePlug boolean flags
 */
export function getItemPluggableStatus(item, event, configuration = {}) {
    const interactionMetadata = item?.interactionMetadata;
    if (!interactionMetadata) {
        return {
            directlyPluggable: false,
            configuredToForcePlug: false
        };
    }

    // Check if directly pluggable: constraints match
    const directlyPluggable = (interactionMetadata?.targets || []).find(t => {
        return t.expectedDataType === event.dataType &&
            JSON.stringify(t.constraints) === JSON.stringify(event?.constraints);
    }) !== undefined;

    // Check if configured to force plug
    const configuredToForcePlug = configuration?.forcePlug === true;

    return {
        directlyPluggable,
        configuredToForcePlug
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
        title: title || item?.title || "No title",
        icon,
        children
    };
}

export function generateLayerMetadataTree(layer) {
    const baseNode = createBaseElementNode(layer, '1-layer');
    return {
        ...baseNode,
        nodeType: "layer",
        interactionMetadata: {
            targets: WIDGET_TARGETS_BY_TYPE.layer.map(t => {
                return {
                    ...t,
                    constraints: {
                        layer: createLayerConstraint(layer.name, layer.id)
                    }
                };
            })
        }
    };
}
/**
 * Returns true if the layer supports interactions
 * @param {object} layer the layer
 * @returns {boolean}
 */
export function isInteractionSupported(layer) {
    return ['wms', 'wfs'].includes(layer?.type) && layer.group !== "background";
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
 * Generates collection nodes for each map config, where each collection contains layer nodes.
 * Each map config contains a layers array property.
 * @param {object[]} maps array of map configs, each containing a layers array property
 * @returns {object} a collection tree node named "maps" containing all map collection nodes
 */
export function generateMapWidgetLayersTree(maps) {
    if (!maps || !Array.isArray(maps)) {
        return {
            type: "collection",
            name: "maps",
            title: "Maps",
            children: []
        };
    }
    const mapCollectionNodes = maps
        .filter(map => map?.layers && Array.isArray(map.layers))
        .map(map => {
            const layerNodes = generateLayersMetadataTree(map.layers);
            const baseNode = createBaseElementNode(map, 'map', layerNodes);
            return {
                ...baseNode,
                type: "collection",
                id: map.mapId,
                title: map.name || "No Title"
            };
        })
        .filter(node => node.children && node.children.length > 0);

    return {
        type: "collection",
        name: "maps",
        title: "Maps",
        children: mapCollectionNodes
    };
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
        children: [
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

    const tree = {
        type: "element",
        name: "root",
        children: []
    };

    tree.children.push(generateMapMetadataTree(mapState, layers));

    return tree;
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
        nodeType: "trace",
        interactionMetadata: {
            events: [
            ],
            targets: WIDGET_TARGETS_BY_TYPE.chartTrace.map(t => ({
                ...t,
                constraints: t.constraints?.layer ? t.constraints : {
                    layer: createLayerConstraint(trace?.layer?.name, trace?.layer?.id)
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
function generateChartElementNode(chart) {
    return {
        type: "collection",
        id: chart?.chartId || chart?.id,
        title: chart?.name,
        icon: 'stats',
        nodeType: "chart",
        children: [{
            type: "collection",
            name: "traces",
            title: "Traces",
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

    // If there's only one chart, place traces directly under the widget node
    if (charts.length === 1) {
        const chart = charts[0];
        return {
            type: "collection",
            id: widget?.id,
            title: widget?.title,
            icon: "stats",
            nodeType: "chart",
            children: [{
                type: "collection",
                name: "traces",
                title: "Traces",
                interactionMetadata: {},
                children: (chart?.traces || []).map(generateChartTraceTreeNode)
            }]
        };
    }

    // If there are multiple charts, keep chart nodes as children
    return {
        type: "collection",
        id: widget?.id,
        title: widget?.title,
        icon: "stats",
        nodeType: "widget",
        children: charts.map(chart => generateChartElementNode(chart))
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
        nodeType: "table",
        interactionMetadata: {
            events: WIDGET_EVENTS_BY_WIDGET_TYPE.table,
            targets: WIDGET_TARGETS_BY_TYPE.table.map(t => ({
                ...t,
                constraints: t.constraints?.layer ? t.constraints : {
                    layer: createLayerConstraint(widget?.layer?.name, widget?.layer?.id)
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
        nodeType: "counter",
        interactionMetadata: {
            events: WIDGET_EVENTS_BY_WIDGET_TYPE.counter,
            targets: WIDGET_TARGETS_BY_TYPE.counter.map(t => ({
                ...t,
                constraints: t.constraints?.layer ? t.constraints : {
                    layer: createLayerConstraint(widget?.layer?.name, widget?.layer?.id)
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
    const mapsCollection = generateMapWidgetLayersTree(widget.maps);
    return {
        ...baseNode,
        nodeType: "maps",
        // interactionMetadata: {
        //     events: WIDGET_EVENTS_BY_TYPE.map
        // }
        children: [mapsCollection]
    };
}

/**
 * Generates a tree node for an individual filter element.
 * @param {object} filter the filter object with id and title/label
 * @returns {object} the filter metadata tree node
 */
export function generateFilterTreeNode(filter) {
    const baseNode = createBaseElementNode(filter, 'filter', [], filter?.label || filter?.title);
    return {
        ...baseNode,
        nodeType: "filter",
        interactionMetadata: {
            events: WIDGET_EVENTS_BY_WIDGET_TYPE.filter
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
        type: 'collection',
        title: "Filters",
        nodeType: "filter",
        // interactionMetadata: {
        //     events: WIDGET_EVENTS_BY_TYPE.filter
        // }
        children: widget?.filters?.map(generateFilterTreeNode)
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
        const baseNode = createBaseElementNode(widget, 'widget');
        return {
            ...baseNode,
            nodeType: "widget"
        };
    }
}


/**
 * Generates a root tree node containing all widget tree nodes.
 * @param {array} widgets array of widget objects
 * @returns {object} the root tree node with widgets collection as child TODO: CONSIDER FOR MAP also
 */
export function generateRootTree(widgets, mapLayers) {
    const widgetsArray = widgets || [];
    const widgetNodes = widgetsArray
        .filter(widget => widget !== null && widget !== undefined)
        .map(widget => generateWidgetTreeNode(widget));

    const mapLayersNodes = mapLayers?.length > 0 ? [{
        type: "collection",
        name: "layers",
        icon: "1-layer",
        title: "Layers",
        children: generateLayersMetadataTree(mapLayers)
    }] : [];

    const tree = {
        type: "collection",
        name: "root",
        children: [{
            type: "collection",
            name: "widgets",
            id: "widgets",
            title: "Widgets",
            icon: "dashboard",
            children: widgetNodes
        },
        ...mapLayersNodes.length > 0 ? [{
            type: "collection",
            name: "maps",
            id: "maps",
            icon: "1-layer",
            title: "Map",
            children: mapLayersNodes
        }] : []
        ]
    };
    return tree;
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
    const events = WIDGET_EVENTS_BY_WIDGET_TYPE[widgetType] || [];
    const targetTypes = events
        .map(ev => EVENT_TARGET_MAP[ev.eventType] || [])
        .flat();
    const uniqueTargetTypes = Array.from(new Set(targetTypes));
    return uniqueTargetTypes.map(tType => ({
        title: TARGET_TYPE_LABELS[tType] || tType,
        targetType: tType,
        type: tType,
        glyph: TARGET_TYPE_GLYPHS[tType],
        dataType: TARGET_EVENT_DATA_TYPES[tType],
        constraints: layerInvolved ? {
            layer: createLayerConstraint(layerInvolved.name, layerInvolved.id)
        } : {}
    }));
}

/**
 * Generates a string path to locate a node by its id in the tree.
 * The path format is: root.collectionName[elementId].collectionName[elementId]...
 * Example: root.widgets[chart-1].traces[trace-1]
 * @param {object} tree root metadata tree
 * @param {string} nodeId the id of the node to find
 * @returns {string|null} string path representing the navigation path, or null if node not found
 */
export function generateNodePath(tree, nodeId) {
    if (!tree || !nodeId) {
        // eslint-disable-next-line no-console
        console.log('generateNodePath: invalid input', { tree, nodeId });
        return null;
    }

    const findPath = (node, targetId, currentPath = 'root') => {
        // Check if current node matches
        if (node?.id === targetId) {
            // eslint-disable-next-line no-console
            console.log('generateNodePath: found node', { nodeId: targetId, path: currentPath });
            return currentPath;
        }

        // Search in children
        const children = node?.children || [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            let nextPath = currentPath;

            // Build path segment based on node type
            if (child.type === 'collection' && child.name) {
                // Collection: use the collection name
                nextPath = `${currentPath}.${child.name}`;
            } else if (child.id) {
                // Element: use [id] format
                nextPath = `${currentPath}[${child.id}]`;
            } else {
                // Fallback: use index if no name/id
                nextPath = `${currentPath}[${i}]`;
            }

            const childPath = findPath(child, targetId, nextPath);
            if (childPath !== null) {
                return childPath;
            }
        }

        return null;
    };

    const path = findPath(tree, nodeId);
    return path;
}


/**
 * Extracts a trace object from a widget object using a node path.
 * Loops through all charts and traces to find the matching trace by ID.
 * @param {object} widget the widget object containing charts and traces
 * @param {string} nodePath the node path (e.g., "root.widgets[widgetId].traces[traceId]")
 * @returns {object|null} the trace object if found, or null if not found
 */
export function extractTraceFromWidgetByNodePath(widget, nodePath) {
    if (!widget || !nodePath || typeof nodePath !== 'string') {
        return null;
    }

    // Extract traceId from the path - simple extraction of the last [id] after .traces
    const tracesMatch = nodePath.match(/\.traces\[([^\]]+)\]/);
    if (!tracesMatch) {
        return null;
    }
    const traceId = tracesMatch[1];

    // Loop through all charts and traces to find the matching trace
    const charts = widget?.charts || [];
    for (const chart of charts) {
        const traces = chart?.traces || [];
        for (const trace of traces) {
            if (trace.id === traceId) {
                return trace;
            }
        }
    }

    return null;
}

