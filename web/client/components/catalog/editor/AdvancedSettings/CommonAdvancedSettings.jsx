/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { isNil } from 'lodash';
import { FormGroup, Checkbox, Col } from "react-bootstrap";

import Message from "../../../I18N/Message";

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
    <div>
        <FormGroup controlId="autoload" key="autoload">
            <Col xs={12}>
                {service.autoload !== undefined && <Checkbox value="autoload" onChange={(e) => onChangeServiceProperty("autoload", e.target.checked)}
                    checked={!isNil(service.autoload) ? service.autoload : false}>
                    <Message msgId="catalog.autoload" />
                </Checkbox>}
            </Col>
        </FormGroup>
        <FormGroup controlId="thumbnail" key="thumbnail">
            <Col xs={12}>
                <Checkbox
                    onChange={() => onToggleThumbnail()}
                    checked={!isNil(service.hideThumbnail) ? !service.hideThumbnail : true}>
                    <Message msgId="catalog.showPreview" />
                </Checkbox>
            </Col>
        </FormGroup>
        {children}
    </div>
);
