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
        <FormGroup style={{ display: 'flex', alignItems: 'center', paddingTop: 15, borderTop: '1px solid #ddd' }}>
            <Col xs={6}>
                <ControlLabel>Layer tile size</ControlLabel>
            </Col >
            <Col xs={6}>
                <Select
                    defaultValue={{label: "256x256", value: "256px"}}
                    value={{label: "256x256", value: "256px"}}
                    options={[{label: "256x256", value: "256px"}, {label: "512x512", value: "512px"}]}
                    onChange={() => {}} />
            </Col >
        </FormGroup>
    </CommonAdvancedSettings>);
};
