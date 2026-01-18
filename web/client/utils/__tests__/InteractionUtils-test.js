import expect from 'expect';
import {
    generateChartWidgetTreeNode,
    generateRootTree,
    filterTreeWithTarget,
    generateNodePath,
    generateTableWidgetTreeNode,
    generateCounterWidgetTreeNode,
    generateMapWidgetTreeNode,
    generateDynamicFilterWidgetTreeNode,
    detachSingleChildCollections
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
            expect(tree.nodeType).toBe('chart');
            expect(tree.children.length).toBe(1);
            expect(tree.children[0].name).toBe('traces');
            expect(tree.children[0].children.length).toBe(2);
        });
    });

    describe('generateTableWidgetTreeNode', () => {
        it('generates table widget tree node with layer and interaction metadata', () => {
            const tree = generateTableWidgetTreeNode(testWidgets.tableWidget);

            expect(tree.type).toBe('element');
            expect(tree.id).toBe('table-widget-1');
            expect(tree.nodeType).toBe('table');
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
            expect(tree.nodeType).toBe('counter');
            expect(tree.interactionMetadata !== undefined).toBe(true);
            expect(tree.interactionMetadata.targets.length).toBeGreaterThan(0);
            expect(tree.interactionMetadata.targets[0].constraints.layer.name).toBe('gs:counter_layer');
        });
    });

    describe('generateMapWidgetTreeNode', () => {
        it('generates map widget tree node with maps collection', () => {
            const tree = generateMapWidgetTreeNode(testWidgets.mapWidget);

            expect(tree.type).toBe('element');
            expect(tree.id).toBe('map-widget-1');
            expect(tree.nodeType).toBe('maps');
            expect(tree.children.length).toBe(1);
            expect(tree.children[0].name).toBe('maps');
        });
    });

    describe('generateDynamicFilterWidgetTreeNode', () => {
        it('generates filter widget tree node with filters collection', () => {
            const tree = generateDynamicFilterWidgetTreeNode(testWidgets.filterWidget);

            expect(tree.type).toBe('collection');
            expect(tree.id).toBe('filter-widget-1');
            expect(tree.nodeType).toBe('filter');
            expect(tree.children.length).toBe(2);
            expect(tree.children[0].id).toBe('filter-1');
            expect(tree.children[0].nodeType).toBe('filter');
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

            expect(rootTree.name).toBe('root');
            expect(rootTree.children.length).toBe(1);

            // Verify widgets collection
            const widgetsCollection = rootTree.children[0];
            expect(widgetsCollection.type).toBe('collection');
            expect(widgetsCollection.name).toBe('widgets');
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
    });

    describe('filterTreeWithTarget', () => {
        it('filters tree keeping only nodes with a given target', () => {
            const sampleTree = {
                type: 'element',
                name: 'root',
                children: [{
                    type: 'collection',
                    name: 'widgets',
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

        // TODO: complete tests
        });
    });

    describe('generateNodePath', () => {
        it('generates path for nodes in tree', () => {
            const sampleTree = {
                type: 'element',
                name: 'root',
                id: 'root',
                children: [{
                    type: 'collection',
                    name: 'widgets',
                    id: 'widgets',
                    children: [{
                        type: 'element',
                        id: 'table-1',
                        title: 'Table Widget 1',
                        interactionMetadata: {
                            events: [
                                { eventType: 'filter_change', dataType: 'LAYER_FILTER' }
                            ]
                        }
                    }, {
                        type: 'element',
                        id: 'chart-1',
                        title: 'Chart Widget 1',
                        children: [{
                            type: 'collection',
                            name: 'traces',
                            children: [{
                                type: 'element',
                                id: 'trace-1',
                                title: 'Trace 1'
                            }, {
                                type: 'element',
                                id: 'trace-2',
                                title: 'Trace 2'
                            }]
                        }]
                    }]
                }]
            };

            // Check 1: Generate path for top-level node
            const path1 = generateNodePath(sampleTree, 'table-1');
            expect(path1).toBe('root.widgets[table-1]');

            // Check 2: Generate path for nested node
            const path2 = generateNodePath(sampleTree, 'trace-2');
            expect(path2).toBe('root.widgets[chart-1].traces[trace-2]');

            // Check 3: Test error case - non-existent node
            const path3 = generateNodePath(sampleTree, 'non-existent');
            expect(path3).toBe(null);
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
                            icon: "stats",
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
            nodePath: "root"
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
    });
});
