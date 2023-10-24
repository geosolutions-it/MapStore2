/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { FormGroup, InputGroup, Button as ButtonRB, Glyphicon, Tabs, Tab } from 'react-bootstrap';
import ReactSelect from 'react-select';
import DebouncedFormControl from '../../../../misc/DebouncedFormControl';
import localizedProps from "../../../../misc/enhancers/localizedProps";
import {
    extractTraceData,
    getAggregationAttributeDataKey,
    generateNewTrace,
    defaultChartStyle
} from '../../../../../utils/WidgetsUtils';
import tooltip from '../../../../misc/enhancers/tooltip';
import Message from "../../../../I18N/Message";

const Button = tooltip(ButtonRB);

const Select = localizedProps(["noResultsText"])(ReactSelect);

const chartTypes = [{
    type: "bar",
    glyph: "stats"
}, {
    type: "pie",
    glyph: "pie-chart"
}, {
    type: "line",
    glyph: "line"
}];
const TypeRenderer = ({value, glyph})=>{
    return <span><Glyphicon glyph={glyph}/>&nbsp;{`${value.charAt(0).toUpperCase() + value.slice(1)} Chart`}</span>;
};
/**
 * ChartTraceEditSelector. A component that renders field to add/remove/edit chart or traces
 * @prop {object} data the widget chart data
 * @prop {boolean} editing if true shows editing actions
 * @prop {function} onChange callback on every input change
 * @prop {function} onAddChart callback on add chart action
 * @prop {boolean} disableMultiChart disabled multi chart field
 * @prop {string} tab selected tab
 * @prop {function} setTab callback on select tab
 */
