/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import { castArray, includes, uniq } from 'lodash';
import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import {compose, withHandlers, withProps} from 'recompose';

import { isGeometryType } from '../../../../../utils/ogc/WFS/base';
import AttributeTable from '../../../../data/featuregrid/AttributeTable';
import Message from '../../../../I18N/Message';
import StepHeader from '../../../../misc/wizard/StepHeader';
import noAttributes from '../common/noAttributesEmptyView';
import Button from '../../../../misc/Button';

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
)(AttributeTable);


export default ({ data = { options: {} }, onChange = () => { }, featureTypeProperties, sampleChart}) => (<Row>
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
