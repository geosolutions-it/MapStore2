/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';
import { head, get} from 'lodash';
import { Row, Col, Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import Message from '../../../../I18N/Message';
import Select from 'react-select';
import ColorRamp from '../../../../styleeditor/ColorRamp';
import StepHeader from '../../../../misc/wizard/StepHeader';
import SwitchButton from '../../../../misc/switch/SwitchButton';
import ChartAdvancedOptions from './ChartAdvancedOptions';

const COLORS = [{
    name: 'global.colors.random',
    schema: 'qualitative',
    options: {base: 190, range: 360, options: {}}
}, {
    name: 'global.colors.blue',
    schema: 'sequencial',
    options: {base: 190, range: 20}
}, {
    name: 'global.colors.red',
    schema: 'sequencial',
    options: {base: 10, range: 4}
}, {
    name: 'global.colors.green',
    schema: 'sequencial',
    options: {base: 120, range: 4}
}, {
    name: 'global.colors.brown',
    schema: 'sequencial',
    options: {base: 30, range: 4}
}, {
    name: 'global.colors.purple',
    schema: 'sequencial',
    options: {base: 300, range: 4}
}];


const getColorRangeItems = (type) => {
    if ( type !== "pie") {
        return COLORS.filter( c => c.schema !== 'qualitative');
    }
    return COLORS;
};
const getLabelMessageId = (field, data = {}) => `widgets.${field}.${data.type || data.widgetType || "default"}`;

const placeHolder = <Message msgId={getLabelMessageId("placeHolder")} />;

export default ({
    hasAggregateProcess,
    data = { options: {} },
    onChange = () => { },
    options = [],
    formOptions = {
        showGroupBy: true,
        showUom: false,
        showColorRampSelector: true,
        showLegend: true,
        advancedOptions: true
    },
    aggregationOptions = [],
    sampleChart}) => (
    <Row>
        <StepHeader title={<Message msgId={`widgets.chartOptionsTitle`} />} />
        {/* this sticky style helps to keep showing chart when scrolling*/}
        <Col xs={12} style={{ position: "sticky", top: 0, zIndex: 1, background: "linear-gradient(to top, rgba(255,255,255,0), rgba(255,255,255, 1) 30px)"}}>
            <div style={{marginBottom: "30px"}}>
                {sampleChart}
            </div>
        </Col>
        <Col xs={12}>
            <Form className="chart-options-form" horizontal>
                {formOptions.showGroupBy ? (
                    <FormGroup controlId="groupByAttributes" className="mapstore-block-width">
                        <Col componentClass={ControlLabel} sm={6}>
                            <Message msgId={getLabelMessageId("groupByAttributes", data)} />
                        </Col>
                        <Col sm={6}>
                            <Select
                                value={data.options && data.options.groupByAttributes}
                                options={options}
                                placeholder={placeHolder}
                                onChange={(val) => {
                                    onChange("options.groupByAttributes", val && val.value);
                                }}
                            />
                        </Col>
                    </FormGroup>) : null}
                <FormGroup controlId="aggregationAttribute" className="mapstore-block-width">
                    <Col componentClass={ControlLabel} sm={6}>
                        <Message msgId={getLabelMessageId("aggregationAttribute", data)} />
                    </Col>
                    <Col sm={6}>
                        <Select
                            value={data.options && data.options.aggregationAttribute}
                            options={options}
                            placeholder={placeHolder}
                            onChange={(val) => {
                                onChange("options.aggregationAttribute", val && val.value);
                            }}
                        />
                    </Col>
                </FormGroup>
                {hasAggregateProcess ? <FormGroup controlId="aggregateFunction" className="mapstore-block-width">
                    <Col componentClass={ControlLabel} sm={6}>
                        <Message msgId={getLabelMessageId("aggregateFunction", data)} />
                    </Col>
                    <Col sm={6}>
                        <Select
                            value={data.options && data.options.aggregateFunction}
                            options={aggregationOptions}
                            placeholder={placeHolder}
                            onChange={(val) => { onChange("options.aggregateFunction", val && val.value); }}
                        />
                    </Col>
                </FormGroup> : null}
                {formOptions.showUom ?
                    <FormGroup controlId="uom">
                        <Col componentClass={ControlLabel} sm={6}>
                            <Message msgId={getLabelMessageId("uom", data)} />
                        </Col>
                        <Col sm={6}>
                            <FormControl value={get(data, `options.seriesOptions[0].uom`)} type="text" onChange={e => onChange("options.seriesOptions.[0].uom", e.target.value)} />
                        </Col>
                    </FormGroup> : null}
                {formOptions.showColorRampSelector ?
                    <FormGroup controlId="colorRamp" className="mapstore-block-width">
                        <Col componentClass={ControlLabel} sm={6}>
                            <Message msgId={getLabelMessageId("colorRamp", data)} />
                        </Col>
                        <Col sm={6}>
                            <ColorRamp
                                items={getColorRangeItems(data.type)}
                                value={head(getColorRangeItems(data.type).filter(c => data.autoColorOptions && c.name === data.autoColorOptions.name ))}
                                samples={data.type === "pie" ? 5 : 1}
                                onChange={v => { onChange("autoColorOptions", {...v.options, name: v.name}); }}/>
                        </Col>
                    </FormGroup> : null}
                {formOptions.showLegend ?
                    <FormGroup controlId="displayLegend">
                        <Col componentClass={ControlLabel} sm={6}>
                            <Message msgId={getLabelMessageId("displayLegend", data)} />
                        </Col>
                        <Col sm={6}>
                            <SwitchButton
                                checked={data.legend}
                                onChange={(val) => { onChange("legend", val); }}
                            />
                        </Col>
                    </FormGroup> : null}
                {formOptions.advancedOptions && data.widgetType === "chart" && (data.type === "bar" || data.type === "line")
                    ? <ChartAdvancedOptions data={data} onChange={onChange} />
                    : null}

            </Form>

        </Col>
    </Row>
);
