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
import chroma from 'chroma-js';

import DebouncedFormControl from '../../../../misc/DebouncedFormControl';
import localizedProps from "../../../../misc/enhancers/localizedProps";
import {
    extractTraceData,
    getAggregationAttributeDataKey,
    generateNewTrace,
    defaultChartStyle,
    isChartOptionsValid
} from '../../../../../utils/WidgetsUtils';
import { getChromaScaleByName } from '../../../../../utils/ClassificationUtils';
import tooltip from '../../../../misc/enhancers/tooltip';
import Message from "../../../../I18N/Message";

const Button = tooltip(ButtonRB);

const Select = localizedProps(["noResultsText"])(ReactSelect);

const TraceMarkerStyle = ({ trace, error }) => {
    const style = {
        width: '1.6em',
        height: '0.8em',
        marginRight: '0.4em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    };
    if (trace.valid === false) {
        return (
            <div style={style}>
                {error ? <Glyphicon glyph="warning-sign" className="text-danger" /> : <Glyphicon glyph="pencil" />}
            </div>
        );
    }

    if (trace.type === 'pie' || (trace.type === 'bar' && trace?.style?.msMode === 'classification')) {
        const scale = getChromaScaleByName(trace?.style?.msClassification?.ramp || 'viridis');
        const colorClasses = chroma.scale(scale).colors(5);
        const gradient = colorClasses
            .map((color, idx) => `${color} ${idx / 5 * 100}%`);
        return (
            <div style={{
                ...style,
                background: `linear-gradient(90deg,${gradient.join(',')} 100%)`,
                border: `1px solid ${trace.style?.marker?.line?.width > 0 ? trace.style?.marker?.line?.color || '' : 'transparent'}`
            }}/>
        );
    }

    if (trace.type === 'line') {
        const mode = trace?.style?.mode || 'lines';
        return (
            <div style={{
                ...style
            }}>
                {mode !== 'markers' && <div style={{
                    width: '100%',
                    height: 2,
                    position: 'absolute',
                    background: trace?.style?.line?.color
                }}></div>}
                {mode !== 'lines' && <div style={{
                    width: '0.6em',
                    height: '0.6em',
                    borderRadius: '50%',
                    position: 'absolute',
                    background: trace?.style?.marker?.color
                }} />}
            </div>
        );
    }

    return (
        <div style={{
            ...style,
            background: trace.style?.marker?.color,
            border: `1px solid ${trace.style?.marker?.line?.width > 0 ? trace.style?.marker?.line?.color || 'rgb(0, 0, 0)' : 'transparent'}`
        }}/>
    );
};

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
    setTab = () => {},
    hasAggregateProcess,
    error
}) {
    const [editChartName, setChartEditName] = useState(false);
    const [editTraceName, setTraceEditName] = useState(false);
    const selectedChart = (data?.charts || []).find((chart) => chart.chartId === data.selectedChartId);
    const traces = (selectedChart?.traces || []).map((trace) => ({ ...trace, valid: isChartOptionsValid(trace?.options, { hasAggregateProcess }) }));
    const tracesTypes = traces.map(trace => trace.type);
    const selectedTrace = extractTraceData(data) || {};
    const chartPath = `charts[${selectedChart?.chartId}]`;
    const tracesPath = `${chartPath}.traces`;
    const tracePath = `${tracesPath}[${selectedTrace.id}]`;
    const isNestedPieChart = selectedTrace.type === 'pie' && selectedTrace?.options?.classificationAttribute
        && selectedTrace?.options?.classificationAttribute !== selectedTrace?.options?.groupByAttributes;
    return (
        <>
            {!disableMultiChart && <FormGroup className="form-group-flex" validationState={error ? 'error' : ''} style={{ marginBottom: 0 }}>
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
                                label: <><div style={{ display: 'inline-block', marginRight: '0.4em' }}>{
                                    chart.traces.some(trace => isChartOptionsValid(trace?.options, { hasAggregateProcess }))
                                        ? <Glyphicon glyph="ok" className="text-success"/>
                                        : error
                                            ? <Glyphicon glyph="warning-sign" className="text-danger" />
                                            : <Glyphicon glyph="pencil"/>
                                }</div>{`[Chart ${idx + 1}] ${chart?.name || ''}`}</>,
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
                            tooltipId={'widgets.builder.editChartTitle'}
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
                                tooltipId={'widgets.builder.addNewCharts'}
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
            {editing && <Tabs
                activeKey={tab}
                animation={false}
                onSelect={setTab}
            >
                <Tab key="traces" eventKey="traces" title={<Message msgId="widgets.advanced.traces" />} />
                {selectedTrace?.type !== 'pie' ? <Tab key="axis" eventKey="axis" title={<Message msgId="widgets.advanced.axes" />} /> : null}
                <Tab key="layout" eventKey="layout" title={<Message msgId="widgets.advanced.layout" />} />
            </Tabs>}
            {editing && tab === 'traces' && <FormGroup validationState={error ? 'error' : ''} className="form-group-flex" style={{ marginBottom: 0, marginTop: 8 }}>
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
                                    options={traces.map((trace, idx) => ({
                                        value: trace.id,
                                        label: <><TraceMarkerStyle error={error} trace={trace} />{
                                            trace?.name
                                                ? trace.name
                                                : trace.valid
                                                    ? getAggregationAttributeDataKey(trace.options) || ''
                                                    : `[Trace ${idx + 1}]`
                                        }</>
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
                            tooltipId={'widgets.builder.editTraceTitle'}
                        >
                            <Glyphicon glyph={editTraceName ? 'ok' : 'pencil'} />
                        </Button>
                    </InputGroup.Button>
                    <InputGroup.Button>
                        <Button
                            bsStyle="primary"
                            disabled={editTraceName || isNestedPieChart}
                            tooltipId={'widgets.builder.addNewTrace'}
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
                            tooltipId={'widgets.builder.deleteTrace'}
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
