/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React, {useState} from 'react';
import { head, get} from 'lodash';
import { Row, Col, Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import Message from '../../../../I18N/Message';
import Select from 'react-select';
import ColorRamp from '../../../../styleeditor/ColorRamp';
import StepHeader from '../../../../misc/wizard/StepHeader';
import SwitchButton from '../../../../misc/switch/SwitchButton';
import ChartAdvancedOptions from './ChartAdvancedOptions';
import ColorClassModal from '../chart/ColorClassModal';
import { defaultColorGenerator } from '../../../../charts/WidgetChart';

const DEFAULT_CUSTOM_COLOR_OPTIONS = {
    base: 190,
    range: 0,
    s: 0.95,
    v: 0.63
};

const COLORS = [{
    showWhen: (chartType) => chartType === 'pie',
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
}, {
    showWhen: (chartType) => chartType === 'bar' || chartType === 'pie',
    name: 'global.colors.custom',
    schema: 'sequencial',
    options: DEFAULT_CUSTOM_COLOR_OPTIONS,
    ramp: "#fff",
    custom: true
}];

const CLASSIFIED_COLORS = [{title: '', color: '#ffffff', type: 'Polygon', unique: ''}];


const getColorRangeItems = (type) => {
    return COLORS.filter(c => c.showWhen ? c.showWhen(type) : c);
};
const getLabelMessageId = (field, data = {}) => `widgets.${field}.${data.type || data.widgetType || "default"}`;

const placeHolder = <Message msgId={getLabelMessageId("placeHolder")} />;

const getAutoColorOptionsClassification = (classification) => (
    classification.reduce((acc, curr) => ([
        ...acc,
        {
            color: curr.color,
            value: curr.unique
        }
    ]
    ), [])
);


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
    sampleChart}) => {

    const [showModal, setShowModal] = useState(false);
    const [customColor, setCustomColor] = useState(false);
    const [classificationAttribute, setClassificationAttribute] = useState();
    const [classification, setClassification] = useState(CLASSIFIED_COLORS);
    const [defaultCustomColor, setDefaultCustomColor] = useState(defaultColorGenerator(1, DEFAULT_CUSTOM_COLOR_OPTIONS)[0] || '#0888A1');

    return (
        <Row>
            <StepHeader title={<Message msgId={`widgets.chartOptionsTitle`} />} />
            {/* this sticky style helps to keep showing chart when scrolling*/}
            <Col xs={12} style={{ position: "sticky", top: 0, zIndex: 1}}>
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
                                    onChange={v => {
                                        onChange("autoColorOptions", {...v.options, name: v.name});
                                        setCustomColor(v?.custom);
                                        setShowModal(true);
                                    }}/>
                            </Col>
                        </FormGroup> : null}

                    { customColor &&
                    <ColorClassModal
                        modalClassName="chart-color-class-modal"
                        show={showModal}
                        onClose={() => {
                            setShowModal(false);
                            onChange("autoColorOptions.classDefaultColor", defaultCustomColor);
                            onChange("options.classificationAttribute", undefined);
                            onChange("autoColorOptions.classification", getAutoColorOptionsClassification([]));
                        }}
                        onSaveStyle={() => {
                            setShowModal(false);
                            onChange("autoColorOptions.classDefaultColor", defaultCustomColor);
                            if (classificationAttribute && classificationAttribute?.value) {
                                onChange("options.classificationAttribute", classificationAttribute?.value);
                                onChange("autoColorOptions.classification", getAutoColorOptionsClassification(classification));
                            }
                        }}
                        onChange={(value) => setClassificationAttribute(value)}
                        classificationAttribute={classificationAttribute}
                        onUpdateClasses={(newClassification) => {
                            setClassification(newClassification);
                        }}
                        options={options}
                        placeHolder={placeHolder}
                        classification={classification}
                        defaultCustomColor={defaultCustomColor}
                        onChangeColor={(color) => setDefaultCustomColor(color)}
                    />
                    }

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
};
