/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Select from "react-select";
import { FormGroup, Col, ControlLabel } from "react-bootstrap";
import CommonAdvancedSettings from './CommonAdvancedSettings';

export default ({
    service,
    formatOptions,
    onChangeServiceFormat = () => { },
    ...props
}) => {
    return (<CommonAdvancedSettings service={service} {...props}>
        <FormGroup style={{ display: 'flex', alignItems: 'center', paddingTop: 15, borderTop: '1px solid #ddd' }}>
            <Col xs={6}>
                <ControlLabel>Format</ControlLabel>
            </Col >
            <Col xs={6}>
                <Select
                    value={service && service.format}
                    clearable
                    options={formatOptions}
                    onChange={event => onChangeServiceFormat(event && event.value)} />
            </Col >
        </FormGroup>
    </CommonAdvancedSettings>);
};