function ChartTraceEditSelector({
    data = {},
    editing,
    onChange = () => { },
    onAddChart = () => { },
    children,
    disableMultiChart,
    tab = 'traces',
    setTab = () => {}
}) {
    const [editChartName, setChartEditName] = useState(false);
    const [editTraceName, setTraceEditName] = useState(false);
    const selectedChart = (data?.charts || []).find((chart) => chart.chartId === data.selectedChartId);
    const traces = selectedChart?.traces || [];
    const tracesTypes = traces.map(trace => trace.type);
    const selectedTrace = extractTraceData(data) || {};
    const chartPath = `charts[${selectedChart?.chartId}]`;
    const tracesPath = `${chartPath}.traces`;
    const tracePath = `${tracesPath}[${selectedTrace.id}]`;
    const isNestedPieChart = selectedTrace.type === 'pie' && selectedTrace?.options?.classificationAttribute
        && selectedTrace?.options?.classificationAttribute !== selectedTrace?.options?.groupByAttributes;
    return (
        <>
            {!disableMultiChart && <FormGroup className="form-group-flex" style={{ marginBottom: 0 }}>
                <InputGroup>
                    {editChartName
                        ? <DebouncedFormControl
                            value={selectedChart?.name || ''}
                            onChange={(value) => {
                                onChange(`${chartPath}.name`, value);
                            }}
                        />
                        : <Select
                            value={data.selectedChartId}
                            clearable={false}
                            options={(data?.charts || []).map((chart, idx) => ({
                                label: `[Chart ${idx + 1}] ${chart?.name || ''}`,
                                value: chart.chartId
                            }))}
                            onChange={(option) => {
                                onChange("selectedChartId", option?.value);
                            }}
                        />}
                    <InputGroup.Button>
                        <Button
                            bsStyle="primary"
                            onClick={() => setChartEditName(!editChartName)}
                        >
                            <Glyphicon glyph={editChartName ? 'ok' : 'pencil'} />
                        </Button>
                    </InputGroup.Button>
                    {editing && <>
                        <InputGroup.Button>
                            <Button
                                bsStyle="primary"
                                disabled={editChartName}
                                onClick={() => onAddChart()}
                                tooltipId={'widgets.builder.addNewLayers'}
                            >
                                <Glyphicon glyph="plus" />
                            </Button>
                        </InputGroup.Button>
                        <InputGroup.Button>
                            <Button
                                bsStyle="primary"
                                disabled={(data?.charts?.length || 0) <= 1 || editChartName}
                                onClick={() => {
                                    const charts = data?.charts?.filter(c => c.chartId !== data?.selectedChartId);
                                    onChange('chart-delete', charts.length ? charts : undefined);
                                }}
                                tooltipId="widgets.builder.deleteChart"
                            >
                                <Glyphicon glyph="trash" />
                            </Button>
                        </InputGroup.Button>
                    </>}
                </InputGroup>
            </FormGroup>}
            {children}
            {editing && selectedTrace?.type !== 'pie' && <Tabs
                activeKey={tab}
                animation={false}
                onSelect={setTab}
            >
                <Tab key="traces" eventKey="traces" title={<Message msgId="widgets.advanced.traces" />} />
                <Tab key="axis" eventKey="axis" title={<Message msgId="widgets.advanced.axis" />} />
            </Tabs>}
            {editing && (selectedTrace.type === 'pie' || tab !== 'axis') && <FormGroup className="form-group-flex" style={{ marginBottom: 0, marginTop: 8 }}>
                <InputGroup>
                    <div style={{ display: 'flex' }}>
                        <div style={{ minWidth: 130 }}>
                            <Select
                                noResultsText="widgets.selectChartType.noResults"
                                disabled={!!(traces.length > 1 && tracesTypes.includes('pie'))}
                                optionRenderer={TypeRenderer}
                                valueRenderer={TypeRenderer}
                                options={chartTypes
                                    .filter(({ type }) => traces.length === 1 || tracesTypes.includes('pie')
                                        ? true
                                        : !tracesTypes.includes('pie') && type !== 'pie')
                                    .map(({type: value, glyph}) =>({value, label: value, glyph}))}
                                onChange={(option) => {
                                    onChange(`${tracePath}.type`, option.value);
                                    onChange(`${tracePath}.style`, defaultChartStyle(option.value));
                                }}
                                value={selectedTrace?.type}
                                clearable={false}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            {editTraceName ?
                                <DebouncedFormControl
                                    style={{ height: '100%' }}
                                    value={selectedTrace?.name || ''}
                                    onChange={(value) => {
                                        onChange(`${tracePath}.name`, value);
                                    }}
                                />
                                : <Select
                                    noResultsText="widgets.selectChartType.noResults"
                                    options={traces.map((trace, value) => ({
                                        value: trace.id,
                                        label: `[ ${`Trace ${value + 1}`} ] ${trace.name || getAggregationAttributeDataKey(trace.options) || ''}`
                                    }))}
                                    onChange={(option) => option?.value !== undefined && onChange('selectedTraceId', option.value)}
                                    value={selectedTrace.id}
                                    clearable={false}
                                />}
                        </div>
                    </div>
                    <InputGroup.Button>
                        <Button
                            bsStyle="primary"
                            onClick={() => setTraceEditName(!editTraceName)}
                        >
                            <Glyphicon glyph={editTraceName ? 'ok' : 'pencil'} />
                        </Button>
                    </InputGroup.Button>
                    <InputGroup.Button>
                        <Button
                            bsStyle="primary"
                            disabled={editTraceName || isNestedPieChart}
                            onClick={() => {
                                const newTrace = generateNewTrace({
                                    type: selectedTrace?.type,
                                    layer: selectedTrace?.layer,
                                    geomProp: selectedTrace?.geomProp,
                                    randomColor: true
                                });
                                onChange(tracesPath, [
                                    ...traces,
                                    newTrace
                                ]);
                                onChange('selectedTraceId', newTrace.id);
                            }}
                        >
                            <Glyphicon glyph="plus" />
                        </Button>
                    </InputGroup.Button>
                    <InputGroup.Button>
                        <Button
                            disabled={editTraceName || traces.length < 2}
                            bsStyle="primary"
                            onClick={() => {
                                const filteredTraces = traces.filter(trace => trace.id !== selectedTrace.id);
                                onChange(tracesPath, filteredTraces);
                                onChange('selectedTraceId', filteredTraces[0].id);
                            }}
                        >
                            <Glyphicon glyph="trash" />
                        </Button>
                    </InputGroup.Button>
                </InputGroup>
            </FormGroup>}
        </>
    );
}

export default ChartTraceEditSelector;
