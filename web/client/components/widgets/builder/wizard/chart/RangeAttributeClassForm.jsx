import React  from 'react';
import PropTypes from 'prop-types';
import {Row, Col, FormControl, ControlLabel} from 'react-bootstrap';
import Message from '../../../../../components/I18N/Message';

import ThemaClassesEditor from '../../../../style/ThemaClassesEditor';


import DisposablePopover from '../../../../misc/popover/DisposablePopover';
import HTML from '../../../../I18N/HTML';

const getLabelPopover = (placement, chartType) => (
    <DisposablePopover
        popoverClassName="chart-color-class-popover"
        placement={placement}
        title={<Message msgId="widgets.builder.wizard.classAttributes.customLabels" />}
        text={<HTML msgId={`widgets.builder.wizard.classAttributes.${chartType}ChartCustomLabelsExample`} />}
    />
);

const RangeAttributeClassForm = ({
    onUpdateClasses,
    rangeClassification,
    defaultClassLabel,
    onChangeDefaultClassLabel,
    chartType,
    classificationAttributeType
}) => {
    return (
        <>
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
            <Row>
                <Col xs={12}>
                    <Col xs={3}><Message msgId="widgets.builder.wizard.classAttributes.classColor"/></Col>
                    <Col xs={3}><Message msgId="widgets.builder.wizard.classAttributes.minValue"/></Col>
                    <Col xs={3}><Message msgId="widgets.builder.wizard.classAttributes.maxValue"/></Col>
                    <Col xs={3}><Message msgId="widgets.builder.wizard.classAttributes.classLabel"/>
                        {getLabelPopover('right', chartType)}
                    </Col>
                </Col>
            </Row>
            <ThemaClassesEditor
                noEmptyIndex
                classification={rangeClassification}
                onUpdateClasses={(newClassification) => onUpdateClasses(newClassification, classificationAttributeType)}
                allowEmpty={false}
                customLabels
                usePresetColors
                dropUpMenu
            />
        </>
    );
};

export default RangeAttributeClassForm;
