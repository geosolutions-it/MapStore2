/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React, {useEffect, useState} from 'react';
import { head, get} from 'lodash';
import { Row, Col, Form, FormGroup, FormControl, ControlLabel, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Message from '../../../../I18N/Message';
import Select from 'react-select';
import ColorRamp from '../../../../styleeditor/ColorRamp';
import { generateRandomHexColor } from '../../../../../utils/ColorUtils';
import Button from '../../../../misc/Button';
import ConfirmModal from '../../../../../components/resources/modals/ConfirmModal';
import StepHeader from '../../../../misc/wizard/StepHeader';
import SwitchButton from '../../../../misc/switch/SwitchButton';
import ChartAdvancedOptions from './ChartAdvancedOptions';
import ColorClassModal from '../chart/ColorClassModal';
import { defaultColorGenerator } from '../../../../charts/WidgetChart';
import classNames from 'classnames';

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

const CLASSIFIED_COLORS = [{title: '', color: generateRandomHexColor(), type: 'Polygon', unique: ''}];

const getConfirmModal = (show, onClose, onConfirm) => (
    <ConfirmModal show={show} onClose={onClose} onConfirm={onConfirm}>
        <Message msgId="widgets.builder.wizard.classAttributes.confirmModalMessage" />
    </ConfirmModal>
);

const getColorRangeItems = (type, classification, classificationAttribute, defaultCustomColor) => {
    COLORS.filter(item => item.custom)[0].ramp = !classificationAttribute ? defaultCustomColor : [...classification.map(item => item.color), defaultCustomColor];
    return COLORS.filter(c => c.showWhen ? c.showWhen(type) : c);
};
const getLabelMessageId = (field, data = {}) => `widgets.${field}.${data.type || data.widgetType || "default"}`;

const placeHolder = <Message msgId={getLabelMessageId("placeHolder")} />;

/** Backup to class value (unique) if label (title) is not provided */
const formatAutoColorOptions = (classification) => (
    classification.reduce((acc, curr) => ([
        ...acc,
        {
            ...( {title: curr.title ?? curr.unique }),
            color: curr.color,
            value: curr.unique,
            unique: curr.unique
        }
    ]
    ), [])
);

export default ({
    hasAggregateProcess,
    data = { options: {}, autoColorOptions: {} },
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
    sampleChart,
    layer }) => {

    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const customColor = data.autoColorOptions?.name === 'global.colors.custom';
    const { classificationAttribute = undefined } = data?.options || {};
    const { classification = CLASSIFIED_COLORS } = data?.autoColorOptions || {};
    const { defaultClassLabel = '' } = data?.autoColorOptions || {};
    const defaultCustomColor = data?.autoColorOptions?.defaultCustomColor || defaultColorGenerator(1, DEFAULT_CUSTOM_COLOR_OPTIONS)[0] || '#0888A1';
    const discardEmptyClasses = (classifications) => {
        return [classifications.filter(item => !item.unique && !item.value), classifications.filter(item => item.unique && item.value)];
    };

    /** line charts do not support custom colors ATM and blue is preselected */
    useEffect(() => {
        if (data.type === 'line' && (!data?.autoColorOptions?.name || customColor)) {
            onChange("autoColorOptions", {
                name: 'global.colors.blue',
                base: 190,
                range: 20
            });
        }
    }, [data.type]);

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
                            <Col componentClass={ControlLabel} sm={customColor ? 5 : 6}>
                                <Message msgId={getLabelMessageId("colorRamp", data)} />
                            </Col>
                            <Col sm={customColor ? 7 : 6}>
                                <FormGroup>
                                    {customColor && (
                                        <Col xs={2}>
                                            <OverlayTrigger
                                                key="customColors"
                                                placement="top"
                                                overlay={<Tooltip id="wizard-tooltip-customColors"><Message msgId="widgets.builder.wizard.classAttributes.editCustomColors" /></Tooltip>}>
                                                <Button bsSize="sm" className={`custom-color-btn btn btn-default ${data.type}`} onClick={() => setShowModal(true)}>
                                                    <Glyphicon glyph="pencil" />
                                                </Button>
                                            </OverlayTrigger>
                                        </Col>
                                    )}
                                    <Col xs={customColor ? 10 : 12} className={classNames({ 'custom-color': customColor })}>
                                        <ColorRamp
                                            items={getColorRangeItems(data.type, classification, classificationAttribute, defaultCustomColor)}
                                            value={head(getColorRangeItems(data.type, classification, classificationAttribute, defaultCustomColor).filter(c => data.autoColorOptions && c.name === data.autoColorOptions.name ))}
                                            samples={data.type === "pie" ? 5 : 1}
                                            onChange={v => {
                                                onChange("autoColorOptions", {
                                                    ...v.options,
                                                    name: v.name,
                                                    ...(classification ? { classification: formatAutoColorOptions(classification) } : {} ),
                                                    defaultCustomColor: defaultCustomColor ?? '#0888A1'
                                                });
                                                if (!v.custom) {
                                                    onChange("options.classificationAttribute", undefined);
                                                }
                                            }}/>
                                    </Col>
                                </FormGroup>
                            </Col>
                        </FormGroup> : null}

                    <ColorClassModal
                        modalClassName="chart-color-class-modal"
                        show={showModal}
                        onClose={() => {
                            const unfinishedClasses = classification.filter(item => !item.unique || !item.value);
                            if (unfinishedClasses.length > 0 && classificationAttribute) {
                                setShowConfirmModal(true);
                            } else {
                                setShowModal(false);
                            }
                        }}
                        onSaveClassification={() => {
                            setShowModal(false);
                            onChange("autoColorOptions.defaultCustomColor", defaultCustomColor);
                            onChange("options.classificationAttribute", classificationAttribute);
                            if (classificationAttribute) {
                                onChange("autoColorOptions", {
                                    ...data.autoColorOptions,
                                    defaultClassLabel: (defaultClassLabel || ''),
                                    classification: (classification ? formatAutoColorOptions(classification) : [])
                                });
                            }
                        }}
                        onChangeClassAttribute={(value) => {
                            onChange("options.classificationAttribute", value);
                        }}
                        classificationAttribute={classificationAttribute}
                        onUpdateClasses={(newClassification) => {
                            onChange("autoColorOptions.classification", formatAutoColorOptions(newClassification) || []);
                        }}
                        options={options}
                        placeHolder={placeHolder}
                        classification={classification}
                        defaultCustomColor={defaultCustomColor}
                        onChangeColor={(color) => onChange("autoColorOptions.defaultCustomColor", color)}
                        defaultClassLabel={defaultClassLabel}
                        onChangeDefaultClassLabel={(value) => onChange("autoColorOptions.defaultClassLabel", value)}
                        layer={layer}
                        chartType={data.type}
                    />
                    {getConfirmModal(
                        showConfirmModal,
                        () => {setShowConfirmModal(false);},
                        () => {
                            const [emptyClasses, nonEmptyClasses] = discardEmptyClasses(classification);
                            if (emptyClasses.length === classification.length) {
                                onChange("options.classificationAttribute", undefined);
                                onChange("autoColorOptions.classification", CLASSIFIED_COLORS);
                            } else {
                                onChange("autoColorOptions.classification", nonEmptyClasses || []);
                            }
                            setShowConfirmModal(false);
                            setShowModal(false);
                        })}
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
                        ? <ChartAdvancedOptions data={data} classificationAttribute={classificationAttribute} onChange={onChange} />
                        : null}

                </Form>

            </Col>
        </Row>
    );
};
