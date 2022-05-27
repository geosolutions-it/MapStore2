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
                .concat(
                    (options?.propertyName || [])
                        .filter((item) => attributes.findIndex(e => e.name === item) < 0)
                        .map(i => ({ name: i, error: true }))
                )
                .map( a => ({
                    ...a,
                    label: a.name,
                    attribute: a.name,
                    hide: options.propertyName && (options.propertyName.indexOf( a.name ) < 0)
                })
                )
        })),
    noAttributes(({ attributes = []}) => attributes.filter(a => !a.error).length === 0),
    withHandlers({
        onChange: ({ onChange = () => {}, options = {}, attributes = {}, sortOptions = null}) => (name, hide) => {
            onChange("options.propertyName", updatePropertyName(options && options.propertyName || [], name, hide));
            if (!attributes.find(a => a.name === name) && sortOptions?.sortBy === name[0] && hide) {
                onChange('sortOptions', undefined);
            }
        }
    })
)(AttributeTable);


export default ({ data = { options: {}, sortOptions: null }, onChange = () => { }, featureTypeProperties, sampleChart}) => (<Row>
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
                attributes={featureTypeProperties}
                sortOptions={data.sortOptions}
            />
            {data.options && data.options.columnSettings
                ? <Button style={{"float": "right"}} onClick={() => onChange("options.columnSettings", undefined)}><Message msgId="widgets.builder.wizard.resetColumnsSizes" /></Button>
                : null
            }
        </Form>
    </Col>
</Row>);
