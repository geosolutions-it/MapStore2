import expect from 'expect';
import {
    generateChartWidgetTreeNode,
    generateRootTree,
    filterTreeWithTarget,
    generateTableWidgetTreeNode,
    generateCounterWidgetTreeNode,
    generateMapWidgetTreeNode,
    generateDynamicFilterWidgetTreeNode,
    generateLayersMetadataTree,
    detachSingleChildCollections,
    addNodePathToTree,
    filterDimensionTreeByValueAttributeType,
    hasAllowedDimensionTarget,
    isMapTimeTarget,
    isLayerDimensionTarget,
    getDisplayInteractionTargetTree,
    hasConnectableTargetNodes
} from '../InteractionUtils';

// Shared test data for all widget tests
const testWidgets = {
    // Chart widget with single chart (for single chart test)
    chartWidgetSingle: {
        id: 'chart-widget-single',
        widgetType: 'chart',
        title: 'Single Chart Widget',
        charts: [{
            chartId: 'chart-1',
            traces: [{
                id: 'trace-1',
                type: 'pie',
                layer: { name: 'gs:us_states', id: 'layer-1' }
            }, {
                id: 'trace-2',
                type: 'bar',
                layer: { name: 'topp:states', id: 'layer-2' }
            }]
        }]
    },
    // Chart widget with multiple charts (already tested, but can be reused)
    chartWidgetMultiple: {
        id: 'chart-widget-multiple',
        widgetType: 'chart',
        title: 'Multiple Charts Widget',
        charts: [{
            chartId: 'chart-1',
            traces: [{
                id: 'trace-1',
                type: 'pie',
                layer: { name: 'gs:us_states' }
            }]
        }, {
            chartId: 'chart-2',
            traces: [{
                id: 'trace-2',
                type: 'bar',
                layer: { name: 'topp:states' }
            }]
        }]
    },
    // Table widget with complete data
    tableWidget: {
        id: 'table-widget-1',
        widgetType: 'table',
        title: 'Table Widget',
        layer: { name: 'gs:table_layer', id: 'table-layer-1' }
    },
    // Counter widget with complete data
    counterWidget: {
        id: 'counter-widget-1',
        widgetType: 'counter',
        title: 'Counter Widget',
        layer: { name: 'gs:counter_layer', id: 'counter-layer-1' }
    },
    // Map widget with maps and layers
    mapWidget: {
        id: 'map-widget-1',
        widgetType: 'map',
        title: 'Map Widget',
        maps: [{
            mapId: 'map-1',
            name: 'Map 1',
            layers: [{
                name: 'layer-1',
                id: 'layer-1',
                type: 'wms',
                group: 'overlay'
            }, {
                name: 'layer-2',
                id: 'layer-2',
                type: 'wfs',
                group: 'overlay'
            }]
        }]
    },
    // Filter widget with filters
    filterWidget: {
        id: 'filter-widget-1',
        widgetType: 'filter',
        title: 'Filter Widget',
        filters: [{
            id: 'filter-1',
            label: 'Filter 1',
            title: 'First Filter'
        }, {
            id: 'filter-2',
            label: 'Filter 2',
            title: 'Second Filter'
        }]
    }
};

