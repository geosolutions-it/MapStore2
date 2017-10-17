 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {Row, Col, Form, FormGroup, ControlLabel, FormControl} = require('react-bootstrap');
const Message = require('../../../../I18N/Message');
const Select = require('react-select');
const StepHeader = require('../../../../misc/wizard/StepHeader');
const SwitchButton = require('../../../../misc/switch/SwitchButton');


module.exports = ({data = {}, onChange = () => {}, options=[], aggregationOptions = [], sampleChart}) => (<Row>
        <StepHeader title={<Message msgId={`widgets.widgetOptionsTitle`} />} />
          <Col key="sample" xs={12}>
              <div style={{marginBottom: "30px"}}>
                  {sampleChart}
              </div>
              </Col>
          <Col key="form" xs={12}>
            <Form horizontal>
            <FormGroup controlId="groupByAttributes">
              <Col componentClass={ControlLabel} sm={6}>
                <Message msgId={`widgets.title`} />
              </Col>
              <Col sm={6}>
                  <FormControl type="text" onChange={ val => onChange("title", val && val.value)} />
              </Col>
            </FormGroup>

            <FormGroup controlId="aggregationAttribute">
                <Col componentClass={ControlLabel} sm={6}>
                  <Message msgId={`widgets.description`} />
                </Col>
              <Col sm={6}>
                  <FormControl type="text" onChange={ val => onChange("description", val && val.value)} />
              </Col>
          </FormGroup>
          </Form>


  </Col>
</Row>);
