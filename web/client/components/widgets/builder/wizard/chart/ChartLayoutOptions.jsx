/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { FormGroup, ControlLabel, InputGroup, Checkbox, Radio } from 'react-bootstrap';
import { castArray } from 'lodash';
import Message from '../../../../I18N/Message';
import { extractTraceData } from '../../../../../utils/WidgetsUtils';
import Select from "react-select";

const BAR_CHART_TYPES = [{
    id: 'stacked',
    value: 'stack',
    labelId: 'widgets.advanced.stackedBarChart'
}, {
    id: 'grouped',
    value: 'group',
    labelId: 'widgets.advanced.groupedBarChart'
}];

const getTraceAxisId = ({
    axisKey,
    trace,
    chart
}) => {
    const axisOpts = castArray(chart?.[`${axisKey}AxisOpts`] || { id: 0 });
    const selectedAxisId = trace[`${axisKey}axis`] || 0;
    return axisOpts.some(opts => opts.id === selectedAxisId) ? selectedAxisId : 0;
};
/**
 * ChartLayoutOptions. A component that renders field to change the chart layout
 * @prop {object} data the widget chart data
 * @prop {function} onChange callback on every input change
 */
function ChartLayoutOptions({
    data,
    onChange = () => {}
}) {
    const selectedChart = (data?.charts || []).find((chart) => chart.chartId === data.selectedChartId) || {};
    const selectedTrace = extractTraceData(data) || {};
    const chartPath = `charts[${selectedChart?.chartId}]`;
    const yAxisOpts = castArray(selectedChart?.yAxisOpts || { id: 0 });
    const xAxisOpts = castArray(selectedChart?.xAxisOpts || { id: 0 });
    return (
        <>
            <div className="ms-wizard-form-separator"><Message msgId="widgets.advanced.layout" /></div>
            {selectedTrace.type === 'pie' && <FormGroup className="form-group-flex" style={{ marginBottom: 0 }}>
                <Checkbox
                    disabled={!selectedChart.legend}
                    checked={!!selectedTrace.includeLegendPercent}
                    onChange={(event) => onChange(`${chartPath}.traces[${selectedTrace.id}].includeLegendPercent`, event?.target?.checked)}
                >
                    <Message msgId="widgets.advanced.includeLegendPercent" />
                </Checkbox>
            </FormGroup>}
            {['bar', 'line'].includes(selectedTrace.type) && <>
                <FormGroup className="form-group-flex">
                    <ControlLabel>
                        <Message msgId="widgets.advanced.yAxis" />
                    </ControlLabel>
                    <InputGroup>
                        <Select
                            clearable={false}
                            disabled={yAxisOpts.length === 1}
                            value={getTraceAxisId({
                                axisKey: 'y',
                                trace: selectedTrace,
                                chart: selectedChart
                            })}
                            options={yAxisOpts.map((axisOptions, idx) => ({
                                value: axisOptions.id,
                                label: `[ Y ${idx} ] ${axisOptions.title || ''}`
                            }))}
                            onChange={(option) => {
                                onChange(`${chartPath}.traces[${selectedTrace.id}].yaxis`, option?.value);
                            }}
                        />
                    </InputGroup>
                </FormGroup>
                <FormGroup className="form-group-flex">
                    <ControlLabel>
                        <Message msgId="widgets.advanced.xAxis" />
                    </ControlLabel>
                    <InputGroup>
                        <Select
                            clearable={false}
                            disabled={xAxisOpts.length === 1}
                            value={getTraceAxisId({
                                axisKey: 'x',
                                trace: selectedTrace,
                                chart: selectedChart
                            })}
                            options={xAxisOpts.map((axisOptions, idx) => ({
                                value: axisOptions.id,
                                label: `[ X ${idx} ] ${axisOptions.title || ''}`
                            }))}
                            onChange={(option) => {
                                onChange(`${chartPath}.traces[${selectedTrace.id}].xaxis`, option?.value);
                            }}
                        />
                    </InputGroup>
                </FormGroup>
            </>}
            {selectedTrace.type !== 'pie' && <FormGroup className="form-group-flex" style={{ marginBottom: 0 }}>
                <Checkbox
                    checked={selectedChart.cartesian || selectedChart.cartesian === false ? !selectedChart.cartesian : false}
                    onChange={(event) => onChange(`${chartPath}.cartesian`, !event?.target?.checked)}
                >
                    <Message msgId="widgets.advanced.displayCartesian" />
                </Checkbox>
            </FormGroup>}
            <FormGroup className="form-group-flex">
                <Checkbox
                    checked={!!selectedChart.legend}
                    onChange={(event) => onChange(`${chartPath}.legend`, event?.target?.checked)}
                >
                    <Message msgId="widgets.displayLegend.default" />
                </Checkbox>
            </FormGroup>
            {selectedTrace.type === 'bar' && <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="widgets.advanced.barChartType" />
                </ControlLabel>
                <InputGroup>
                    {BAR_CHART_TYPES.map(chartType => (
                        <Radio
                            name="barChartType"
                            id={chartType.id}
                            value={chartType.value}
                            checked={(selectedChart.barChartType || 'stack') === chartType.value}
                            onChange={ e => {
                                const { value } = e.target;
                                onChange(`${chartPath}.barChartType`, value);
                            }}
                            inline>
                            <Message msgId={chartType.labelId}/>
                        </Radio>
                    ))}
                </InputGroup>
            </FormGroup>}
        </>
    );
}

export default ChartLayoutOptions;
