 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const { isGeometryType } = require('../../../../../utils/ogc/WFS/base');
const {uniq} = require('lodash');
const {Row, Col, Form, FormGroup, ControlLabel} = require('react-bootstrap');
const Message = require('../../../../I18N/Message');
const StepHeader = require('../../../../misc/wizard/StepHeader');
const SwitchButton = require('../../../../misc/switch/SwitchButton');

const {withProps, withHandlers, compose} = require('recompose');
const updatePropertyName = (arr, name, hide) => {
    if (hide) {
        return arr.filter(e => !(e === name));
    }
    return uniq([...arr, name]);
};
const AttributeSelector = compose(withProps(
    ({ attributes = [], options = {}} = {}) => ({ // TODO manage hide condition
        attributes: attributes
            .filter(a => !isGeometryType(a))
            .map( a => ({
                ...a,
                label: a.name,
                attribute: a.name,
                hide: options.propertyName && (options.propertyName.indexOf( a.name ) < 0)
            })
        )
    })),
    withHandlers({
        onChange: ({ onChange = () => {}, options = {}}) => (name, hide) => onChange("options.propertyName", updatePropertyName(options && options.propertyName || [], name, hide))
    })
)(require('../../../../data/featuregrid/AttributeSelector'));


module.exports = ({ data = { options: {} }, onChange = () => { }, dependencies, featureTypeProperties, sampleChart}) => (<Row>
        <StepHeader title={<Message msgId={`widgets.tableOptionsTitle`} />} />
          <Col xs={12}>
              <div style={{marginBottom: "30px"}}>
                  {sampleChart}
              </div>
              </Col>
          <Col xs={12}>
          <Form className="chart-options-form" horizontal>
        {dependencies && dependencies.viewport
            ? (<FormGroup controlId="mapSync" className="mapstore-block-width">
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
        </FormGroup>)
            : null}
            <AttributeSelector
                options={data.options}
                onChange={onChange}
                attributes={featureTypeProperties}/>
      </Form>
  </Col>
</Row>);
