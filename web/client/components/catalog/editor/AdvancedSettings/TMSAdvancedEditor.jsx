/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { isNil } from 'lodash';

import Message from "../../../I18N/Message";
import { FormGroup, Checkbox, Col } from "react-bootstrap";
import InfoPopover from '../../../widgets/widget/InfoPopover';

/**
 * Common Advanced settings form, used by WMS/CSW/WMTS
 */
export default ({
    service,
    onChangeServiceProperty = () => { }
}) => (
    <div>
        <FormGroup controlId="autoload" key="autoload">
            <Col xs={12}>
                <Checkbox value="autoload" onChange={(e) => onChangeServiceProperty("autoload", e.target.checked)}
                    checked={!isNil(service.autoload) ? service.autoload : false}>
                    <Message msgId="catalog.autoload" />
                </Checkbox>
                <Checkbox value="forceDefaultTileGrid" onChange={(e) => onChangeServiceProperty("forceDefaultTileGrid", e.target.checked)}
                    checked={!isNil(service.forceDefaultTileGrid) ? service.forceDefaultTileGrid : false}>
                    <Message msgId="catalog.tms.forceDefaultTileGrid" />&nbsp;<InfoPopover text={<Message msgId="catalog.tms.forceDefaultTileGridDescription" />} />
                </Checkbox>
            </Col>
        </FormGroup>
    </div>);
