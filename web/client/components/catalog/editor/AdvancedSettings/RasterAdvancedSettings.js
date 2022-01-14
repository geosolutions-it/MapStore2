/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useEffect} from 'react';
import {FormGroup, Col, ControlLabel, Checkbox} from "react-bootstrap";
import RS from 'react-select';
import { DEFAULT_FORMAT_WMS } from '../../../../utils/CatalogUtils';
import localizedProps from '../../../misc/enhancers/localizedProps';
const Select = localizedProps('noResultsText')(RS);

import CommonAdvancedSettings from './CommonAdvancedSettings';
import {isNil} from "lodash";
import ReactQuill from "react-quill";

import InfoPopover from '../../../widgets/widget/InfoPopover';
import CSWFilters from "./CSWFilters";
import Message from "../../../I18N/Message";
import WMSDomainAliases from "./WMSDomainAliases";

/**
 * Generates an array of options in the form e.g. [{value: "256", label: "256x256"}]
 * @param {number[]} opts an array of tile sizes
 */
const getTileSizeSelectOptions = (opts) => {
    return opts.map(opt => ({label: `${opt}x${opt}`, value: opt}));
};

/**
 * Raster advanced settings form, used by WMS/CSW
 *
 * **WMS**
 * - localizedLayerStyles: Option if `enabled` allows to include the MapStore's locale in each `GetMap`, `GetLegendGraphic` and `GetFeatureInfo` requests to the server so that the WMS server,
 *  if properly configured, can use that locale. For more info [Localized Style](https://mapstore.readthedocs.io/en/latest/user-guide/catalog/#wmswmts-catalog)
 * - autoSetVisibilityLimits: Option allows to fetch and set visibility limits of the layer from GetCapabilities
 *
 * **CSW**
 * - excludeShowTemplate: Configuration if set to false, displays `metadata template` configurable option
 *  * showTemplate: Options allows the user to insert layer description text with metadata information. For more info [Show metadata template](https://mapstore.readthedocs.io/en/latest/user-guide/catalog/#metadata-templates)
 * - Filters (Option allows user to configure the ogcFilter with custom filtering conditions
 *   *staticFilter: filter to fetch all record applied always i.e even when no search text is present
 *   *dynamicFilter: filter when search text is present and is applied in conjunction with static filter
 *
 * **WMS|CSW**
 * - tileSize: Option allows to select and configure the default tile size of the layer to be requested with
 * - format: Option allows to select and configure the default format of the layer to be requested with
 * - autoload: Option allows automatic fetching of the results upon selecting the service from Service dropdown
 * - hideThumbnail: Options allows to hide the thumbnail on the result
 *
 */
export default ({
    service,
    formatOptions =  DEFAULT_FORMAT_WMS,
    onChangeServiceFormat = () => { },
    onChangeServiceProperty = () => {},
    currentWMSCatalogLayerSize,
    selectedService,
    onFormatOptionsFetch = () => {},
    advancedRasterSettingsStyles = {},
    tileSizeOptions = [256, 512],
    isLocalizedLayerStylesEnabled,
    onChangeMetadataTemplate = () => { },
    onToggleTemplate = () => { },
    ...props
}) => {
    useEffect(() => {
        // Apply default configuration on new service
        service.isNew && onChangeServiceProperty("autoSetVisibilityLimits", props.autoSetVisibilityLimits);
    }, [props.autoSetVisibilityLimits]);

    const tileSelectOptions = getTileSizeSelectOptions(tileSizeOptions);
    return (<CommonAdvancedSettings {...props} onChangeServiceProperty={onChangeServiceProperty} service={service} >
        {(isLocalizedLayerStylesEnabled && !isNil(service.type) ? service.type === "wms" : false) && (<FormGroup controlId="localized-styles" key="localized-styles">
            <Col xs={12}>
                <Checkbox data-qa="service-lacalized-layer-styles-option"
                    onChange={(e) => onChangeServiceProperty("localizedLayerStyles", e.target.checked)}
                    checked={!isNil(service.localizedLayerStyles) ? service.localizedLayerStyles : false}>
                    <Message msgId="catalog.enableLocalizedLayerStyles.label" />&nbsp;<InfoPopover text={<Message msgId="catalog.enableLocalizedLayerStyles.tooltip" />} />
                </Checkbox>
            </Col>
        </FormGroup>)}
        <FormGroup controlId="autoSetVisibilityLimits" key="autoSetVisibilityLimits">
            <Col xs={12}>
                <Checkbox
                    onChange={(e) => onChangeServiceProperty("autoSetVisibilityLimits", e.target.checked)}
                    checked={!isNil(service.autoSetVisibilityLimits) ? service.autoSetVisibilityLimits : false}>
                    <Message msgId="catalog.autoSetVisibilityLimits.label" />&nbsp;<InfoPopover text={<Message msgId="catalog.autoSetVisibilityLimits.tooltip" />} />
                </Checkbox>
            </Col>
        </FormGroup>
        {(!isNil(service.type) ? (service.type === "csw" && !service.excludeShowTemplate) : false) && (<FormGroup controlId="metadata-template" key="metadata-template" className="metadata-template-editor">
            <Col xs={12}>
                <Checkbox
                    onChange={() => onToggleTemplate()}
                    checked={service && service.showTemplate}>
                    <Message msgId="catalog.showTemplate" />
                </Checkbox>
                <br />
            </Col>
            {service && service.showTemplate &&
            (<Col xs={12}>
                <span>
                    <p>
                        <Message msgId="layerProperties.templateFormatInfoAlert2" msgParams={{ attribute: "{ }" }} />
                            &nbsp;&nbsp;

                    </p>
                    <pre>
                        <Message msgId="catalog.templateFormatDescriptionExample" />{" ${ description }"}
                    </pre>
                </span>
            </Col>)}
            <Col xs={12}>
                {service && service.showTemplate && <ReactQuill
                    modules={{
                        toolbar: [
                            [{ "size": ["small", false, "large", "huge"] }, "bold", "italic", "underline", "blockquote"],
                            [{ "list": "bullet" }, { "align": [] }],
                            [{ "color": [] }, { "background": [] }, "clean"], ["link"]
                        ]
                    }}
                    value={service.metadataTemplate || ""}
                    onChange={(metadataTemplate) => {
                        if (metadataTemplate && metadataTemplate !== "<p><br></p>") {
                            onChangeMetadataTemplate(metadataTemplate);
                        } else {
                            // TODO think about this
                            onChangeMetadataTemplate("");
                        }
                    }} />
                }
            </Col>
        </FormGroup>)}
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
        {!isNil(service.type) && service.type === "csw" &&
        <CSWFilters filter={service?.filter} onChangeServiceProperty={onChangeServiceProperty}/>
        }
        {!isNil(service.type) && service.type === "wms" && (<WMSDomainAliases service={service} onChangeServiceProperty={onChangeServiceProperty} />)}
    </CommonAdvancedSettings>);
};
