 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {head} = require('lodash');
const {Row, Col, Form, FormGroup, ControlLabel} = require('react-bootstrap');
const Message = require('../../../../I18N/Message');
const Select = require('react-select');
const ColorRangeSelector = require('../../../../style/ColorRangeSelector');
const StepHeader = require('../../../../misc/wizard/StepHeader');
const SwitchButton = require('../../../../misc/switch/SwitchButton');
const COLORS = [{
    name: 'global.colors.random',
    schema: 'qualitative',
    options: {base: 190, range: 360, options: {}}
}, {
    name: 'global.colors.blue',
    schema: 'sequencial',
    options: {base: 190, range: 20}
}, {
    name: 'global.colors.red',
    schema: 'sequencial',
    options: {base: 10, range: 4}
}, {
    name: 'global.colors.green',
    schema: 'sequencial',
    options: {base: 120, range: 4}
}, {
    name: 'global.colors.brown',
    schema: 'sequencial',
    options: {base: 30, range: 4}
}, {
    name: 'global.colors.purple',
    schema: 'sequencial',
    options: {base: 300, range: 4}
}];


const getColorRangeItems = (type) => {
    if ( type !== "pie") {
        return COLORS.filter( c => c.schema !== 'qualitative');
    }
    return COLORS;
};

module.exports = ({data = {options: {}}, onChange = () => {}, options=[], aggregationOptions = [], sampleChart}) => (<Row>
        <StepHeader title={<Message msgId={`widgets.chartOptionsTitle`} />} />
          <Col xs={12}>
              <div style={{marginBottom: "30px"}}>
                  {sampleChart}
              </div>
              </Col>
          <Col xs={12}>
          <Form className="chart-options-form" horizontal>
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
              <ColorRangeSelector
                  items={getColorRangeItems(data.type)}
                  value={head(getColorRangeItems(data.type).filter(c => data.autoColorOptions && c.name === data.autoColorOptions.name ))}
                  samples={data.type === "pie" ? 5 : 1}
                  onChange={v => {onChange("autoColorOptions", {...v.options, name: v.name}); }}/>
          </Col>
        </FormGroup>
        <FormGroup controlId="mapSync" className="mapstore-block-width">
            <Col componentClass={ControlLabel} sm={6}>
              <Message msgId={`widgets.mapSync`} />
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
