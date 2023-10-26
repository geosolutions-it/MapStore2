/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { FormGroup, Checkbox } from 'react-bootstrap';
import Message from '../../../../I18N/Message';
import { extractTraceData } from '../../../../../utils/WidgetsUtils';

/**
 * TraceLegendOptions. A component that renders field to change the legend options of a trace
 * @prop {object} data the widget chart data
 * @prop {function} onChange callback on every input change
 */
function TraceLegendOptions({
    data,
    onChange = () => {}
}) {
    const selectedTrace = extractTraceData(data) || {};
    if (selectedTrace.type !== 'pie') {
        return null;
    }
    const selectedChart = (data?.charts || []).find((chart) => chart.chartId === data.selectedChartId) || {};
    const chartPath = `charts[${selectedChart?.chartId}]`;
    return (
        <>
            <div className="ms-wizard-form-separator"><Message msgId="widgets.advanced.traceLegendOptions" /></div>
            <FormGroup className="form-group-flex" style={{ marginBottom: 0 }}>
                <Checkbox
                    disabled={!selectedChart.legend}
                    checked={!!selectedTrace.includeLegendPercent}
                    onChange={(event) => onChange(`${chartPath}.traces[${selectedTrace.id}].includeLegendPercent`, event?.target?.checked)}
                >
                    <Message msgId="widgets.advanced.includeLegendPercent" />
                </Checkbox>
            </FormGroup>
        </>
    );
}

export default TraceLegendOptions;
