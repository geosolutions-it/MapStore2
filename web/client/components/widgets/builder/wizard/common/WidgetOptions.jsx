/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';
import { ControlLabel, InputGroup, FormControl, FormGroup } from 'react-bootstrap';

import Message from '../../../../I18N/Message';
import StepHeader from '../../../../misc/wizard/StepHeader';

export default ({data = {}, onChange = () => {}, sampleChart, showTitle = true}) => (<>
    {showTitle && <StepHeader title={<Message msgId={`widgets.widgetOptionsTitle`} />} />}
    {sampleChart &&
        <div style={{marginBottom: "30px", padding: 8}}>
            {sampleChart}
        </div>}
    <div className="widget-options-form" >
        <FormGroup controlId="groupByAttributes" className="form-group-flex">
            <ControlLabel>
                <Message msgId={`widgets.title`} />
            </ControlLabel>
            <InputGroup>
                <FormControl value={data.title} type="text" onChange={ e => onChange("title", e.target.value)} />
            </InputGroup>
        </FormGroup>
        <FormGroup controlId="aggregationAttribute" className="form-group-flex">
            <ControlLabel>
                <Message msgId={`widgets.description`} />
            </ControlLabel>
            <InputGroup>
                <FormControl value={data.description} type="text" onChange={ e => onChange("description", e.target.value)} />
            </InputGroup>
        </FormGroup>
    </div>
</>);
