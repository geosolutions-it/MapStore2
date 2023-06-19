/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import {compose, withProps} from 'recompose';

import { isGeometryType } from '../../../../../utils/ogc/WFS/base';
import AttributeTable from '../../../../data/featuregrid/AttributeTable';
import Message from '../../../../I18N/Message';
import { applyDefaultToLocalizedString } from '../../../../I18N/LocalizedString';
import StepHeader from '../../../../misc/wizard/StepHeader';
import noAttributes from '../common/noAttributesEmptyView';
import Button from '../../../../misc/Button';
import localizedProps from '../../../../misc/enhancers/localizedProps';

const AttributeSelector = compose(
    withProps(({options = {}})=>({
        options: {
            // Parse to allow compatibility for existing table
            propertyName: (options?.propertyName || [])?.map(p => typeof p === "string" ? ({name: p}) : p)
        }
    })),
    withProps(
        ({ attributes = [], options = {}, layer = {}} = {}) => ({ // TODO manage hide condition
            attributes: attributes
                .filter(a => !isGeometryType(a))
                .map( a => {
                    const propertyNames = options?.propertyName?.map(p => p.name);
                    const currPropertyName = options?.propertyName?.find(p => p.name === a.name);
                    const field = layer.fields?.find(f => f.name === a.name);
                    return {
                        ...a,
                        label: applyDefaultToLocalizedString(field?.alias, a.name),
                        attribute: a.name,
                        hide: propertyNames?.indexOf( a.name ) < 0,
                        title: currPropertyName?.title || '',
                        description: currPropertyName?.description || ''
                    };
                })
        })),
    localizedProps("attributes", "label", "object"),
    noAttributes(({ attributes = []}) => attributes.length === 0)
)(AttributeTable);


export default ({ data = { options: {} }, onChange = () => { }, featureTypeProperties, sampleChart, layer}) => (<Row>
    <StepHeader title={<Message msgId={`widgets.builder.wizard.configureTableOptions`} />} />
    <Col xs={12}>
        <div >
            {sampleChart}
        </div>
    </Col>
    <Col xs={12}>
        <Form className="chart-options-form" horizontal>
            <AttributeSelector
                layer={layer}
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
