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
import { DEFAULT_FORMAT_WMS } from '../../../../utils/CatalogUtils';
import { services } from '../../../../utils/MapInfoUtils';
import localizedProps from '../../../misc/enhancers/localizedProps';
import Message from '../../../I18N/Message';

// TODO: import this from the proper file (the original has something like {HTML: "text/html"})

const DEFAULT_INFO_FORMATS = [{
    label: "DISABLED",
    value: "HTML",
    format: "text/html"
}, {
    label: "HTML",
    value: "HTML",
    format: "text/html"
}, {
    label: "TEXT",
    value: "TEXT",
    format: "text/plain"
}, {
    label: "PROPERTIES",
    value: "PROPERTIES",
    format: "application/json"
}];


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
    formatOptions =  DEFAULT_FORMAT_WMS,
    onChangeServiceFormat = () => { },
    onChangeServiceInfoFormat = () => { },
    onChangeServiceProperty = () => {},
    currentWMSCatalogLayerSize,
    selectedService,
    onFormatOptionsFetch = () => {},
    advancedRasterSettingsStyles = {},
    tileSizeOptions,
    ...props
}) => {
    const tileSelectOptions = getTileSizeSelectOptions(tileSizeOptions);
    const infoFormats = service?.supportedFormats?.infoFormats;
    const infoFormatOptions =  DEFAULT_INFO_FORMATS.filter( ({format}) => {
        if (infoFormats) {
            if (format) {
                return infoFormats.includes(format);
            }

        }
        return true;
    });
    return (<CommonAdvancedSettings {...props} onChangeServiceProperty={onChangeServiceProperty} service={service} >

        <FormGroup style={advancedRasterSettingsStyles} className={"formatStyle"}>
            <Col xs={6}>
                <ControlLabel><Message msgId="catalog.advanced.format" /></ControlLabel>
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
            <Col xs={6}>
                <ControlLabel><Message msgId="catalog.advanced.infoFormat" /></ControlLabel>
            </Col >
            <Col xs={6} style={{marginBottom: '5px'}}>
                <Select
                    id="infoFormats"
                    isLoading={props.formatsLoading}
                    onOpen={() => onFormatOptionsFetch(service.url)}
                    value={service && service.infoFormat}
                    clearable
                    noResultsText={props.formatsLoading
                        ? "catalog.format.loading" : "catalog.format.noOption"}
                    options={infoFormatOptions}
                    onChange={event => onChangeServiceInfoFormat(event && event.value)}
                />
            </Col >
        </FormGroup>
        <FormGroup style={advancedRasterSettingsStyles}>
            <Col xs={6} >
                <ControlLabel><Message msgId="catalog.advanced.WMSLayerTileSize" /></ControlLabel>
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
