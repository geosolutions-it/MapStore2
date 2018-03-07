/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const WidgetOptions = require('./common/WidgetOptions');
const {wizardHandlers} = require('../../../misc/wizard/enhancers');
const Wizard = wizardHandlers(require('../../../misc/wizard/WizardContainer'));


module.exports = ({
    onChange = () => {}, onFinish = () => {}, setPage= () => {},
    step=0,
    editorData = {}
} = {}) => (
    <Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        hideButtons>
        <WidgetOptions
            key="widget-options"
            data={editorData}
            onChange={onChange}
        />
</Wizard>
    );
