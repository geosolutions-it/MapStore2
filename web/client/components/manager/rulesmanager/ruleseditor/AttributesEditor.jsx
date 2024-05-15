/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, { useEffect } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';

import Message from '../../../I18N/Message';
import Select from '../AttributeAccessSelect';

const getAttribute = (name, {attributes = {}}) => {
    return castArray((attributes.attribute || [])).filter(a => a.name === name)[0];
};
const getAttributeValue = (name, constraints) => {
    return (getAttribute(name, constraints) || {}).access || "READWRITE";
};

export default ({attributes = [], constraints = {}, setOption = () => {}, active = false, setEditedAttributes = () => {}, editedAttributes = []}) => {
    const onChange = (at) => {
        let {attributes: {attribute = []} = {}} = constraints ?? {};
        attribute = castArray(attribute).map(attr => at.name === attr.name ? at : attr);
        setOption({key: "attributes", value: {attribute}});
        // add it to edited attribute
        if (!editedAttributes.includes(at.name)) setEditedAttributes(at.name);
    };
    useEffect(() => {
        if (!isEmpty(attributes)) {
            const _constraints = attributes.map(attr => ({name: attr.name, access: "READONLY"}));
            const {attributes: {attribute = []} = {}} = constraints ?? {};
            const modifiedAttribute = _constraints.map(attr => {
                return castArray(attribute).find(a=> a.name === attr.name) ?? attr;
            });
            setOption({key: "attributes", value: {attribute: modifiedAttribute}});
        }
    }, [attributes]);
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
                                className={ editedAttributes.includes(mA.name) ? "highlighted-dd" : ""}
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
