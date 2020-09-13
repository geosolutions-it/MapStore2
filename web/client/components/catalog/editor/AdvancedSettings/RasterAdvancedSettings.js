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

/**
 * Generates an array of options in the form e.g. [{value: "256", label: "256x256"}]
 * @param {number[]} opts an array of tile sizes
 */
const getTileSizeSelectOptions = (opts) => {
    return opts.map(opt => ({label: `${opt}x${opt}`, value: opt}));
};

export default ({
    service,
    formatOptions,
    onChangeServiceFormat = () => { },
    onChangeServiceProperty = () => {},
    tileSizeOptions,
    currentWMSCatalogLayerSize,
    selectedService,
    ...props
}) => {
    const tileSelectOptions = getTileSizeSelectOptions(tileSizeOptions);
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
                <ControlLabel>WMS Layer tile size</ControlLabel>
            </Col >
            <Col xs={6}>
                <Select
                    value={getTileSizeSelectOptions([service.layerOptions?.tileSize || 256])[0]}
                    options={tileSelectOptions}
                    onChange={event => onChangeServiceProperty("layerOptions", { tileSize: event && event.value })} />
            </Col >
        </FormGroup>
    </CommonAdvancedSettings>);
};