describe('InteractionUtils', () => {

    describe('generateChartWidgetTreeNode', () => {
        it('generates chart widget tree node with single chart', () => {
            const tree = generateChartWidgetTreeNode(testWidgets.chartWidgetSingle);

            expect(tree.type).toBe('collection');
            expect(tree.id).toBe('chart-widget-single');
            expect(tree.children.length).toBe(1);
            expect(tree.children[0].id).toBe('charts');
            expect(tree.children[0].staticallyNamedCollection).toBe(true);
            expect(tree.children[0].children.length).toBe(1);
            expect(tree.children[0].children[0].id).toBe('chart-1');
            expect(tree.children[0].children[0].children.length).toBe(1);
            expect(tree.children[0].children[0].children[0].id).toBe('traces');
            expect(tree.children[0].children[0].children[0].children.length).toBe(2);
            expect(tree.children[0].children[0].children[0].children[0].id).toBe('trace-1');
        });
    });

    describe('isMapTimeTarget', () => {
        it('returns true for a map.time target node path', () => {
            expect(isMapTimeTarget('map.time')).toBe(true);
        });

        it('returns false for non-map-time targets', () => {
            expect(isMapTimeTarget('map.layers[layer-1]')).toBe(false);
            expect(isMapTimeTarget('widgets[foo].maps[bar].time')).toBe(false);
        });
    });

    describe('isLayerDimensionTarget', () => {
        it('returns true for layer time and elevation target node paths', () => {
            expect(isLayerDimensionTarget('map.layers[layer-1].params.time')).toBe(true);
            expect(isLayerDimensionTarget('map.layers[layer-1].params.elevation')).toBe(true);
            expect(isLayerDimensionTarget('widgets[map-widget].maps[map-1].layers[layer-1].params.time')).toBe(true);
            expect(isLayerDimensionTarget('widgets[map-widget].maps[map-1].layers[layer-1].params.elevation')).toBe(true);
        });

        it('returns false for non-layer-dimension targets', () => {
            expect(isLayerDimensionTarget('map.time')).toBe(false);
            expect(isLayerDimensionTarget('widgets[foo].maps[bar].time')).toBe(false);
            expect(isLayerDimensionTarget('widgets[foo].params.time')).toBe(false);
            expect(isLayerDimensionTarget('map.layers[layer-1]')).toBe(false);
            expect(isLayerDimensionTarget('map.layers[layer-1].params.style')).toBe(false);
        });
    });

    describe('generateTableWidgetTreeNode', () => {
        it('generates table widget tree node with layer and interaction metadata', () => {
            const tree = generateTableWidgetTreeNode(testWidgets.tableWidget);

            expect(tree.type).toBe('element');
            expect(tree.id).toBe('table-widget-1');
            expect(tree.interactionMetadata !== undefined).toBe(true);
            expect(tree.interactionMetadata.targets.length).toBeGreaterThan(0);
            expect(tree.interactionMetadata.targets[0].constraints.layer.name).toBe('gs:table_layer');
        });
    });

    describe('generateCounterWidgetTreeNode', () => {
        it('generates counter widget tree node with layer and interaction metadata', () => {
            const tree = generateCounterWidgetTreeNode(testWidgets.counterWidget);

            expect(tree.type).toBe('element');
            expect(tree.id).toBe('counter-widget-1');
            expect(tree.interactionMetadata !== undefined).toBe(true);
            expect(tree.interactionMetadata.targets.length).toBeGreaterThan(0);
            expect(tree.interactionMetadata.targets[0].constraints.layer.name).toBe('gs:counter_layer');
        });
    });

    describe('generateMapWidgetTreeNode', () => {
        it('generates map widget tree node with maps collection', () => {
            const tree = generateMapWidgetTreeNode(testWidgets.mapWidget);

            expect(tree.type).toBe('collection');
            expect(tree.id).toBe('map-widget-1');
            expect(tree.children.length).toBe(1);
            expect(tree.children[0].id).toBe('maps');
        });


        it('generates layer element and dimension collection for each supported layer', () => {
            const layers = [{
                name: 'layer-1',
                id: 'layer-1',
                type: 'wms',
                group: 'overlay',
                dimensions: [{
                    name: 'time'
                }]
            }];

            const tree = generateLayersMetadataTree(layers);

            expect(tree.length).toBe(2);
            expect(tree[0].type).toBe('element');
            expect(tree[0].id).toBe('layer-1');
            expect(tree[1].type).toBe('collection');
            expect(tree[1].id).toBe('layer-1');
            expect(tree[1].children.length).toBe(1);
            expect(tree[1].children[0].type).toBe('element');
            expect(tree[1].children[0].id).toBe('params.time');
            expect(tree[1].children[0].title).toBe('Time');
            expect(tree[1].children[0].interactionMetadata.targets[0].constraints.layer.name).toBe('layer-1');
        });


        it('filters dimension nodes by value attribute type', () => {
            const tree = {
                type: 'collection',
                id: 'root',
                children: [
                    {
                        type: 'element',
                        id: 'foo',
                        title: 'Foo'
                    },
                    {
                        type: 'collection',
                        id: 'layer-1',
                        children: [
                            {
                                type: 'element',
                                id: 'params.time',
                                title: 'Time'
                            },
                            {
                                type: 'element',
                                id: 'params.elevation',
                                title: 'Elevation'
                            }
                        ]
                    }
                ]
            };

            const dateTree = filterDimensionTreeByValueAttributeType(tree, 'date');
            expect(dateTree.children[1].children.length).toBe(1);
            expect(dateTree.children[1].children[0].id).toBe('params.time');

            const numberTree = filterDimensionTreeByValueAttributeType(tree, 'number');
            expect(numberTree.children[1].children.length).toBe(1);
            expect(numberTree.children[1].children[0].id).toBe('params.elevation');

            expect(filterDimensionTreeByValueAttributeType(tree, 'string')).toBe(null);
        });

        it('detects whether a layer has an allowed dimension target for a value attribute type', () => {
            const layer = {
                name: 'layer-1',
                dimensions: [
                    { name: 'time' },
                    { name: 'elevation' }
                ]
            };

            expect(hasAllowedDimensionTarget(layer, 'date')).toBe(true);
            expect(hasAllowedDimensionTarget(layer, 'number')).toBe(true);
            expect(hasAllowedDimensionTarget(layer, 'string')).toBe(false);
        });

        it('uses dot nodePath mode for dimension nodes under a layer', () => {
            const rootNode = {
                id: 'root',
                type: 'collection',
                staticallyNamedCollection: true,
                children: [
                    {
                        id: 'widgets',
                        type: 'collection',
                        staticallyNamedCollection: true,
                        children: [
                            {
                                id: 'map-widget-1',
                                type: 'collection',
                                children: [
                                    {
                                        id: 'maps',
                                        type: 'collection',
                                        staticallyNamedCollection: true,
                                        children: [
                                            {
                                                id: 'map-1',
                                                type: 'collection',
                                                children: [
                                                    {
                                                        id: 'layers',
                                                        type: 'collection',
                                                        staticallyNamedCollection: true,
                                                        children: [
                                                            {
                                                                id: 'layer-1',
                                                                type: 'element',
                                                                children: [
                                                                    {
                                                                        id: 'params.time',
                                                                        type: 'element',
                                                                        nodePathMode: 'dot'
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            const result = addNodePathToTree(rootNode);
            const widgetsCollection = result.children[0];
            const mapWidget = widgetsCollection.children[0];
            const mapsCollection = mapWidget.children[0];
            const mapCollection = mapsCollection.children[0];
            const layersCollection = mapCollection.children[0];
            const layerNode = layersCollection.children[0];
            const timeNode = layerNode.children[0];

            expect(timeNode.nodePath).toBe('widgets[map-widget-1].maps[map-1].layers[layer-1].params.time');
        });
    });

    describe('generateDynamicFilterWidgetTreeNode', () => {
        it('generates filter widget tree node with filters collection', () => {
            const tree = generateDynamicFilterWidgetTreeNode(testWidgets.filterWidget);

            expect(tree.type).toBe('collection');
            expect(tree.id).toBe('filter-widget-1');
            expect(tree.children.length).toBe(2);
            expect(tree.children[0].id).toBe('filter-1');
        });
    });

    describe('generateRootTree', () => {
        it('generates root tree with all widget types', () => {
            const widgets = [
                {
                    id: 'chart-widget-1',
                    widgetType: 'chart',
                    title: 'Chart Widget',
                    charts: [{
                        chartId: 'chart-1',
                        traces: [{
                            id: 'trace-1',
                            type: 'pie',
                            layer: { name: 'layer1' }
                        }]
                    }]
                },
                {
                    id: 'table-widget-1',
                    widgetType: 'table',
                    title: 'Table Widget'
                },
                {
                    id: 'counter-widget-1',
                    widgetType: 'counter',
                    title: 'Counter Widget'
                }
            ];

            const rootTree = generateRootTree(widgets);

            expect(rootTree.id).toBe('root');
            expect(rootTree.children.length).toBe(1);

            // Verify widgets collection
            const widgetsCollection = rootTree.children[0];
            expect(widgetsCollection.type).toBe('collection');
            expect(widgetsCollection.id).toBe('widgets');
            expect(widgetsCollection.children.length).toBe(3);

            // Verify chart widget
            const chartWidget = widgetsCollection.children[0];
            expect(chartWidget.id).toBe('chart-widget-1');
            expect(chartWidget.children.length).toBe(1);

            // Verify table widget
            const tableWidget = widgetsCollection.children[1];
            expect(tableWidget.id).toBe('table-widget-1');
            expect(tableWidget.type).toBe('element');

            // Verify counter widget
            const counterWidget = widgetsCollection.children[2];
            expect(counterWidget.id).toBe('counter-widget-1');
            expect(counterWidget.type).toBe('element');
        });

        it('places map time at the root map level when timeline is enabled', () => {
            const rootTree = generateRootTree([], [{
                name: 'layer-1',
                id: 'layer-1',
                type: 'wms',
                group: 'overlay',
                dimensions: [{
                    name: 'time'
                }]
            }], {
                timelineEnabled: true
            });

            const mapCollection = rootTree.children[1];

            expect(mapCollection.id).toBe('map');
            expect(mapCollection.children[0].id).toBe('time');
            expect(mapCollection.children[1].id).toBe('layers');
        });
    });

    describe('filterTreeWithTarget', () => {
        it('filters tree keeping only nodes with a given target', () => {
            const sampleTree = {
                type: 'element',
                name: 'root',
                children: [{
                    type: 'collection',
                    id: 'widgets',
                    children: [{
                        type: 'element',
                        id: 'table-1',
                        interactionMetadata: {
                            targets: [{
                                targetType: 'filterByViewport',
                                expectedDataType: 'BBOX_COORDINATES'
                            }]
                        }
                    }, {
                        type: 'element',
                        id: 'chart-1',
                        interactionMetadata: {
                            targets: [{
                                targetType: 'applyFilter',
                                expectedDataType: 'LAYER_FILTER'
                            }]
                        }
                    }]
                }]
            };

            const filtered = filterTreeWithTarget(sampleTree, { targetType: 'applyFilter' });
            const widgetsCollection = filtered.children[0];

            // eslint-disable-next-line no-console
            console.log('FilterTreeWithTarget result', widgetsCollection);
            expect(widgetsCollection.id).toBe('widgets');
            expect(widgetsCollection.children.length).toBe(1);
            expect(widgetsCollection.children[0].id).toBe('chart-1');
        });
    });


    describe('detachSingleChildCollections', () => {
        const widgetTree = {
            type: "collection",
            title: "",
            id: "root",
            staticallyNamedCollection: true,
            children: [
                {
                    type: "collection",
                    title: "Widgets",
                    icon: "dashboard",
                    id: "widgets",
                    staticallyNamedCollection: true,
                    children: [
                        {
                            type: "collection",
                            title: "Chart",
                            icon: "chart",
                            id: "chart-widget-id",
                            children: [
                                {
                                    type: "collection",
                                    icon: "stats",
                                    id: "chart-id",
                                    children: [
                                        {
                                            type: "collection",
                                            title: "Traces",
                                            id: "traces",
                                            staticallyNamedCollection: true,
                                            children: [
                                                {
                                                    type: "element",
                                                    title: "No title",
                                                    icon: "stats",
                                                    id: "trace-id",
                                                    interactionMetadata: {
                                                        events: [],
                                                        targets: []
                                                    },
                                                    nodePath: "trace-node-path"
                                                }
                                            ],
                                            nodePath: "trace-collection-node-path"
                                        }
                                    ],
                                    nodePath: "chart-collection-node-path"
                                }
                            ],
                            nodePath: "chart-widget-node-path"
                        }
                    ],
                    nodePath: "widget-collection-node-path"
                }
            ],
            nodePath: ""
        };

        it('should detach single-child collections by default', () => {
            const result = detachSingleChildCollections(widgetTree);

            expect(result.children.length).toBe(1);
            expect(result.children[0].id).toBe('trace-id');
            expect(result.children[0].nodePath).toBe('trace-node-path');

        });

        it('should not detach collections when excluded via excludeChecksOn', () => {
            const result = detachSingleChildCollections(widgetTree, ['widgets', 'traces']);
            const widgetCollection = result.children[0];
            expect(widgetCollection?.id ).toBe('widgets');
            expect(widgetCollection.nodePath).toBe("widget-collection-node-path");

            const tracesCollection = widgetCollection?.children[0];
            expect(tracesCollection?.id).toBe('traces');
            expect(tracesCollection.nodePath).toBe('trace-collection-node-path');
        });

        it('should preserve flagged layer dimension collections when they are the only child', () => {
            const tree = {
                type: 'collection',
                id: 'root',
                children: [{
                    type: 'collection',
                    id: 'layers',
                    children: [{
                        type: 'collection',
                        id: 'layer-1',
                        preserveWhenSingleChild: true,
                        children: [{
                            type: 'element',
                            id: 'elevation'
                        }]
                    }]
                }]
            };

            const result = detachSingleChildCollections(tree);
            expect(result.children[0].id).toBe('layer-1');
            expect(result.children[0].children[0].id).toBe('elevation');
        });
    });

    describe('getDisplayInteractionTargetTree and hasConnectableTargetNodes', () => {
        const interactionTree = {
            type: 'collection',
            id: 'root',
            children: [{
                type: 'collection',
                id: 'widgets',
                children: [{
                    type: 'element',
                    id: 'chart-1',
                    interactionMetadata: {
                        targets: [{
                            targetType: 'applyFilter'
                        }]
                    }
                }]
            }, {
                type: 'collection',
                id: 'map',
                children: [{
                    type: 'collection',
                    id: 'layers',
                    children: [{
                        type: 'element',
                        id: 'elevation',
                        interactionMetadata: {
                            targets: [{
                                targetType: 'applyDimension',
                                constraints: {
                                    dimension: {
                                        name: 'elevation',
                                        valueAttributeTypes: ['number']
                                    }
                                }
                            }]
                        }
                    }]
                }]
            }]
        };

        it('should return a display tree for normal target types', () => {
            const result = getDisplayInteractionTargetTree(interactionTree, { targetType: 'applyFilter' });

            expect(result.children.length).toBe(1);
            expect(result.children[0].id).toBe('widgets');
            expect(result.children[0].children[0].id).toBe('chart-1');
            expect(hasConnectableTargetNodes(interactionTree, { targetType: 'applyFilter' })).toBe(true);
        });

        it('should filter apply dimension targets by value attribute type', () => {
            const target = { targetType: 'applyDimension' };

            expect(hasConnectableTargetNodes(interactionTree, target, 'number')).toBe(true);
            expect(hasConnectableTargetNodes(interactionTree, target, 'string')).toBe(false);
        });
    });

    describe('addNodePathToTree', () => {
        it('should build paths for nested elements and collections', () => {
            const rootNode = {
                id: 'root',
                type: 'collection',
                staticallyNamedCollection: true,
                children: [
                    {
                        id: 'widgets',
                        type: 'collection',
                        staticallyNamedCollection: true,
                        children: [
                            {
                                id: 'widget-1',
                                type: 'element',
                                children: [
                                    {
                                        id: 'traces',
                                        type: 'collection',
                                        staticallyNamedCollection: true,
                                        children: [
                                            {
                                                id: 'trace-1',
                                                type: 'element'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'map',
                        type: 'collection',
                        staticallyNamedCollection: true,
                        children: [
                            {
                                id: 'layers',
                                type: 'collection',
                                staticallyNamedCollection: true,
                                children: [
                                    {
                                        id: 'layer-1',
                                        type: 'element'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            const result = addNodePathToTree(rootNode);
            expect(result.nodePath).toBe('');
            expect(result.children[0].nodePath).toBe('widgets');
            expect(result.children[0].children[0].nodePath).toBe('widgets[widget-1]');
            expect(result.children[0].children[0].children[0].nodePath).toBe('widgets[widget-1].traces');
            expect(result.children[0].children[0].children[0].children[0].nodePath).toBe('widgets[widget-1].traces[trace-1]');
            expect(result.children[1].nodePath).toBe('map');
            expect(result.children[1].children[0].nodePath).toBe('map.layers');
            expect(result.children[1].children[0].children[0].nodePath).toBe('map.layers[layer-1]');
        });
    });
});
