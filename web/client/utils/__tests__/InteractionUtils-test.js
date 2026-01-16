import expect from 'expect';
import {
    generateChartWidgetTreeNode,
    generateRootTree,
    getWidgetEventsById,
    filterTreeByEvent,
    filterTreeWithTarget,
    generateNodePath,
    evaluatePath
} from '../InteractionUtils';
describe('InteractionUtils', () => {

    describe('generateChartWidgetTreeNode', () => {
        it('builds chart widget tree with multiple charts and traces', () => {
            const widget = {
                id: 'widget-id',
                widgetType: 'chart',
                title: 'US Workers',
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
            };

            const tree = generateChartWidgetTreeNode(widget);

            // 1. Verify widget structure
            expect(tree.type).toBe('collection');
            expect(tree.id).toBe('widget-id');
            expect(tree.children.length).toBe(2);

            // 2. Verify chart elements are direct children
            const firstChart = tree.children?.[0];
            expect(firstChart.type).toBe('collection');
            expect(firstChart.id).toBe('chart-1');

            // 3. Verify traces collection exists inside chart
            const tracesCollection = firstChart.children?.[0];
            expect(tracesCollection.type).toBe('collection');
            expect(tracesCollection.name).toBe('traces');

            // 4. Verify trace node structure and properties
            const traceNode = tracesCollection.children[0];
            expect(traceNode.id).toBe('trace-1');
            expect(traceNode.icon).toBe('pie-chart');
            expect(traceNode.interactionMetadata?.targets?.[0]?.expectedDataType).toBe('LAYER_FILTER');

            // 5. Verify multiple charts are handled correctly
            const secondChart = tree.children?.[1];
            expect(secondChart.id).toBe('chart-2');
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
    describe('getWidgetEventsById / findWidgetsByEvent', () => {
        it('extracts events for a widget and finds matching targets', () => {
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
                            events: [
                                { eventType: 'layerFilterChange', dataType: 'LAYER_FILTER' },
                                { eventType: 'zoomClick', dataType: 'FEATURE' }
                            ]
                        }
                    }, {
                        type: 'element',
                        id: 'chart-1',
                        interactionMetadata: {
                            targets: [
                                {
                                    targetType: 'applyFilter',
                                    expectedDataType: 'LAYER_FILTER',
                                    targetProperty: 'dependencies.filters',
                                    constraints: { layer: { name: 'gs:us_states' } },
                                    mode: 'upsert'
                                },
                                {
                                    targetType: 'filterByViewport',
                                    targetProperty: 'dependencies.viewports',
                                    expectedDataType: 'BBOX_COORDINATES',
                                    mode: 'upsert'
                                }
                            ]
                        }
                    }]
                }]
            };

            const layerFilterEvents = getWidgetEventsById(sampleTree, 'table-1');

            // eslint-disable-next-line no-console
            console.log('Extacts: extracted events', layerFilterEvents);

            expect(layerFilterEvents[0].eventType).toBe('layerFilterChange');
            // TODO: complete tests
        });

        it('filters tree keeping only nodes with a given event', () => {
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
                            events: [
                                { eventType: 'layerFilterChange', dataType: 'LAYER_FILTER' }
                            ]
                        }
                    }, {
                        type: 'element',
                        id: 'map-1',
                        interactionMetadata: {
                            events: [
                                { eventType: 'zoomChange', dataType: 'NUMBER' }
                            ]
                        }
                    }]
                }]
            };

            const filtered = filterTreeByEvent(sampleTree, { eventType: 'layerFilterChange', dataType: 'LAYER_FILTER' });
            const widgetsCollection = filtered.children[0];

            // eslint-disable-next-line no-console
            console.log('FilterTree result', widgetsCollection);

            // TODO: complete tests

        });

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

    describe('generateNodePath and evaluatePath', () => {
        it('generates path and evaluates it with three checks', () => {
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

            // Check 1: Generate path for top-level node and evaluate it
            // eslint-disable-next-line no-console
            console.log('=== Check 1: Top-level node path generation and evaluation ===');
            const path1 = generateNodePath(sampleTree, 'table-1');
            // eslint-disable-next-line no-console
            console.log('Check 1 - Generated path:', path1);
            expect(path1).toBe('root.widgets[table-1]');

            const node1 = evaluatePath(sampleTree, path1);
            // eslint-disable-next-line no-console
            console.log('Check 1 - Evaluated node:', node1);
            expect(node1).toExist();
            expect(node1.id).toBe('table-1');
            expect(node1.title).toBe('Table Widget 1');

            // Check 2: Generate path for nested node and evaluate it
            // eslint-disable-next-line no-console
            console.log('=== Check 2: Nested node path generation and evaluation ===');
            const path2 = generateNodePath(sampleTree, 'trace-2');
            // eslint-disable-next-line no-console
            console.log('Check 2 - Generated path:', path2);
            expect(path2).toBe('root.widgets[chart-1].traces[trace-2]');

            const node2 = evaluatePath(sampleTree, path2);
            // eslint-disable-next-line no-console
            console.log('Check 2 - Evaluated node:', node2);
            expect(node2).toExist();
            expect(node2.id).toBe('trace-2');
            expect(node2.title).toBe('Trace 2');

            // Check 3: Test error cases - non-existent node and invalid path
            // eslint-disable-next-line no-console
            console.log('=== Check 3: Error cases ===');
            const path3 = generateNodePath(sampleTree, 'non-existent');
            // eslint-disable-next-line no-console
            console.log('Check 3 - Path for non-existent node:', path3);
            expect(path3).toBe(null);

            const node3 = evaluatePath(sampleTree, 'root.widgets[non-existent]');
            // eslint-disable-next-line no-console
            console.log('Check 3 - Evaluated invalid path:', node3);
            expect(node3).toBe(null);
        });
    });
});
