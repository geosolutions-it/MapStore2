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
const ColorRangeSelector = require('../../../../style/ColorRangeSelector');
const StepHeader = require('../../../../misc/wizard/StepHeader');
const SwitchButton = require('../../../../misc/switch/SwitchButton');


module.exports = ({data = {options: {}}, onChange = () => {}, options=[], aggregationOptions = [], sampleChart}) => (<Row>
        <StepHeader title={<Message msgId={`widgets.chartOptionsTitle`} />} />
          <Col xs={12}>
              <div style={{marginBottom: "30px"}}>
                  {sampleChart}
              </div>
              </Col>
          <Col xs={12}>
          <Form horizontal>
        <FormGroup controlId="groupByAttributes" className="mapstore-block-width">
          <Col componentClass={ControlLabel} sm={6}>
            <Message msgId={`widgets.groupByAttributes.${data.type}`} />
          </Col>
          <Col sm={6}>
              <Select
                  value={data.options && data.options.groupByAttributes}
                  options={options}
                  placeholder={'Select attribute'}
                  onChange={(val) => {
                      onChange("options.groupByAttributes", val && val.value);
                  }}
                  />
          </Col>
        </FormGroup>

        <FormGroup controlId="aggregationAttribute" className="mapstore-block-width">
            <Col componentClass={ControlLabel} sm={6}>
              <Message msgId={`widgets.aggregationAttribute.${data.type}`} />
            </Col>
          <Col sm={6}>
              <Select
                  value={data.options && data.options.aggregationAttribute}
                  options={options}
                  placeholder={'Select attribute'}
                  onChange={(val) => {
                      onChange("options.aggregationAttribute", val && val.value);
                  }}
                  />
          </Col>
        </FormGroup>
        <FormGroup controlId="aggregateFunction" className="mapstore-block-width">
            <Col componentClass={ControlLabel} sm={6}>
              <Message msgId={`widgets.aggregateFunction.${data.type}`} />
            </Col>
          <Col sm={6}>
              <Select
                  value={data.options && data.options.aggregateFunction}
                  options={aggregationOptions}
                  placeholder={'Select attribute'}
                  onChange={(val) => {
                      onChange("options.aggregateFunction", val && val.value);
                  }}
                  />
          </Col>
        </FormGroup>
        <FormGroup controlId="colorRamp" className="mapstore-block-width">
            <Col componentClass={ControlLabel} sm={6}>
              <Message msgId={`widgets.colorRamp.${data.type}`} />
            </Col>
          <Col sm={6}>
              <ColorRangeSelector value={data.autoColorOptions} onChange={v => onChange("autoColorOptions", v.options)}/>
          </Col>
        </FormGroup>
        <FormGroup controlId="mapSync" className="mapstore-block-width">
            <Col componentClass={ControlLabel} sm={6}>
              <Message msgId={`widgets.mapSync.${data.type}`} />
            </Col>
          <Col sm={6}>
              <SwitchButton
                  checked={data.mapSync}
                  onChange={(val) => {
                      onChange("mapSync", val);
                  }}
                  />
          </Col>
        </FormGroup>
        <FormGroup controlId="displayLegend">
            <Col componentClass={ControlLabel} sm={6}>
              <Message msgId={`widgets.displayLegend.${data.type}`} />
            </Col>
          <Col sm={6}>
              <SwitchButton
                  checked={data.legend}
                  onChange={(val) => {
                      onChange("legend", val);
                  }}
                  />
          </Col>
        </FormGroup>
      </Form>


  </Col>
</Row>);
