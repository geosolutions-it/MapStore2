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
import {Row, Col, Form, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import Select from 'react-select';

import ColorSelector from '../../../../style/ColorSelector';
import Message from '../../../../../components/I18N/Message';
import Portal from '../../../../../components/misc/Portal';
import ResizableModal from '../../../../../components/misc/ResizableModal';
import ThemaClassesEditor from '../../../../style/ThemaClassesEditor';

import DisposablePopover from '../../../../misc/popover/DisposablePopover';
import HTML from '../../../../I18N/HTML';

import { generateRandomHexColor } from '../../../../../utils/ColorUtils';

const getLabelPopover = (placement, chartType) => (
    <DisposablePopover
        popoverClassName="chart-color-class-popover"
        placement={placement}
        title={<Message msgId="widgets.builder.wizard.classAttributes.customLabels" />}
        text={<HTML msgId={`widgets.builder.wizard.classAttributes.${chartType}ChartCustomLabelsExample`} />}
    />
);

const ColorClassModal = ({
    modalClassName,
    show,
    onClose,
    onSaveClassification,
    onChangeClassAttribute,
    classificationAttribute,
    onUpdateClasses,
    options,
    placeHolder,
    classification,
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
                modalClassName={classnames(modalClassName, { 'menu-open': selectMenuOpen || classificationAttribute })}
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
                                        onChangeClassAttribute(value);
                                    }}
                                    onOpen={() => setSelectMenuOpen(!selectMenuOpen)}
                                    onClose={() => setSelectMenuOpen(!selectMenuOpen)}
                                />
                            </Col>
                        </FormGroup>
                    </Form>
                </Row>
                { classificationAttribute &&
                    <Row xs={12}>
                        <Col componentClass={ControlLabel} xs={6}>
                            <Message msgId="widgets.builder.wizard.classAttributes.defaultClassLabel" />
                            {getLabelPopover('top', chartType)}
                        </Col>
                        <Col xs={6}>
                            <FormControl
                                value={defaultClassLabel}
                                type="text"
                                onChange={e => onChangeDefaultClassLabel(e.target.value)}
                            />
                        </Col>
                    </Row>
                }
                <Row xs={12}>
                    <Col xs={12}>
                        { classificationAttribute &&
                        <>
                            <Row xs={12}>
                                <Col xs={4}><Message msgId="widgets.builder.wizard.classAttributes.classColor"/></Col>
                                <Col xs={4}><Message msgId="widgets.builder.wizard.classAttributes.classValue"/></Col>
                                <Col xs={4}><Message msgId="widgets.builder.wizard.classAttributes.classLabel"/>
                                    {getLabelPopover('right', chartType)}
                                </Col>
                            </Row>
                            <ThemaClassesEditor
                                noEmptyIndex
                                classification={classification}
                                onUpdateClasses={(newClassification) => onUpdateClasses(newClassification)}
                                allowEmpty={false}
                                customLabels
                                uniqueValuesClasses
                                autoCompleteOptions={{
                                    classificationAttribute,
                                    dropUpAutoComplete: true,
                                    layer
                                }}
                                dropUpMenu
                                usePreSetColors
                            />
                        </>
                        }
                    </Col>
                </Row>
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
    classification: [{title: '', color: generateRandomHexColor(), type: 'Polygon', unique: ''}],
    defaultCustomColor: '#0888A1',
    defaultClassLabel: '',
    onChangeColor: () => {},
    onChangeDefaultClassLabel: () => {}
};

export default ColorClassModal;
