
export const DATATYPES = {
    LAYER_FILTER: 'LAYER_FILTER',
    LAYER_STYLE: 'LAYER_STYLE'
};

export const EVENTS = {
    FILTER_CHANGE: 'filter_change'
};

export const TARGET_TYPES = {
    APPLY_FILTER: 'applyFilter',
    APPLY_STYLE: 'applyStyle'
};

// Human-readable labels for target types
export const TARGET_TYPE_LABELS = {
    [TARGET_TYPES.APPLY_FILTER]: 'Apply filter',
    [TARGET_TYPES.APPLY_STYLE]: 'Apply style'
};

// Glyph icons for target types
export const TARGET_TYPE_GLYPHS = {
    [TARGET_TYPES.APPLY_FILTER]: 'filter',
    [TARGET_TYPES.APPLY_STYLE]: 'style'
};

/**
 * Map of events to the target types they typically emit/drive.
 * Values are arrays to support multiple targets per event.
 */
export const EVENT_TARGET_MAP = {
    [EVENTS.FILTER_CHANGE]: [TARGET_TYPES.APPLY_FILTER, TARGET_TYPES.APPLY_STYLE]
};

export const TARGET_EVENT_DATA_TYPES = {
    [TARGET_TYPES.APPLY_FILTER]: DATATYPES.LAYER_FILTER,
    [TARGET_TYPES.APPLY_STYLE]: DATATYPES.LAYER_STYLE
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
        { eventType: EVENTS.FILTER_CHANGE, dataType: DATATYPES.LAYER_FILTER }
    ],
    counter: [],
    filter: [
        {eventType: EVENTS.FILTER_CHANGE, dataType: DATATYPES.LAYER_FILTER }
    ]
};

