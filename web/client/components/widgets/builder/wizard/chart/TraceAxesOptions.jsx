/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { FormGroup, ControlLabel, InputGroup } from 'react-bootstrap';
import { castArray } from 'lodash';
import Message from '../../../../I18N/Message';
import { extractTraceData } from '../../../../../utils/WidgetsUtils';
import Select from "react-select";

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
 * TraceAxisOptions. A component that renders field to change the axes of the trace
 * @prop {object} data the widget chart data
 * @prop {function} onChange callback on every input change
 */
function TraceAxesOptions({
    data,
    onChange = () => {}
}) {
    const selectedTrace = extractTraceData(data) || {};
    if (!['bar', 'line'].includes(selectedTrace.type)) {
        return null;
    }
    const selectedChart = (data?.charts || []).find((chart) => chart.chartId === data.selectedChartId) || {};
    const chartPath = `charts[${selectedChart?.chartId}]`;
    const yAxisOpts = castArray(selectedChart?.yAxisOpts || { id: 0 });
    const xAxisOpts = castArray(selectedChart?.xAxisOpts || { id: 0 });
    return (
        <>
            <div className="ms-wizard-form-separator"><Message msgId="widgets.advanced.traceAxes" /></div>
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
        </>
    );
}

export default TraceAxesOptions;
