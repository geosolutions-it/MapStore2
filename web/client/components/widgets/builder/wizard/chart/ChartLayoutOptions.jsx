/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { FormGroup, ControlLabel, InputGroup, Checkbox, Radio } from 'react-bootstrap';
import Message from '../../../../I18N/Message';
import {
    extractTraceData,
    enableBarChartStack,
    FONT
} from '../../../../../utils/WidgetsUtils';
import Font from '../common/Font';

const BAR_CHART_TYPES = [{
    id: 'stacked',
    value: 'stack',
    labelId: 'widgets.advanced.stackedBarChart'
}, {
    id: 'grouped',
    value: 'group',
    labelId: 'widgets.advanced.groupedBarChart'
}];

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
    return (
        <>
            <div className="ms-wizard-form-separator"><Message msgId="widgets.advanced.layout" /></div>
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
            {enableBarChartStack(selectedChart) && <FormGroup className="form-group-flex">
                <ControlLabel>
                    <Message msgId="widgets.advanced.barChartType" />
                </ControlLabel>
                <InputGroup>
                    {BAR_CHART_TYPES.map(chartType => (
                        <Radio
                            name="barChartType"
                            id={chartType.id}
                            value={chartType.value}
                            checked={(selectedChart.barChartType || 'group') === chartType.value}
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
            <div className="ms-wizard-form-separator"><Message msgId="widgets.advanced.font" /></div>
            <Font
                options={selectedTrace.type !== 'pie' ? undefined : ["size", "family"] }
                color={selectedChart?.layout?.color || FONT.COLOR}
                fontSize={selectedChart?.layout?.fontSize || FONT.SIZE}
                fontFamily={selectedChart?.layout?.fontFamily || FONT.FAMILY}
                disabled={false}
                onChange={(key, val) => {
                    onChange(`${chartPath}.layout.${key}`, val);
                }}
            />
        </>
    );
}

export default ChartLayoutOptions;
