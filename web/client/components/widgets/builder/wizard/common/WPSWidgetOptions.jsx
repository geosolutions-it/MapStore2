/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const { head, get, isNil} = require('lodash');
const { Row, Col, Form, FormGroup, FormControl, ControlLabel, Glyphicon} = require('react-bootstrap');
const Message = require('../../../../I18N/Message');
const Select = require('react-select').default;
const Slider = require('react-nouislider');
const ColorRamp = require('../../../../styleeditor/ColorRamp').default;
const StepHeader = require('../../../../misc/wizard/StepHeader');
const SwitchPanel = require('../../../../misc/switch/SwitchPanel');
const SwitchButton = require('../../../../misc/switch/SwitchButton');
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

const renderHeader = (data) => {
    const panelHeader = <Message msgId={getLabelMessageId("advancedOptions", data)} />;
    return (
        <span>
            <span style={{cursor: "pointer"}}>{panelHeader}</span>
            <button className="close">
                {data.panel ? <Glyphicon glyph="glyphicon glyphicon-collapse-down"/> : <Glyphicon glyph="glyphicon glyphicon-expand"/>}
            </button>
        </span>
    );
};

module.exports = ({
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
        <Col xs={12}>
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
                <FormGroup controlId="aggregateFunction" className="mapstore-block-width">
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
                </FormGroup>
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
                {formOptions.advancedOptions && data.type === "bar" || data.type === "line" ?
                    <SwitchPanel id="displayCartesian"
                        header={renderHeader(data)}
                        collapsible
                        expanded={data.panel}
                        onSwitch={(val) => { onChange("panel", val); }}
                    >
                        <FormGroup controlId="AdvancedOptions">
                            <Col componentClass={ControlLabel} sm={6}>
                                <Message msgId={getLabelMessageId("displayCartesian", data)} />
                            </Col>
                            <Col sm={6}>
                                <SwitchButton
                                    checked={data.cartesian || data.cartesian === false ? !data.cartesian : false}
                                    onChange={(val) => { onChange("cartesian", !val); }}
                                />
                            </Col>
                            <Col componentClass={ControlLabel} sm={6}>
                                <Message msgId={getLabelMessageId("yAxis", data)} />
                            </Col>
                            <Col sm={6}>
                                <SwitchButton
                                    checked={data.yAxis || data.yAxis === false ? !data.yAxis : true}
                                    onChange={(val) => { onChange("yAxis", !val); }}
                                />
                            </Col>
                            <Col componentClass={ControlLabel} sm={6}>
                                <Message msgId={getLabelMessageId("xAxisAngle", data)} />
                            </Col>
                            <Col sm={6}>
                                <div
                                    className={"mapstore-slider with-tooltip"}
                                    onClick={(e) => { e.stopPropagation(); }}
                                >
                                    <Slider
                                        key="priority"
                                        format= {{
                                            // this is needed to remove the 2 decimals that this comp adds by default
                                            to: value => parseInt(value, 10),
                                            from: value => Number(value)
                                        }}
                                        onSlide={(values) => { onChange("xAxisAngle", parseInt(values[0], 10)); }}
                                        range={{min: 0, max: 90}}
                                        start={[!isNil(data.xAxisAngle) ? data.xAxisAngle : 0]}
                                        step={15}
                                        tooltips={[true]}
                                    />
                                </div>
                            </Col>
                        </FormGroup>

                        <FormGroup controlId="yAxisLabel">
                            <Col componentClass={ControlLabel} sm={6}>
                                <Message msgId={getLabelMessageId("yAxisLabel", data)} />
                            </Col>
                            <Col sm={6}>
                                <FormControl value= {data.yAxisLabel} type="text" onChange={ e => onChange("yAxisLabel", e.target.value)} />
                            </Col>
                        </FormGroup>
                    </SwitchPanel> : null}

            </Form>

        </Col>
    </Row>
);
