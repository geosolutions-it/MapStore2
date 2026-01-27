/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { testEpic } from './epicTestUtils';
import { applyFilterWidgetInteractionsEpic, cleanupAndReapplyFilterWidgetInteractionsEpic } from '../interactions';
import { applyFilterWidgetInteractions } from '../../actions/interactions';
import { UPDATE_PROPERTY, DELETE } from '../../actions/widgets';

const FILTER_ID = 'filter-1';
const FILTER_WIDGET_ID = 'filter-widget-1';
const CHART_WIDGET_ID = 'chart-widget-1';
const TABLE_WIDGET_ID = 'table-widget-1';
const TRACE_ID = 'trace-1';
const CHART_ID = 'chart-1';

const makeFilterWidget = (overrides = {}) => ({
    id: FILTER_WIDGET_ID,
    widgetType: 'filter',
    title: 'Filter Widget',
    filters: [{
        id: FILTER_ID,
        data: {
            dataSource: 'features',
            valuesFrom: 'grouped',
            valueAttribute: 'STATE_NAME'
        }
    }],
    selections: { [FILTER_ID]: ['Arizona'] },
    interactions: [
        {
            id: 'int-1',
            plugged: true,
            targetType: 'applyFilter',
            source: { nodePath: `root.widgets[${FILTER_WIDGET_ID}].filters[${FILTER_ID}]` },
            target: { nodePath: `root.widgets[${CHART_WIDGET_ID}].charts[${CHART_ID}].traces[${TRACE_ID}]` }
        }
    ],
    ...overrides
});

const makeChartWidget = (overrides = {}) => ({
    id: CHART_WIDGET_ID,
    widgetType: 'chart',
    title: 'Chart Widget',
    charts: [{
        chartId: CHART_ID,
        traces: [{
            id: TRACE_ID,
            type: 'pie',
            layer: { name: 'test:layer', id: 'layer-1' }
        }]
    }],
    ...overrides
});

const makeTableWidget = (overrides = {}) => ({
    id: TABLE_WIDGET_ID,
    widgetType: 'table',
    title: 'Table Widget',
    layer: { name: 'test:layer', id: 'layer-1' },
    ...overrides
});

const makeState = (widgets) => ({
    widgets: {
        containers: {
            floating: {
                widgets
            }
        }
    }
});

describe('interactions epics', () => {
    describe('applyFilterWidgetInteractionsEpic', () => {
        it('dispatches updateWidgetProperty with charts and trace.interactionFilters for chart target', (done) => {
            const filterWidget = makeFilterWidget();
            const chartWidget = makeChartWidget();
            const state = makeState([filterWidget, chartWidget]);

            testEpic(
                applyFilterWidgetInteractionsEpic,
                1,
                [applyFilterWidgetInteractions(FILTER_WIDGET_ID, 'floating', FILTER_ID)],
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(UPDATE_PROPERTY);
                    expect(actions[0].id).toBe(CHART_WIDGET_ID);
                    expect(actions[0].key).toBe('charts');
                    expect(Array.isArray(actions[0].value)).toBe(true);
                    const charts = actions[0].value;
                    expect(charts.length).toBe(1);
                    const traces = charts[0].traces || [];
                    expect(traces.length).toBe(1);
                    expect(Array.isArray(traces[0].interactionFilters)).toBe(true);
                    expect(traces[0].interactionFilters.length).toBeGreaterThan(0);
                    expect(traces[0].interactionFilters[0].appliedFromWidget).toBe(FILTER_WIDGET_ID);
                    expect(traces[0].layer).toBeTruthy();
                    expect(traces[0].layer.layerFilter).toBeFalsy();
                },
                state,
                done
            );
        });

        it('dispatches updateWidgetProperty with interactionFilters for table target', (done) => {
            const filterWidget = makeFilterWidget({
                interactions: [{
                    id: 'int-2',
                    plugged: true,
                    targetType: 'applyFilter',
                    source: { nodePath: `root.widgets[${FILTER_WIDGET_ID}].filters[${FILTER_ID}]` },
                    target: { nodePath: `root.widgets[${TABLE_WIDGET_ID}]` }
                }]
            });
            const tableWidget = makeTableWidget();
            const state = makeState([filterWidget, tableWidget]);

            testEpic(
                applyFilterWidgetInteractionsEpic,
                1,
                [applyFilterWidgetInteractions(FILTER_WIDGET_ID, 'floating', FILTER_ID)],
                (actions) => {
                    expect(actions.length).toBe(1);
                    expect(actions[0].type).toBe(UPDATE_PROPERTY);
                    expect(actions[0].id).toBe(TABLE_WIDGET_ID);
                    expect(actions[0].key).toBe('interactionFilters');
                    expect(Array.isArray(actions[0].value)).toBe(true);
                    expect(actions[0].value.length).toBeGreaterThan(0);
                    expect(actions[0].value[0].appliedFromWidget).toBe(FILTER_WIDGET_ID);
                },
                state,
                done
            );
        });
    });

    describe('cleanupAndReapplyFilterWidgetInteractionsEpic', () => {
        it('on DELETE filter widget, cleans up trace.interactionFilters from chart and dispatches updateWidgetProperty(charts)', (done) => {
            const filterWidget = makeFilterWidget();
            const chartWidget = makeChartWidget({
                charts: [{
                    chartId: CHART_ID,
                    traces: [{
                        id: TRACE_ID,
                        type: 'pie',
                        layer: { name: 'test:layer', id: 'layer-1' },
                        interactionFilters: [{
                            id: 'f1',
                            appliedFromWidget: FILTER_WIDGET_ID,
                            format: 'logic',
                            filters: []
                        }]
                    }]
                }]
            });
            const state = makeState([filterWidget, chartWidget]);

            testEpic(
                cleanupAndReapplyFilterWidgetInteractionsEpic,
                1,
                [{ type: DELETE, widget: filterWidget, target: 'floating' }],
                (actions) => {
                    const updateActions = actions.filter(a => a.type === UPDATE_PROPERTY);
                    expect(updateActions.length >= 1).toBe(true);
                    const chartUpdate = updateActions.find(a => a.key === 'charts' && a.id === CHART_WIDGET_ID);
                    expect(chartUpdate).toBeTruthy();
                    const traces = chartUpdate.value[0].traces || [];
                    expect(traces.length).toBe(1);
                    expect(traces[0].interactionFilters).toEqual([]);
                },
                state,
                done
            );
        });

        it('on DELETE filter widget, cleans up widget.interactionFilters from table and dispatches updateWidgetProperty(interactionFilters)', (done) => {
            const filterWidget = makeFilterWidget();
            const tableWidget = makeTableWidget({
                interactionFilters: [{
                    id: 'f1',
                    appliedFromWidget: FILTER_WIDGET_ID,
                    format: 'logic',
                    filters: []
                }]
            });
            const state = makeState([filterWidget, tableWidget]);

            testEpic(
                cleanupAndReapplyFilterWidgetInteractionsEpic,
                1,
                [{ type: DELETE, widget: filterWidget, target: 'floating' }],
                (actions) => {
                    const updateActions = actions.filter(a => a.type === UPDATE_PROPERTY);
                    expect(updateActions.length >= 1).toBe(true);
                    const tableUpdate = updateActions.find(a => a.key === 'interactionFilters' && a.id === TABLE_WIDGET_ID);
                    expect(tableUpdate).toBeTruthy();
                    expect(tableUpdate.value).toEqual([]);
                },
                state,
                done
            );
        });
    });
});
