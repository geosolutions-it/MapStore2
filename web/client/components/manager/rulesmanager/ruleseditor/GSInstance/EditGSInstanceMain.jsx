/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';

import { Grid, Row, Col, FormControl } from 'react-bootstrap';
import Message from '../../../../I18N/Message';
import { getMessageById } from '../../../../../utils/LocaleUtils';
import PropTypes from 'prop-types';


const EditGSInstanceMain = ({instance = {}, setOption = () => {}, active = true, isCreateNew}, context) => {
    const handleChange = (event) => {
        setOption({key: event.target.name, value: event.target.value});
    };
    return (
        <Grid className="ms-rule-editor" fluid style={{width: '100%', display: active ? 'block' : 'none'}}>
            {/* GS Name */}
            <Row>
                <Col xs={12} sm={4}>
                    <Message msgId="rulesmanager.gsInstanceInputs.name"/>
                </Col>
                <Col xs={12} sm={8}>
                    <FormControl
                        placeholder={getMessageById(context.messages, "rulesmanager.placeholders.gsInstanceName")}
                        key="name"
                        type="text"
                        name="name"
                        value={instance.name}
                        disabled={!isCreateNew}
                        autoComplete="name"
                        onChange={handleChange} />
                </Col>
            </Row>
            {/* GS Description */}
            <Row>
                <Col xs={12} sm={4}>
                    <Message msgId="rulesmanager.gsInstanceInputs.description"/>
                </Col>
                <Col xs={12} sm={8}>
                    <FormControl
                        placeholder={getMessageById(context.messages, "rulesmanager.placeholders.gsInstanceDescription")}
                        key="description"
                        type="text"
                        value={instance.description}
                        name="description"
                        autoComplete="description"
                        onChange={handleChange} />
                </Col>
            </Row>
            {/* GS URL */}
            <Row>
                <Col xs={12} sm={4}>
                    <Message msgId="rulesmanager.gsInstanceInputs.url"/>
                </Col>
                <Col xs={12} sm={8}>
                    <FormControl
                        placeholder={getMessageById(context.messages, "rulesmanager.placeholders.gsInstanceURL")}
                        key="baseURL"
                        value={instance.baseURL || instance.url}
                        type="text"
                        name="baseURL"
                        autoComplete="baseURL"
                        onChange={handleChange} />
                </Col>
            </Row>
            {isCreateNew && <>
                {/* GS user name */}
                <Row>
                    <Col xs={12} sm={4}>
                        <Message msgId="rulesmanager.gsInstanceInputs.username"/>
                    </Col>
                    <Col xs={12} sm={8}>
                        <FormControl
                            key="username"
                            placeholder={getMessageById(context.messages, "rulesmanager.placeholders.gsInstanceUsername")}
                            type="text"
                            name="username"
                            autoComplete="username"
                            onChange={handleChange} />
                    </Col>
                </Row>
                {/* GS password */}
                <Row>
                    <Col xs={12} sm={4}>
                        <Message msgId="rulesmanager.gsInstanceInputs.password"/>
                    </Col>
                    <Col xs={12} sm={8}>
                        <FormControl
                            key="password"
                            placeholder={getMessageById(context.messages, "rulesmanager.placeholders.gsInstancePassword")}
                            type="text"
                            name="password"
                            autoComplete="password"
                            onChange={handleChange} />
                    </Col>
                </Row>
            </>}
        </Grid>
    );
};
EditGSInstanceMain.contextTypes = {
    messages: PropTypes.object
};
export default EditGSInstanceMain;
