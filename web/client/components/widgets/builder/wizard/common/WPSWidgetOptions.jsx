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
import uuid from 'uuid';

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

const CLASSIFIED_COLORS = [{id: uuid.v1(), title: '', color: generateRandomHexColor(), type: 'Polygon', unique: ''}];
const CLASSIFIED_RANGE_COLORS = [{id: uuid.v1(), title: '', color: generateRandomHexColor(), type: 'Polygon', min: 0, max: 0}];

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
const formatAutoColorOptions = (classification, attributeType) => (
    classification.map( classItem => (
        {
            id: classItem.id || uuid.v1(),
            ...( {title: classItem.title ?? classItem.unique }),
            color: classItem.color,
            // if attribute is a string set value and label
            ...(attributeType === 'string' && {
                value: classItem.unique,
                unique: classItem.unique
            }),
            // if attribute is a number set min/max in range
            ...(attributeType === 'number' && {
                max: classItem.max ?? 0,
                min: classItem.min ?? 0
            })
        }
    ))
);

export default ({
    hasAggregateProcess,
    data = { options: {}, autoColorOptions: {} },
    onChange = () => { },
    options = [],
    showTitle = true,
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
    const { classificationAttributeType = undefined } = data?.options || {};
    const { classification = CLASSIFIED_COLORS } = data?.autoColorOptions || {};
    const { rangeClassification = CLASSIFIED_RANGE_COLORS } = data?.autoColorOptions || {};
    /** we keep the two classification types separated in state but color ramp only gets the selected type one */
    const currentClassificationType = classificationAttributeType === 'number' ? rangeClassification : classification;
    const { defaultClassLabel = '' } = data?.autoColorOptions || {};
    const defaultCustomColor = data?.autoColorOptions?.defaultCustomColor || defaultColorGenerator(1, DEFAULT_CUSTOM_COLOR_OPTIONS)[0] || '#0888A1';
    const discardEmptyClasses = (classifications) => {
        return [classifications.filter(item => !item.unique && !item.value), classifications.filter(item => item.unique && item.value)];
    };
    const discardEmptyRangeClasses = (classifications) => {
        return [classifications.filter(item => !item.title.trim()), classifications.filter(item => item.title)];
    };
    const resetEmptyClasses = (emptyClasses, nonEmptyClasses, classifications, classType, currentClassType) => {
        const stateSlice = classType === 'number' ? 'autoColorOptions.rangeClassification' : 'autoColorOptions.classification';
        const resetClass = classType === 'number' ? CLASSIFIED_RANGE_COLORS : CLASSIFIED_COLORS;
        if (emptyClasses.length === classifications.length) {
            onChange(stateSlice, resetClass);
            if (currentClassType === classType) {
                // resets attribute class selection only if current type is selected
                onChange("options.classificationAttribute", undefined);
                onChange("options.classificationAttributeType", undefined);
            }
        } else {
            onChange(stateSlice, nonEmptyClasses || []);
        }
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
            {showTitle && <StepHeader title={<Message msgId={`widgets.chartOptionsTitle`} />} />}
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
                                            items={getColorRangeItems(data.type, currentClassificationType, classificationAttribute, defaultCustomColor)}
                                            value={head(getColorRangeItems(data.type, currentClassificationType, classificationAttribute, defaultCustomColor).filter(c => data.autoColorOptions && c.name === data.autoColorOptions.name ))}
                                            samples={data.type === "pie" ? 5 : 1}
                                            onChange={v => {
                                                onChange("autoColorOptions", {
                                                    ...v.options,
                                                    name: v.name,
                                                    ...(classification ? { classification: formatAutoColorOptions(classification, 'string') } : {} ),
                                                    ...(rangeClassification ? { rangeClassification: formatAutoColorOptions(rangeClassification, 'number') } : {} ),
                                                    defaultCustomColor: defaultCustomColor ?? '#0888A1'
                                                });
                                                if (!v.custom) {
                                                    onChange("options.classificationAttribute", undefined);
                                                    onChange("options.classificationAttributeType", undefined);
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
                            const unfinishedRangeClasses = rangeClassification.filter(item => !item.title);
                            /** only shows confirm modal if current classification type is empty */
                            if (((unfinishedClasses.length > 0 && classificationAttributeType === 'string') ||
                                (unfinishedRangeClasses.length > 0 && classificationAttributeType === 'number')) && classificationAttribute) {
                                setShowConfirmModal(true);
                            } else {
                                setShowModal(false);
                            }
                        }}
                        onSaveClassification={() => {
                            setShowModal(false);
                            onChange("autoColorOptions.defaultCustomColor", defaultCustomColor);
                            onChange("options.classificationAttribute", classificationAttribute);
                            onChange("options.classificationAttributeType", classificationAttributeType);
                            if (classificationAttribute) {
                                onChange("autoColorOptions", {
                                    ...data.autoColorOptions,
                                    defaultClassLabel: (defaultClassLabel || ''),
                                    classification: (classification ? formatAutoColorOptions(classification, 'string') : []),
                                    rangeClassification: (rangeClassification ? formatAutoColorOptions(rangeClassification, 'number') : [])
                                });
                            }
                        }}
                        onChangeClassAttribute={(value, type) => {
                            onChange("options.classificationAttribute", value);
                            onChange("options.classificationAttributeType", type);
                        }}
                        classificationAttribute={classificationAttribute}
                        classificationAttributeType={classificationAttributeType}
                        onUpdateClasses={(newClassification, attributeType) => {
                            if (attributeType === 'number') {
                                onChange("autoColorOptions.rangeClassification", formatAutoColorOptions(newClassification, attributeType) || []);
                            } else {
                                onChange("autoColorOptions.classification", formatAutoColorOptions(newClassification, attributeType) || []);
                            }
                        }}
                        options={options.filter(item => item.type === 'string' || item.type === 'number')}
                        placeHolder={placeHolder}
                        classification={classification}
                        rangeClassification={rangeClassification}
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
                            const [emptyRangeClasses, nonEmptyRangeClasses] = discardEmptyRangeClasses(rangeClassification);
                            /** in case only one unfinished row is left, reset the class attribute selection */
                            resetEmptyClasses(emptyClasses, nonEmptyClasses, classification, 'string', classificationAttributeType);
                            resetEmptyClasses(emptyRangeClasses, nonEmptyRangeClasses, rangeClassification, 'number', classificationAttributeType);
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
