/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import {wizardHandlers} from '../../../misc/wizard/enhancers';
import WizardContainer from '../../../misc/wizard/WizardContainer';
import TextOptions from './text/TextOptions';

const Wizard = wizardHandlers(WizardContainer);


export default ({
    onChange = () => {}, onFinish = () => {}, setPage = () => {},
    step = 0,
    editorData = {}
} = {}) => (
    <Wizard
        step={step}
        setPage={setPage}
        onFinish={onFinish}
        hideButtons>
        <TextOptions
            key="widget-options"
            data={editorData}
            onChange={onChange}
        />
    </Wizard>
);
