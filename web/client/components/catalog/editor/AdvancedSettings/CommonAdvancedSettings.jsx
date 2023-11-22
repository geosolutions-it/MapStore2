/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { isNil } from 'lodash';
import { FormGroup, Checkbox } from "react-bootstrap";

import Message from "../../../I18N/Message";
import InfoPopover from '../../../widgets/widget/InfoPopover';

/**
 * Common Advanced settings form WMS/CSW/WMTS/WFS
 *
 * - autoload: Option allows the automatic fetching of the results upon selecting the service from Service dropdown
 * - hideThumbnail: Options allows to hide the thumbnail on the result
 *
 */
export default ({
    children,
    service,
    onChangeServiceProperty = () => { },
    onToggleThumbnail = () => { }
}) => (
    <>
        <FormGroup controlId="autoload" key="autoload">
            {service.autoload !== undefined && <Checkbox value="autoload" onChange={(e) => onChangeServiceProperty("autoload", e.target.checked)}
                checked={!isNil(service.autoload) ? service.autoload : false}>
                <Message msgId="catalog.autoload" />
            </Checkbox>}
        </FormGroup>
        <FormGroup controlId="thumbnail" key="thumbnail">
            <Checkbox
                onChange={() => onToggleThumbnail()}
                checked={!isNil(service.hideThumbnail) ? !service.hideThumbnail : true}>
                <Message msgId="catalog.showPreview" />
            </Checkbox>
        </FormGroup>
        {!isNil(service.type) && service.type === "wfs" &&
            <FormGroup controlId="allowUnsecureLayers" key="allowUnsecureLayers">
                <Checkbox
                    onChange={(e) => onChangeServiceProperty("allowUnsecureLayers", e.target.checked)}
                    checked={!isNil(service.allowUnsecureLayers) ? service.allowUnsecureLayers : false}>
                    <Message msgId="catalog.allowUnsecureLayers.label" />&nbsp;<InfoPopover text={<Message msgId="catalog.allowUnsecureLayers.tooltip" />} />
                </Checkbox>
            </FormGroup>}
        {!isNil(service.type) && service.type === "cog" &&
            <FormGroup controlId="fetchMetadata" key="fetchMetadata">
                <Checkbox
                    onChange={(e) => onChangeServiceProperty("fetchMetadata", e.target.checked)}
                    checked={!isNil(service.fetchMetadata) ? service.fetchMetadata : true}>
                    <Message msgId="catalog.fetchMetadata.label" />&nbsp;<InfoPopover text={<Message msgId="catalog.fetchMetadata.tooltip" />} />
                </Checkbox>
            </FormGroup>}
        {children}
    </>
);
