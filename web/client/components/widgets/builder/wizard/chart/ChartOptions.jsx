 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {Row, Col, Form, FormGroup, ControlLabel} = require('react-bootstrap');
const Message = require('../../../../I18N/Message');
const Select = require('react-select');
const StepHeader = require('../../../../misc/wizard/StepHeader');


module.exports = ({data = {}, onChange = () => {}, options=[], aggregationOptions = [], sampleChart}) => (<Row>
        <StepHeader title={"Select attirbutes"} description="Select attrbutes and aggregations" />
          <Col xs={12}>
              <div>
                  {sampleChart}
              </div>
              </Col>
          <Col xs={12}>
              <Form horizontal>
        <FormGroup controlId="groupByAttributes">
          <Col componentClass={ControlLabel} sm={4}>
            <Message msgId={`widgets.groupByAttributes.${data.type}`} />
          </Col>
          <Col sm={8}>
              <Select
                  value={data.groupByAttributes}
                  options={options}
                  placeholder={'Select attribute'}
                  onChange={(val) => {
                      onChange("groupByAttributes", val && val.value);
                  }}
                  />
          </Col>
        </FormGroup>

        <FormGroup controlId="aggregationAttribute">
            <Col componentClass={ControlLabel} sm={4}>
              <Message msgId={`widgets.aggregationAttribute.${data.type}`} />
            </Col>
          <Col sm={8}>
              <Select
                  value={data.aggregationAttribute}
                  options={options}
                  placeholder={'Select attribute'}
                  onChange={(val) => {
                      onChange("aggregationAttribute", val && val.value);
                  }}
                  />
          </Col>
        </FormGroup>
        <FormGroup controlId="aggregateFunction">
            <Col componentClass={ControlLabel} sm={4}>
              <Message msgId={`widgets.aggregateFunction.${data.type}`} />
            </Col>
          <Col sm={8}>
              <Select
                  value={data.aggregateFunction}
                  options={aggregationOptions}
                  placeholder={'Select attribute'}
                  onChange={(val) => {
                      onChange("aggregateFunction", val && val.value);
                  }}
                  />
          </Col>
        </FormGroup>
      </Form>


  </Col>
</Row>);
