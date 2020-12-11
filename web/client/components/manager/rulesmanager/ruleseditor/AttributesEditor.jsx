/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { castArray } from 'lodash';
import React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';

import Message from '../../../I18N/Message';
import Select from '../AttributeAccessSelect';

const getAttribute = (name, {attributes = {}}) => {
    return castArray((attributes.attribute || [])).filter(a => a.name === name)[0];
};
const getAttributeValue = (name, constraints) => {
    return (getAttribute(name, constraints) || {}).access || "READWRITE";
};

export default ({attributes = [], constraints = {}, setOption = () => {}, active = false}) => {
    const onChange = (at) => {
        const {attributes: attrs} = constraints;
        const attribute = (attrs && attrs.attribute || []).filter(e => e.name !== at.name).concat(at);
        setOption({key: "attributes", value: {attribute}});
    };
    return (
        <Grid className="ms-rule-editor" fluid style={{ width: '100%', display: active ? 'block' : 'none'}}>
            <Row>
                <Col sm={4}>
                    <strong><Message msgId="layerProperties.name"/></strong>
                </Col>
                <Col sm={4}>
                    <strong><Message msgId="uploader.type"/></strong>
                </Col>
                <Col sm={4}>
                    <strong><Message msgId="rulesmanager.rule"/></strong>
                </Col>
            </Row>
            <hr/>
            {attributes.map(mA => {
                return (
                    <Row key={mA.name}>
                        <Col sm={4}>
                            {mA.name}
                        </Col>
                        <Col sm={4}>
                            <pre>{mA.localType}</pre>
                        </Col>
                        <Col sm={4}>
                            <Select
                                attribute={mA}
                                onChange={onChange}
                                value={getAttributeValue(mA.name, constraints)}
                            />
                        </Col>
                    </Row>
                );
            })}
        </Grid>
    );
};