// Targets available by widget type (or sub-type)
export const WIDGET_TARGETS_BY_TYPE = {
    chartTrace: [
        {
            targetType: TARGET_TYPES.APPLY_FILTER,
            expectedDataType: DATATYPES.LAYER_FILTER,
            constraints: {}
        }
    ],
    layer: [
        {
            targetType: TARGET_TYPES.APPLY_FILTER,
            expectedDataType: DATATYPES.LAYER_FILTER,
            constraints: {}
        },
        {
            targetType: TARGET_TYPES.APPLY_STYLE,
            expectedDataType: DATATYPES.LAYER_STYLE,
            constraints: {}
        }
    ],
    table: [
        {
            targetType: TARGET_TYPES.APPLY_FILTER,
            expectedDataType: DATATYPES.LAYER_FILTER,
            constraints: {}
        }
    ],
    counter: [
        {
            targetType: TARGET_TYPES.APPLY_FILTER,
            expectedDataType: DATATYPES.LAYER_FILTER,
            constraints: {}
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
        name: name
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
 * @param {object} node the node object with interactionMetadata from interactionTree
 * @param {object} target the target object with expectedDataType and constraint
 * @param {object} configuration the configuration object (default: {})
 * @returns {object} object with directlyPluggable and configuredToForcePlug boolean flags
 */
export function getItemPluggableStatus(node, target, configuration = {}) {
    const interactionMetadata = node?.interactionMetadata;
    if (!interactionMetadata) {
        return {
            directlyPluggable: false,
            configuredToForcePlug: false
        };
    }

    // Check if directly pluggable: constraints match
    const directlyPluggable = (interactionMetadata?.targets || []).find(t => {
        return t.expectedDataType === target.expectedDataType &&
            JSON.stringify(t.constraints) === JSON.stringify(target?.constraints);
    }) !== undefined;

    // Check if configured to force plug
    const configuredToForcePlug = configuration?.forcePlug === true;

    return {
        directlyPluggable,
        configuredToForcePlug
    };
}

/**
 * Creates base properties shared by both element and collection nodes.
 * @param {string} title the title
 * @param {string} icon the icon identifier
 * @param {string} id optional id
 * @returns {object} base properties object
 */
function createBaseProperties(title, icon, id) {
    return {
        title,
        ...(icon ? {icon} : {}),
        ...(id ? {id} : {})
    };
}

/**
 * Creates a base element tree node structure.
 * @param {object} item the item object (widget, trace, etc.)
 * @param {string} icon the icon identifier
 * @param {string} title optional title override
 * @returns {object} the base element tree node
 */
function createBaseElementNode(item, icon, title) {
    return {
        type: "element",
        ...createBaseProperties(title || item?.title || "No title", icon, item?.id)
    };
}

/**
 * Creates a base collection tree node structure.
 * @param {string} title the collection title
 * @param {array} children the children array
 * @param {string} icon optional icon identifier
 * @param {string} id optional id
 * @returns {object} the base collection tree node
 */
function createBaseCollectionNode(title, children = [], icon, id) {
    return {
        type: "collection",
        ...createBaseProperties(title, icon, id),
        staticallyNamedCollection: true,
        ...(children.length > 0 ? {children} : {})
    };
}

export function generateLayerMetadataTree(layer) {
    const baseNode = createBaseElementNode(layer, '1-layer');
    return {
        ...baseNode,
        interactionMetadata: {
            targets: WIDGET_TARGETS_BY_TYPE.layer.map(t => {
                return {
                    ...t,
                    constraints: {
                        layer: createLayerConstraint(layer.name)
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
        return createBaseCollectionNode("Maps", [], undefined, "maps");
    }
    const mapCollectionNodes = maps
        .filter(map => map?.layers && Array.isArray(map.layers))
        .map(map => {
            const layerNodes = generateLayersMetadataTree(map.layers);
            const layersCollection = createBaseCollectionNode(
                "Layers",
                layerNodes,
                "1-layer",
                "layers"
            );
            const baseNode = createBaseElementNode(map, 'map');
            return {
                ...baseNode,
                type: "collection",
                ...createBaseProperties(map.name || "No Title", undefined, map.mapId),
                children: [layersCollection]
            };
        });

    return createBaseCollectionNode("Maps", mapCollectionNodes, undefined, "maps");
}

/**
 * Maps trace type to icon name.
 * @param {string} traceType the trace type (bar, pie, line)
 * @returns {string} the icon name
 */
function getTraceIcon(traceType) {
    if (traceType === 'bar') return 'bar-chart';
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
            ],
            targets: WIDGET_TARGETS_BY_TYPE.chartTrace.map(t => ({
                ...t,
                constraints: t.constraints?.layer ? t.constraints : {
                    layer: createLayerConstraint(trace?.layer?.name)
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
    const tracesCollection = createBaseCollectionNode(
        "Traces",
        (chart?.traces || []).map(generateChartTraceTreeNode),
        undefined,
        "traces"
    );
    const baseNode = createBaseElementNode(chart, 'stats', chart?.name);
    return {
        ...baseNode,
        type: "collection",
        ...createBaseProperties(chart?.name, undefined, chart?.chartId || chart?.id),
        children: [tracesCollection]
    };
}

/**
 * Generates a tree node for a chart widget element.
 * @param {object} widget the chart widget object
 * @returns {object} the chart widget metadata tree node
 */
export function generateChartWidgetTreeNode(widget) {
    const charts = widget?.charts || [];
    const chartNodes = charts.map(chart => generateChartElementNode(chart));
    const chartsCollection = createBaseCollectionNode("Charts", chartNodes, undefined, "charts");
    const baseNode = createBaseElementNode(widget, "chart");
    return {
        ...baseNode,
        type: "collection",
        children: [chartsCollection]
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
            events: WIDGET_EVENTS_BY_WIDGET_TYPE.table,
            targets: WIDGET_TARGETS_BY_TYPE.table.map(t => ({
                ...t,
                constraints: t.constraints?.layer ? t.constraints : {
                    layer: createLayerConstraint(widget?.layer?.name)
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
            events: WIDGET_EVENTS_BY_WIDGET_TYPE.counter,
            targets: WIDGET_TARGETS_BY_TYPE.counter.map(t => ({
                ...t,
                constraints: t.constraints?.layer ? t.constraints : {
                    layer: createLayerConstraint(widget?.layer?.name)
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
    const mapsCollection = generateMapWidgetLayersTree(widget.maps);
    const baseNode = createBaseElementNode(widget, 'map');
    return {
        ...baseNode,
        type: "collection",
        children: [mapsCollection]
    };
}

/**
 * Generates a tree node for an individual filter element.
 * @param {object} filter the filter object with id and title/label
 * @returns {object} the filter metadata tree node
 */
export function generateFilterTreeNode(filter) {
    const baseNode = createBaseElementNode(filter, 'filter', filter?.title);
    return {
        ...baseNode,
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
    const filterNodes = widget?.filters?.map(generateFilterTreeNode) || [];
    const baseNode = createBaseElementNode(widget, 'filter', "Filters");
    return {
        ...baseNode,
        type: 'collection',
        children: filterNodes
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
            ...baseNode
        };
    }
}


/**
 * Recursively adds name (path) to all nodes in a tree.
 * Path format matches: collectionId[elementId].collectionId[elementId]...
 * Example: widgets[chart-1].traces[trace-1]
 * @param {object} node the tree node
 * @param {string} currentPath the current path for this node (default: "")
 * @returns {object} the node with name added
 */
export function addNodePathToTree(node, currentPath = "") {
    if (!node) return node;

    // Build path segment based on staticallyNamedCollection property
    let nodePath = currentPath;

    // Special case: root node should be empty string
    if (currentPath === "" && node?.id === "root") {
        nodePath = "";
    } else if (node.staticallyNamedCollection && node.id) {
        // Statically named collection (widgets, traces, layers, etc.): use dot notation
        nodePath = currentPath === "" ? node.id : `${currentPath}.${node.id}`;
    } else if (node.id) {
        // Element (widget, chart, trace, etc.): use brackets with id
        nodePath = `${currentPath}[${node.id}]`;
    }

    // Add name to current node
    const updatedNode = {
        ...node,
        nodePath
    };

    // Recursively process children
    if (node.children && Array.isArray(node.children)) {
        updatedNode.children = node.children.map(child =>
            addNodePathToTree(child, nodePath)
        );
    }

    return updatedNode;
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

    const mapLayersNodes = mapLayers?.length > 0 ? [
        createBaseCollectionNode("Layers", generateLayersMetadataTree(mapLayers), "1-layer", "layers")
    ] : [];

    const widgetsCollection = createBaseCollectionNode("Widgets", widgetNodes, "widgets", "widgets");
    const collections = [widgetsCollection];
    if (mapLayersNodes.length > 0) {
        const mapsCollection = createBaseCollectionNode("Map", mapLayersNodes, "1-map", "map");
        collections.push(mapsCollection);
    }

    const tree = createBaseCollectionNode("Root", collections, undefined, "root");

    // Add name (path) to all nodes in the tree
    return addNodePathToTree(tree);
}

/**
 * Detaches/flattens collections that have only one child collection.
 * Moves the child collection's children directly into the parent and removes the intermediate collection.
 * @param {object} tree the tree node to process
 * @param {array} excludeChecksOn optional array of collection ids to exclude from detaching
 * @returns {object} the tree with collections detached where applicable
 */
export function detachSingleChildCollections(tree, excludeChecksOn = []) {
    if (!tree) return tree;

    const shouldDetach = (collectionId) => {
        // If excludeChecksOn is provided and id matches, don't detach
        if (excludeChecksOn && Array.isArray(excludeChecksOn) && excludeChecksOn.length > 0) {
            return !excludeChecksOn.includes(collectionId);
        }
        // Otherwise, detach by default
        return true;
    };

    const processNode = (node) => {
        if (!node || !node.children || !Array.isArray(node.children)) {
            return node;
        }

        // Process children first
        let processedChildren = node.children.map(child => processNode(child));

        // Check if this is a collection with exactly one child that is also a collection
        if (node.type === 'collection' &&
            processedChildren.length === 1 &&
            processedChildren[0]?.type === 'collection' &&
            shouldDetach(processedChildren[0].id)) {
            // Move the child collection's children to this node
            const singleChild = processedChildren[0];
            processedChildren = singleChild.children || [];
        }

        // Return updated node with processed children
        return {
            ...node,
            children: processedChildren.length > 0 ? processedChildren : undefined
        };
    };

    return processNode(tree);
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
 * Gets possible targets for editing a widget of the specified widgetType.
 * Currently only supports filter widget type.
 * @param {string} widgetType widget type (currently only 'filter' is supported)
 * @param {object} layerInvolved optional layer object with name and id
 * @returns {array} [{ title, targetType, glyph, expectedDataType, constraint }]
 */
export function getPossibleTargetsEditingWidget(widgetType, layerInvolved) {
    if (widgetType === 'filter') {
        return [{
            title: TARGET_TYPE_LABELS[TARGET_TYPES.APPLY_FILTER],
            targetType: TARGET_TYPES.APPLY_FILTER,
            glyph: TARGET_TYPE_GLYPHS[TARGET_TYPES.APPLY_FILTER],
            expectedDataType: TARGET_EVENT_DATA_TYPES[TARGET_TYPES.APPLY_FILTER],
            constraints: layerInvolved ? {
                layer: createLayerConstraint(layerInvolved.name)
            } : {}
        },
        {
            title: TARGET_TYPE_LABELS[TARGET_TYPES.APPLY_STYLE],
            targetType: TARGET_TYPES.APPLY_STYLE,
            glyph: TARGET_TYPE_GLYPHS[TARGET_TYPES.APPLY_STYLE],
            expectedDataType: TARGET_EVENT_DATA_TYPES[TARGET_TYPES.APPLY_STYLE],
            constraints: layerInvolved ? {
                layer: createLayerConstraint(layerInvolved.name)
            } : {}
        }
        ];
    }
    return [];
}

/**
 * Finds a node by its id in the tree and returns the node object.
 * @param {object} tree root metadata tree
 * @param {string} nodeId the id of the node to find
 * @returns {object|null} the found node object, or null if not found
 */
export function findNodeById(tree, nodeId) {
    if (!tree || !nodeId) {
        return null;
    }

    const search = (node) => {
        if (node?.id === nodeId) {
            return node;
        }

        if (node?.children && Array.isArray(node.children)) {
            for (const child of node.children) {
                const found = search(child);
                if (found) {
                    return found;
                }
            }
        }

        return null;
    };

    return search(tree);
}

/**
 * Extracts a trace object from a widget object using a node path.
 * Loops through all charts and traces to find the matching trace by ID.
 * @param {object} widget the widget object containing charts and traces
 * @param {string} nodePath the node path (e.g., "widgets[widgetId].traces[traceId]")
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
