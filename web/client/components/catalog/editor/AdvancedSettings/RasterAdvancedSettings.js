/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { FormGroup, Col, ControlLabel } from "react-bootstrap";
import RS from 'react-select';
import localizedProps from '../../../misc/enhancers/localizedProps';
const Select = localizedProps('noResultsText')(RS);

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
    formatOptions =  [{
        label: 'image/png',
        value: 'image/png'
    }, {
        label: 'image/png8',
        value: 'image/png8'
    }, {
        label: 'image/jpeg',
        value: 'image/jpeg'
    }, {
        label: 'image/vnd.jpeg-png',
        value: 'image/vnd.jpeg-png'
    }, {
        label: 'image/gif',
        value: 'image/gif'
    }],
    onChangeServiceFormat = () => { },
    onChangeServiceProperty = () => {},
    currentWMSCatalogLayerSize,
    selectedService,
    onFormatOptionsFetch = () => {},
    advancedRasterSettingsStyles = {},
    tileSizeOptions,
    ...props
}) => {
    const tileSelectOptions = getTileSizeSelectOptions(tileSizeOptions);
    return (<CommonAdvancedSettings {...props} onChangeServiceProperty={onChangeServiceProperty} service={service} >
        <FormGroup style={advancedRasterSettingsStyles}>
            <Col xs={6}>
                <ControlLabel>Format</ControlLabel>
            </Col >
            <Col xs={6} style={{marginBottom: '5px'}}>
                <Select
                    isLoading={props.formatsLoading}
                    onOpen={() => onFormatOptionsFetch(service.url)}
                    value={service && service.format}
                    clearable
                    noResultsText={props.formatsLoading
                        ? "catalog.format.loading" : "catalog.format.noOption"}
                    options={props.formatsLoading ? [] : formatOptions}
                    onChange={event => onChangeServiceFormat(event && event.value)} />
            </Col >
        </FormGroup>
        <FormGroup style={advancedRasterSettingsStyles}>
            <Col xs={6} >
                <ControlLabel>WMS Layer tile size</ControlLabel>
            </Col >
            <Col xs={6} style={{marginBottom: '5px'}}>
                <Select
                    value={getTileSizeSelectOptions([service.layerOptions?.tileSize || 256])[0]}
                    options={tileSelectOptions}
                    onChange={event => onChangeServiceProperty("layerOptions", { tileSize: event && event.value })} />
            </Col >
        </FormGroup>
    </CommonAdvancedSettings>);
};
