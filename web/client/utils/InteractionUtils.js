
export const DATATYPES = {
    LAYER_FILTER: 'LAYER_FILTER'
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

export const isConfigurationValidForTarget = (configuration, target, event) => {
    return false; // TODO: implement configuration validation rules
};

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
            targets: [{
                targetType: "applyFilter",
                expectedDataType: "LAYER_FILTER",
                attributeName: "layerFilter.filters",
                constraints: {
                    layer: {
                        name: layer.name,
                        id: layer.id
                    }
                },
                mode: "upsert"
            },
            // TODO: if it has geometry, we can add a target BBOX_COORDINATES for filtering by extent
            {
                targetType: 'filterByViewport',
                expectedDataType: 'BBOX_COORDINATES',
                attributeName: 'layerFilter.filters',
                mode: 'upsert'
            }
            ]
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
    const tree = {
        type: "element",
        name: "root",
        children: []
    };

    if (plugins.includes("Map")) {
        tree.children.push(generateMapMetadataTree(mapState, layers));
    }

    if (plugins.includes("Widgets")) {
        tree.children.push(generateWidgetsMetadataTree(widgets));
    }
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

