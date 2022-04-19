/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {Row, Col, Form, FormGroup, ControlLabel} from 'react-bootstrap';
import Select from 'react-select';

import ColorSelector from '../../../../style/ColorSelector';
import Message from '../../../../../components/I18N/Message';
import Portal from '../../../../../components/misc/Portal';
import ResizableModal from '../../../../../components/misc/ResizableModal';
import TextAttributeClassForm from './TextAttributeClassForm';
import RangeAttributeClassForm from './RangeAttributeClassForm';

import uuid from 'uuid';

import { generateRandomHexColor } from '../../../../../utils/ColorUtils';

const ColorClassModal = ({
    modalClassName,
    show,
    onClose,
    onSaveClassification,
    onChangeClassAttribute,
    classificationAttribute,
    classificationAttributeType,
    onUpdateClasses,
    options,
    placeHolder,
    classification,
    rangeClassification,
    defaultCustomColor,
    defaultClassLabel,
    onChangeColor,
    onChangeDefaultClassLabel,
    layer,
    chartType
}) => {
    const [selectMenuOpen, setSelectMenuOpen] = useState(false);
    return (
        <Portal>
            <ResizableModal
                modalClassName={classnames(
                    modalClassName,
                    { 'menu-open': selectMenuOpen || classificationAttribute },
                    { 'text-class': classificationAttributeType === 'string' },
                    { 'range-class': classificationAttributeType === 'number' }
                )}
                title={<Message msgId="widgets.builder.wizard.classAttributes.title" />}
                show={show}
                clickOutEnabled={false}
                showClose={false}
                onClose={() => onClose()}
                buttons={[
                    {
                        className: "btn-cancel",
                        text: <Message msgId="close" />,
                        bsSize: 'sm',
                        onClick: () => onClose()
                    },
                    {
                        className: "btn-save",
                        text: <Message msgId="save" />,
                        bsSize: 'sm',
                        onClick: () => onSaveClassification()
                    }
                ]}>
                <Row xs={12}>
                    <Col componentClass={ControlLabel} xs={6}>
                        <Message msgId={!classificationAttribute ?
                            "widgets.builder.wizard.classAttributes.color" :
                            "widgets.builder.wizard.classAttributes.defaultColor"} />
                    </Col>
                    <Col xs={6}>
                        <ColorSelector
                            key={0}
                            color={defaultCustomColor}
                            disableAlpha
                            format="hex"
                            onChangeColor={(color) => onChangeColor(color)}
                        />
                    </Col>
                </Row>
                <Row xs={12}>
                    <Form id="chart-color-class-form" horizontal>
                        <FormGroup controlId="classificationAttribute" className="chart-color-class-form-group">
                            <Col componentClass={ControlLabel} xs={6}>
                                <Message msgId="widgets.builder.wizard.classAttributes.classificationAttribute" />
                            </Col>
                            <Col xs={6}>
                                <Select
                                    value={classificationAttribute}
                                    options={options}
                                    placeholder={placeHolder}
                                    onChange={ val => {
                                        const value = val && val.value || undefined;
                                        const type = val && val.type || undefined;
                                        onChangeClassAttribute(value, type);
                                    }}
                                    onOpen={() => setSelectMenuOpen(!selectMenuOpen)}
                                    onClose={() => setSelectMenuOpen(!selectMenuOpen)}
                                />
                            </Col>
                        </FormGroup>
                    </Form>
                </Row>
                { classificationAttribute && classificationAttributeType === 'string' ? (
                    <TextAttributeClassForm
                        onUpdateClasses={onUpdateClasses}
                        classification={classification}
                        defaultClassLabel={defaultClassLabel}
                        onChangeDefaultClassLabel={onChangeDefaultClassLabel}
                        layer={layer}
                        chartType={chartType}
                        classificationAttribute={classificationAttribute}
                        classificationAttributeType={classificationAttributeType}
                    />
                ) : classificationAttribute && classificationAttributeType === 'number' ? (
                    <RangeAttributeClassForm
                        onUpdateClasses={onUpdateClasses}
                        chartType={chartType}
                        onChangeDefaultClassLabel={onChangeDefaultClassLabel}
                        defaultClassLabel={defaultClassLabel}
                        rangeClassification={rangeClassification}
                        classificationAttributeType={classificationAttributeType}
                    />
                ) : null }
            </ResizableModal>
        </Portal>
    );
};


ColorClassModal.propTypes = {
    modalClassName: PropTypes.string,
    show: PropTypes.boolean,
    onClose: PropTypes.func,
    onSaveClassification: PropTypes.func,
    onChangeClassAttribute: PropTypes.func,
    classificationAttribute: PropTypes.string,
    onUpdateClasses: PropTypes.func,
    options: PropTypes.array,
    placeHolder: PropTypes.string,
    classification: PropTypes.array,
    rangeClassification: PropTypes.array,
    defaultCustomColor: PropTypes.string,
    defaultClassLabel: PropTypes.string,
    onChangeColor: PropTypes.func,
    onChangeDefaultClassLabel: PropTypes.func
};

ColorClassModal.defaultProps = {
    modalClassName: 'chart-color-class-modal',
    onClose: () => {},
    onSaveClassification: () => {},
    onChangeClassAttribute: () => {},
    classificationAttribute: '',
    onUpdateClasses: () => {},
    options: [],
    classification: [{uuid: uuid.v1(), title: '', color: generateRandomHexColor(), type: 'Polygon', unique: ''}],
    rangeClassification: [{uuid: uuid.v1(), title: '', color: generateRandomHexColor(), type: 'Polygon', min: 0, max: 0}],
    defaultCustomColor: '#0888A1',
    defaultClassLabel: '',
    onChangeColor: () => {},
    onChangeDefaultClassLabel: () => {}
};

export default ColorClassModal;
