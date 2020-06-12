/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {compose} = require('recompose');
const emptyState = require('../../../misc/enhancers/emptyState');

const {wizardHandlers} = require('../../../misc/wizard/enhancers');
const {Row, Col} = require('react-bootstrap');
const legendWidget = require('../../enhancers/legendWidget');

const WidgetOptions = require('./common/WidgetOptions');
const Wizard = wizardHandlers(require('../../../misc/wizard/WizardContainer'));
const StepHeader = require('../../../misc/wizard/StepHeader');
const Message = require('../../../I18N/Message');
const emptyLegendState = require('../../enhancers/emptyLegendState');

const enhancePreview = compose(
    legendWidget,
    emptyState(
        ({valid}) => !valid,
        {
            title: <Message msgId="widgets.builder.errors.noMapAvailableForLegend" />,
            description: <Message msgId="widgets.builder.errors.noMapAvailableForLegendDescription" />
        }
    ),
    emptyLegendState(false)
);
const LegendPreview = enhancePreview(require('../../widget/LegendView'));
module.exports = ({
    onChange = () => {}, onFinish = () => {}, setPage = () => {},
    step = 0,
    dependencies,
    valid,
    data = {},
    currentLocale,
    language
} = {}) => (
    <Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        hideButtons>
        <Row>
            <StepHeader title={<Message msgId={`widgets.builder.wizard.preview`} />} />
            <Col xs={12}>
                <div style={{ marginBottom: "30px" }}>
                    <LegendPreview
                        valid={valid}
                        dependencies={dependencies}
                        dependenciesMap={data.dependenciesMap}
                        key="widget-options"
                        onChange={onChange}
                        currentLocale={currentLocale}
                        language={language}
                    />
                </div>
            </Col>
        </Row>
        <WidgetOptions
            key="widget-options"
            onChange={onChange}
        />
    </Wizard>
);
