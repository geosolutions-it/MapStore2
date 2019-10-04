/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const { isGeometryType } = require('../../../../../utils/ogc/WFS/base');
const { uniq, castArray, includes } = require('lodash');
const { Row, Col, Form, Button } = require('react-bootstrap');
const Message = require('../../../../I18N/Message');
const StepHeader = require('../../../../misc/wizard/StepHeader');
const noAttributes = require('../common/noAttributesEmptyView');
const {withProps, withHandlers, compose} = require('recompose');
const updatePropertyName = (arr, name, hide) => {
    const names = castArray(name);
    if (hide) {
        return arr.filter(e => !includes(names, e));
    }
    return uniq([...arr, ...names]);
};
const AttributeSelector = compose(
    withProps(
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
    noAttributes(({ attributes = []}) => attributes.length === 0),
    withHandlers({
        onChange: ({ onChange = () => {}, options = {}}) => (name, hide) => onChange("options.propertyName", updatePropertyName(options && options.propertyName || [], name, hide))
    })
)(require('../../../../data/featuregrid/AttributeTable'));


module.exports = ({ data = { options: {} }, onChange = () => { }, featureTypeProperties, sampleChart}) => (<Row>
    <StepHeader title={<Message msgId={`widgets.builder.wizard.configureTableOptions`} />} />
    <Col xs={12}>
        <div >
            {sampleChart}
        </div>
    </Col>
    <Col xs={12}>
        <Form className="chart-options-form" horizontal>
            <AttributeSelector
                options={data.options}
                onChange={onChange}
                attributes={featureTypeProperties}/>
            {data.options && data.options.columnSettings
                ? <Button style={{"float": "right"}} onClick={() => onChange("options.columnSettings", undefined)}><Message msgId="widgets.builder.wizard.resetColumnsSizes" /></Button>
                : null
            }
        </Form>
    </Col>
</Row>);
